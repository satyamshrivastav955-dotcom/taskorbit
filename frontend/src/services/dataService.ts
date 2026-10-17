import {
  getDoc,
  updateDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { onIdTokenChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './api';
import { uploadFiles } from './uploads';
import type {
  Project,
  Task,
  UserProfile,
  Submission,
  Review,
  AppNotification,
  ActivityLog,
  ConflictDetail,
  Requirement,
  Role,
  ClientFeedback,
} from '../types';

export interface UserSettings {
  timezone: string;
  dateFormat: 'in' | 'us';
  compactMode: boolean;
  emailDigests: boolean;
  reviewAlerts: boolean;
  conflictAlerts: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  timezone: 'Asia/Kolkata',
  dateFormat: 'in',
  compactMode: false,
  emailDigests: true,
  reviewAlerts: true,
  conflictAlerts: true,
};

const SETTINGS_CACHE_KEY = 'taskorbit_settings_cache';

function readSettingsCache(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (raw !== null) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<UserSettings>) };
  } catch {
    // Corrupt cache falls back to defaults.
  }
  return { ...DEFAULT_SETTINGS };
}

function tsToIso(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  if (v !== null && typeof v === 'object' && typeof (v as { toDate?: unknown }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function deriveProgress(status: string, subtasks: unknown): number {
  if (status === 'approved') return 100;
  if (!Array.isArray(subtasks) || subtasks.length === 0) return 0;
  return Math.round(100 * subtasks.filter((item: unknown) => item !== null && typeof item === 'object' && (item as { completed?: unknown }).completed === true).length / subtasks.length);
}

export interface CreateTaskResult {
  task: Task;
  conflicts: ConflictDetail[];
}

class DataStore {
  private projects: Project[] = [];
  private rawProjectDocs: Array<{ id: string; data: () => unknown }> = [];
  private tasks: Task[] = [];
  private users: UserProfile[] = [];
  private requirements: Requirement[] = [];
  private submissions: Submission[] = [];
  private reviews: Review[] = [];
  private notifications: AppNotification[] = [];
  private activities: ActivityLog[] = [];
  private feedbacks: ClientFeedback[] = [];
  private documents: Array<Record<string, unknown>> = [];
  private listeners: (() => void)[] = [];
  private unsubs: Array<() => void> = [];
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private bootedUid: string | null = null;
  private loading = true;
  private error = '';
  private workspaceLoader: (() => Promise<void>) | null = null;
  private bootKey = '';
  private me: { uid: string; email: string; name: string; role: Role } = {
    uid: '',
    email: '',
    name: '',
    role: 'client',
  };
  private settings: UserSettings = readSettingsCache();
  private seenUnread: Set<string> = new Set();

  constructor() {
    this.applyDensity();
    window.addEventListener('taskorbit:mutated', () => { void this.refresh(); });
    window.addEventListener('focus', () => { void this.refresh(); });
    onIdTokenChanged(auth, (user) => {
      if (user === null) {
        this.bootKey = '';
        this.reset();
        return;
      }
      void user.getIdTokenResult().then(token => {
        const role = token.claims.role as Role | undefined;
        if (!role || auth.currentUser?.uid !== user.uid) return;
        const key = `${user.uid}:${role}`;
        if (this.bootKey !== key) { this.bootKey = key; void this.boot(user.uid, user.email ?? ''); }
      }).catch(() => {
        if (auth.currentUser?.uid !== user.uid) return;
        this.error = 'Your session could not be refreshed. Check your connection and sign in again.';
        this.loading = false;
        this.notify();
      });
    });
  }

  private reset(): void {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.bootedUid = null;
    this.workspaceLoader = null;
    this.error = '';
    this.loading = true;
    this.projects = [];
    this.rawProjectDocs = [];
    this.tasks = [];
    this.users = [];
    this.requirements = [];
    this.submissions = [];
    this.reviews = [];
    this.notifications = [];
    this.activities = [];
    this.feedbacks = [];
    this.documents = [];
    this.me = { uid: '', email: '', name: '', role: 'client' };
    this.seenUnread.clear();
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((x) => x !== cb);
    };
  }

  private async boot(uid: string, email: string): Promise<void> {
    this.reset();
    this.bootedUid = uid;
    this.me = { uid, email, name: email, role: 'client' };
    try {
      const token = await auth.currentUser?.getIdTokenResult();
      const claimRole = (token?.claims.role as Role | undefined) ?? 'client';
      this.me.role = claimRole;
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data() as { name?: string; role?: Role };
        this.me.name = data.name ?? email;
      }
    } catch {
      // Profile lookup best-effort; claim role already set.
    }
    if (this.bootedUid !== uid) return;
    let running = false;
    let refreshAgain = false;
    const refresh = async (): Promise<void> => {
      if (running) { refreshAgain = true; return; }
      if (this.bootedUid !== uid) return;
      running = true;
      try {
        const payload = (await apiGet('/workspace')) as {
          projects?: unknown[]; tasks?: unknown[]; users?: unknown[]; requirements?: unknown[];
          documents?: unknown[]; feedbacks?: unknown[]; submissions?: unknown[]; reviews?: unknown[];
          activities?: unknown[]; notifications?: unknown[];
        };
        // Ignore a request that completed after sign-out or another account boot.
        if (this.bootedUid !== uid) return;
        this.projects = (payload.projects ?? []).map((p) => {
          const row = p as Record<string, unknown>;
          return this.mapProject(String(row.id ?? ''), p);
        }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        this.tasks = (payload.tasks ?? []).map((t) => {
          const row = t as Record<string, unknown>;
          return this.mapTask(String(row.id ?? ''), t);
        }).sort((a, b) => a.deadline.localeCompare(b.deadline));
        this.users = (payload.users ?? []).map((u) => {
          const row = u as Record<string, unknown>;
          return this.mapUser(String(row.id ?? row.uid ?? ''), u);
        });
        this.requirements = (payload.requirements ?? []).map((r) => {
          const row = r as Record<string, unknown>;
          return this.mapRequirement(String(row.id ?? ''), r);
        });
        this.tasks = this.tasks.map((task) => ({
          ...task,
          requirementsList: this.requirements.filter((requirement) => (task.requirementIds ?? []).includes(requirement.id)).map((requirement) => requirement.title),
        }));
        this.submissions = (payload.submissions ?? []).map((s) => {
          const row = s as Record<string, unknown>;
          return this.mapSubmission(String(row.id ?? ''), s);
        });
        this.tasks = this.tasks.map((task) => ({
          ...task,
          attachments: [ ...(task.attachments ?? []), ...this.submissions.filter((submission) => submission.taskId === task.id).flatMap((submission) => submission.files?.length ? submission.files : [{ id: submission.id, name: submission.fileName, type: 'file', size: '', url: submission.fileUrl, uploadedAt: submission.submittedAt }]) ],
        }));
        this.reviews = (payload.reviews ?? []).map((r) => {
          const row = r as Record<string, unknown>;
          return this.mapReview(String(row.id ?? ''), r);
        });
        this.notifications = (payload.notifications ?? []).map((n) => {
          const row = n as Record<string, unknown>;
          return this.mapNotification(String(row.id ?? ''), n);
        }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        this.activities = (payload.activities ?? []).map((a) => {
          const row = a as Record<string, unknown>;
          return this.mapActivity(String(row.id ?? ''), a);
        }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        this.feedbacks = (payload.feedbacks ?? []).map((f) => {
          const row = f as Record<string, unknown>;
          return this.mapFeedback(String(row.id ?? ''), f);
        }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        this.documents = (payload.documents ?? []) as Array<Record<string, unknown>>;
        this.error = '';
        this.loading = false;
        this.watchBrowserPush();
        this.notify();
      } catch (error) {
        if (this.bootedUid !== uid) return;
        console.error('[TaskOrbit] Workspace load failed:', error);
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unable to load workspace';
        this.notify();
      } finally {
        running = false;
        if (refreshAgain) { refreshAgain = false; void refresh(); }
      }
    };
    this.workspaceLoader = refresh;
    await refresh();
    if (this.bootedUid !== uid) return;
    this.refreshTimer = setInterval(() => { void refresh(); }, 5000);

    try {
      const sdoc = await getDoc(doc(db, 'userSettings', uid));
      if (sdoc.exists() && this.bootedUid === uid) {
        this.settings = { ...DEFAULT_SETTINGS, ...(sdoc.data() as Partial<UserSettings>) };
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(this.settings));
        this.applyDensity();
      }
    } catch {
      // Settings load best-effort; defaults already applied.
    }
    this.notify();
  }

  private watchBrowserPush(): void {
    if (!this.settings.reviewAlerts && !this.settings.conflictAlerts) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    for (const n of this.notifications) {
      if (!n.read && !this.seenUnread.has(n.id)) {
        this.seenUnread.add(n.id);
        if ((n.type === 'conflict' && this.settings.conflictAlerts) || (n.type !== 'conflict' && this.settings.reviewAlerts)) {
          try {
            new Notification('TaskOrbit', { body: n.message });
          } catch {
            // Notification display best-effort.
          }
        }
      }
    }
  }

  private applyDensity(): void {
    try {
      document.documentElement.dataset.density = this.settings.compactMode ? 'compact' : 'comfortable';
    } catch {
      // Non-DOM environment.
    }
  }

  // ---------- mappers (Firestore -> consumer shapes) ----------

  private mapUser(id: string, raw: unknown): UserProfile {
    const d = raw as Record<string, unknown>;
    return {
      uid: id,
      name: String(d.name ?? ''),
      email: String(d.email ?? ''),
      role: (d.role as Role) ?? 'client',
      jobTitle: d.jobTitle !== undefined ? String(d.jobTitle) : undefined,
      phone: d.phone !== undefined ? String(d.phone) : undefined,
      department: d.department !== undefined ? String(d.department) : undefined,
      bio: d.bio !== undefined ? String(d.bio) : undefined,
      createdAt: tsToIso(d.createdAt),
    };
  }

  private mapProject(id: string, raw: unknown): Project {
    const d = raw as Record<string, unknown>;
    const myTasks = this.tasks.filter((t) => t.projectId === id);
    const approved = Number(d.tasksCompleted ?? myTasks.filter((t) => t.status === 'approved').length);
    const total = Number(d.totalTasks ?? myTasks.length);
    return {
      id,
      title: String(d.title ?? ''),
      description: String(d.description ?? ''),
      clientId: String(d.clientId ?? ''),
      clientName: d.clientName !== undefined ? String(d.clientName) : undefined,
      managerId: (d.managerId as string | null) ?? null,
      status: (d.status as Project['status']) ?? 'draft',
      priority: (d.priority as Project['priority']) ?? 'medium',
      startDate: tsToIso(d.startDate).slice(0, 10),
      deadline: tsToIso(d.deadline).slice(0, 10),
      endDate: d.endDate !== undefined ? String(d.endDate) : undefined,
      budget: d.budget !== undefined ? String(d.budget) : undefined,
      progress: Number(d.progress ?? (total === 0 ? 0 : Math.round((approved / total) * 100))),
      tasksCompleted: approved,
      totalTasks: total,
      teamIds: Array.isArray(d.memberIds) ? (d.memberIds as string[]) : [...new Set(myTasks.flatMap((t) => [t.assigneeId, t.reviewerId]))],
      milestones: Array.isArray(d.milestones) ? (d.milestones as Project['milestones']) : [],
      createdAt: tsToIso(d.createdAt),
    };
  }

  private mapTask(id: string, raw: unknown): Task {
    const d = raw as Record<string, unknown>;
    const status = String(d.status ?? 'todo') as Task['status'];
    return {
      id,
      taskIdCode: `TASK-${id.slice(0, 6).toUpperCase()}`,
      projectId: String(d.projectId ?? ''),
      projectName: this.projects.find((p) => p.id === String(d.projectId ?? ''))?.title,
      title: String(d.title ?? ''),
      description: String(d.description ?? ''),
      assigneeId: String(d.assigneeId ?? ''),
      reviewerId: String(d.reviewerId ?? ''),
      startDate: tsToIso(d.startDate).slice(0, 10),
      deadline: tsToIso(d.deadline).slice(0, 10),
      priority: (d.priority as Task['priority']) ?? 'medium',
      status,
      conflictWith: Array.isArray(d.conflictWith) ? (d.conflictWith as string[]) : [],
      revisionCount: Number(d.revisionCount ?? 0),
      progress: deriveProgress(status, d.subtasks),
      labels: Array.isArray(d.labels) ? (d.labels as string[]) : [],
      requirementIds: Array.isArray(d.requirementIds) ? (d.requirementIds as string[]) : [],
      requirementsList: Array.isArray(d.requirementsList) ? (d.requirementsList as string[]) : this.requirements.filter((requirement) => Array.isArray(d.requirementIds) && d.requirementIds.includes(requirement.id)).map((requirement) => requirement.title),
      subtasks: Array.isArray(d.subtasks) ? (d.subtasks as Task['subtasks']) : [],
      comments: Array.isArray(d.comments) ? (d.comments as Task['comments']) : [],
      attachments: Array.isArray(d.attachments) ? (d.attachments as Task['attachments']) : [],
      estimatedHours: typeof d.estimatedHours === 'number' ? d.estimatedHours : undefined,
      createdAt: tsToIso(d.createdAt),
      updatedAt: tsToIso(d.updatedAt ?? d.createdAt),
    };
  }

  private mapRequirement(id: string, raw: unknown): Requirement {
    const d = raw as Record<string, unknown>;
    const rawStatus = d.status as string | undefined;
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Under Review'] as const;
    const status = validStatuses.includes(rawStatus as typeof validStatuses[number])
      ? (rawStatus as typeof validStatuses[number])
      : 'Pending';
    return {
      id,
      projectId: String(d.projectId ?? ''),
      title: String(d.title ?? ''),
      details: String(d.details ?? d.description ?? ''),
      fileUrls: Array.isArray(d.fileUrls) ? (d.fileUrls as string[]) : [],
      files: Array.isArray(d.files) ? (d.files as Requirement['files']) : undefined,
      createdAt: tsToIso(d.createdAt),
      status,
    };
  }

  private mapSubmission(id: string, raw: unknown): Submission {
    const d = raw as Record<string, unknown>;
    return {
      id,
      taskId: String(d.taskId ?? ''),
      submittedBy: String(d.submittedBy ?? ''),
      fileUrl: String(d.fileUrl ?? ''),
      fileName: String(d.fileName ?? ''),
      files: Array.isArray(d.files) ? (d.files as Submission['files']) : undefined,
      note: String(d.note ?? ''),
      version: Number(d.version ?? 1),
      submittedAt: tsToIso(d.submittedAt),
    };
  }

  private mapReview(id: string, raw: unknown): Review {
    const d = raw as Record<string, unknown>;
    return {
      id,
      taskId: String(d.taskId ?? ''),
      submissionId: String(d.submissionId ?? ''),
      reviewerId: String(d.reviewerId ?? ''),
      decision: (d.decision as Review['decision']) ?? 'approved',
      comments: String(d.comments ?? ''),
      createdAt: tsToIso(d.createdAt),
    };
  }

  private mapNotification(id: string, raw: unknown): AppNotification {
    const d = raw as Record<string, unknown>;
    const createdAt = tsToIso(d.createdAt);
    return {
      id,
      userId: String(d.userId ?? ''),
      message: String(d.message ?? ''),
      type: (d.type as AppNotification['type']) ?? 'system',
      link: String(d.link ?? ''),
      read: Boolean(d.read),
      createdAt,
      timeAgo: timeAgo(createdAt),
    };
  }

  private mapActivity(id: string, raw: unknown): ActivityLog {
    const d = raw as Record<string, unknown>;
    const createdAt = tsToIso(d.createdAt);
    return {
      id,
      projectId: String(d.projectId ?? ''),
      actorId: String(d.actorId ?? ''),
      actorName: String(d.actorName ?? ''),
      action: String(d.action ?? ''),
      targetType: String(d.targetType ?? ''),
      targetId: String(d.targetId ?? ''),
      description: String(d.description ?? d.action ?? ''),
      createdAt,
      timeAgo: timeAgo(createdAt),
    };
  }

  private mapFeedback(id: string, raw: unknown): ClientFeedback {
    const d = raw as Record<string, unknown>;
    const createdAt = tsToIso(d.createdAt);
    const validStatuses = ['Pending', 'In Progress', 'Resolved'] as const;
    const rawStatus = d.status as string | undefined;
    const status = validStatuses.includes(rawStatus as typeof validStatuses[number])
      ? (rawStatus as typeof validStatuses[number])
      : 'Pending';
    return {
      id,
      clientId: String(d.clientId ?? ''),
      projectId: String(d.projectId ?? ''),
      response: typeof d.response === 'string' ? d.response : undefined,
      taskTitle: String(d.taskTitle ?? d.task ?? ''),
      projectTitle: String(d.projectTitle ?? d.project ?? ''),
      comment: String(d.comment ?? ''),
      status,
      repliesCount: Number(d.repliesCount ?? 0),
      createdAt,
    };
  }

  // ---------- getters (sync, snapshot-backed) ----------

  public getActiveUser(): UserProfile {
    const row = this.users.find((u) => u.uid === this.me.uid);
    if (row !== undefined) return row;
    return {
      uid: this.me.uid,
      name: this.me.name,
      email: this.me.email,
      role: this.me.role,
      createdAt: new Date().toISOString(),
    };
  }

  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  public getUserById(uid: string): UserProfile | undefined {
    return this.users.find((u) => u.uid === uid);
  }

  public getProjects(): Project[] {
    return [...this.projects];
  }

  public getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public getTasks(filter?: { projectId?: string; assigneeId?: string; reviewerId?: string; status?: string }): Task[] {
    let result = [...this.tasks];
    if (filter?.projectId !== undefined) result = result.filter((t) => t.projectId === filter.projectId);
    if (filter?.assigneeId !== undefined) result = result.filter((t) => t.assigneeId === filter.assigneeId);
    if (filter?.reviewerId !== undefined) result = result.filter((t) => t.reviewerId === filter.reviewerId);
    if (filter?.status !== undefined) result = result.filter((t) => t.status === filter.status);
    return result;
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  public getRequirements(projectId?: string): Requirement[] {
    if (projectId !== undefined) return this.requirements.filter((r) => r.projectId === projectId);
    return [...this.requirements];
  }

  public getSubmissions(taskId?: string): Submission[] {
    if (taskId !== undefined) return this.submissions.filter((s) => s.taskId === taskId);
    return [...this.submissions];
  }

  public getReviews(taskId?: string): Review[] {
    if (taskId !== undefined) return this.reviews.filter((r) => r.taskId === taskId);
    return [...this.reviews];
  }

  public getNotifications(userId?: string): AppNotification[] {
    // this.notifications is already pre-filtered by the Firestore query
    // (where userId == me.uid). Passing a userId arg is a no-op guard;
    // we return all already-fetched notifications regardless, since they
    // already belong to the current user. This prevents the double-filter
    // race where session.uid !== this.me.uid during boot.
    void userId; // acknowledged but intentionally ignored — see above
    return [...this.notifications];
  }

  public isLoading(): boolean {
    return this.loading;
  }
  public getError(): string { return this.error; }
  public async refresh(): Promise<void> { await this.workspaceLoader?.(); }
  public getDocuments(projectId?: string): Array<Record<string, unknown>> {
    return this.documents.filter(file => projectId === undefined || file.projectId === projectId);
  }

  public getActivities(projectId?: string): ActivityLog[] {
    if (projectId !== undefined) return this.activities.filter((a) => a.projectId === projectId);
    return [...this.activities];
  }

  public getFeedbacks(): ClientFeedback[] {
    return [...this.feedbacks];
  }

  public async createFeedback(input: { projectId?: string; taskTitle: string; projectTitle: string; comment: string }): Promise<ClientFeedback> {
    if (input.comment.trim() === '') throw new Error('Feedback comment cannot be empty.');
    const projectId = input.projectId ?? this.projects.find((p) => p.title === input.projectTitle)?.id ?? '';
    if (projectId === '') throw new Error('Choose a project before sending feedback.');
    const result = (await apiPost(`/projects/${projectId}/feedback`, {
      taskTitle: input.taskTitle.trim() || 'Project feedback',
      comment: input.comment.trim(),
    })) as { id?: string; projectId?: string; projectTitle?: string; taskTitle?: string; status?: ClientFeedback['status']; repliesCount?: number; createdAt?: string };
    return {
      id: result.id ?? `feedback-${Date.now()}`,
      projectId,
      clientId: this.me.uid,
      taskTitle: result.taskTitle ?? (input.taskTitle.trim() || 'Project feedback'),
      projectTitle: result.projectTitle ?? input.projectTitle,
      comment: input.comment.trim(),
      status: result.status ?? 'Pending',
      repliesCount: result.repliesCount ?? 0,
      createdAt: result.createdAt ?? new Date().toISOString(),
    };
  }

  public getSettings(): UserSettings {
    return { ...this.settings };
  }

  // ---------- conflict reporting (server conflictWith + same formula) ----------

  public getConflicts(): ConflictDetail[] {
    // Conflict calculation lives on the trusted server (conflictService.js) and is
    // persisted to tasks.conflictWith. Read those values directly; never recompute
    // or overwrite them here, so the sidebar badge, Conflicts page, and Timeline
    // all reflect the same server-calculated conflicts.
    const result: ConflictDetail[] = [];
    const seen = new Set<string>();
    for (const t of this.tasks) {
      if (t.status === 'approved') continue;
      for (const otherId of t.conflictWith) {
        const key = [t.id, otherId].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        const other = this.tasks.find((x) => x.id === otherId);
        if (other === undefined || other.status === 'approved') continue;
        const assignee = this.users.find((u) => u.uid === t.assigneeId);
        const start = Math.max(new Date(t.startDate).getTime(), new Date(other.startDate).getTime());
        const end = Math.min(new Date(t.deadline).getTime(), new Date(other.deadline).getTime());
        if (start > end) continue;
        const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
        const fmt = (ms: number): string => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        result.push({
          id: key,
          assigneeId: t.assigneeId,
          assigneeName: assignee?.name ?? 'Assignee',
          taskA: {
            id: t.id, title: t.title, startDate: t.startDate, deadline: t.deadline,
            status: t.status, projectName: t.projectName ?? 'Project',
          },
          taskB: {
            id: other.id, title: other.title, startDate: other.startDate, deadline: other.deadline,
            status: other.status, projectName: other.projectName ?? 'Project',
          },
          overlapDays: days,
          overlapDateRange: `${fmt(start)} – ${fmt(end)}`,
          resolved: false,
        });
      }
    }
    return result;
  }

  // ---------- mutations (real backend / Firestore) ----------

  public async createProject(input: {
    title: string;
    description: string;
    priority: Project['priority'];
    startDate: string;
    deadline: string;
  }): Promise<Project> {
    if (input.title.trim() === '') throw new Error('Project name is required.');
    if (new Date(input.deadline) < new Date(input.startDate)) throw new Error('End date must be on or after start date.');
    const requestKey = this.bootKey;
    const result = (await apiPost('/projects', {
      title: input.title.trim(),
      description: input.description,
      priority: input.priority,
      startDate: input.startDate,
      deadline: input.deadline,
    })) as Record<string, unknown>;
    const project = this.mapProject(String(result.id ?? ''), result);
    if (this.bootKey === requestKey) {
      this.projects = [project, ...this.projects.filter((item) => item.id !== project.id)];
      this.notify();
    }
    return project;
  }

  public async createTask(input: {
    projectId: string;
    title: string;
    description: string;
    assigneeId: string;
    reviewerId: string;
    startDate: string;
    deadline: string;
    priority: Task['priority'];
    labels?: string[];
    requirementIds?: string[];
    subtaskTitles?: string[];
    force?: boolean;
  }): Promise<CreateTaskResult> {
    if (input.title.trim() === '') throw new Error('Task title is required.');
    if (input.projectId === '') throw new Error('Choose a project.');
    if (input.assigneeId === '' || input.reviewerId === '') throw new Error('Choose an assignee and a reviewer.');
    if (input.startDate === '' || input.deadline === '') throw new Error('Start and due dates are required.');
    if (new Date(input.deadline) < new Date(input.startDate)) throw new Error('Due date must be on or after start date.');
    const requestKey = this.bootKey;
    const res = (await apiPost(`/projects/${input.projectId}/tasks`, {
      title: input.title.trim(),
      description: input.description,
      assigneeId: input.assigneeId,
      reviewerId: input.reviewerId,
      startDate: input.startDate,
      deadline: input.deadline,
      priority: input.priority,
      labels: input.labels ?? [],
      requirementIds: input.requirementIds ?? [],
      subtaskTitles: input.subtaskTitles ?? [],
      force: input.force === true,
    })) as {
      task: (Omit<Task, 'id'> & { id?: string }) | null;
      conflicts?: string[];
      conflictTasks?: Array<{ id: string; title: string; startDate: string; deadline: string; status: Task['status']; projectId?: string }>;
    };
    if (res.task === null) {
      return {
        task: this.mapTask('pending', { ...input, status: 'todo', conflictWith: [], revisionCount: 0 }),
        conflicts: (res.conflictTasks ?? []).map((c) => this.toConflictDetail(input.assigneeId, { ...input, projectId: input.projectId }, c)),
      };
    }
    const task = this.mapTask((res.task as { id: string }).id ?? '', res.task);
    if (this.bootKey === requestKey) {
      this.tasks = [task, ...this.tasks.filter((item) => item.id !== task.id)];
      this.notify();
    }
    return { task, conflicts: (res.conflicts ?? []).map((conflictId) => {
      const existing = this.getTaskById(conflictId);
      return existing ? this.toConflictDetail(input.assigneeId, { ...input, projectId: input.projectId }, existing) : null;
    }).filter((item): item is ConflictDetail => item !== null) };
  }

  private toConflictDetail(
    assigneeId: string,
    input: { title: string; startDate: string; deadline: string; projectId?: string },
    c: { id: string; title: string; startDate: string; deadline: string },
  ): ConflictDetail {
    const assignee = this.users.find((u) => u.uid === assigneeId);
    const start = Math.max(new Date(input.startDate).getTime(), new Date(c.startDate).getTime());
    const end = Math.min(new Date(input.deadline).getTime(), new Date(c.deadline).getTime());
    const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
    const fmt = (ms: number): string => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const projectName = this.projects.find((p) => p.id === (input as { projectId?: string }).projectId)?.title ?? 'Project';
    return {
      id: `new|${c.id}`,
      assigneeId,
      assigneeName: assignee?.name ?? 'Assignee',
      taskA: { id: 'new', title: input.title, startDate: input.startDate, deadline: input.deadline, status: 'todo', projectName },
      taskB: { id: c.id, title: c.title, startDate: tsToIso(c.startDate).slice(0, 10), deadline: tsToIso(c.deadline).slice(0, 10), status: 'todo', projectName },
      overlapDays: days,
      overlapDateRange: `${fmt(start)} – ${fmt(end)}`,
      resolved: false,
    };
  }

  public async updateTask(id: string, updates: { status?: Task['status']; title?: string; startDate?: string; deadline?: string }): Promise<void> {
    const task = this.getTaskById(id);
    if (task === undefined) throw new Error('Task not found.');
    if (updates.status !== undefined && updates.status !== task.status) {
      if (this.me.role === 'assignee' && updates.status === 'in_progress') {
        await apiPost(`/tasks/${id}/start`, {});
        return;
      }
      if (this.me.role === 'reviewer' && updates.status === 'in_review') {
        await apiPost(`/tasks/${id}/open-review`, {});
        return;
      }
      if (this.me.role !== 'manager') throw new Error('Only a manager can change this task.');
    }
    await apiPut(`/tasks/${id}`, updates);
  }

  public async reassignTask(id: string, newAssigneeId: string): Promise<void> {
    if (newAssigneeId === '') throw new Error('Choose an assignee.');
    await apiPost(`/tasks/${id}/reassign`, { assigneeId: newAssigneeId });
  }

  public async changeTaskDates(id: string, startDate: string, deadline: string): Promise<void> {
    if (startDate === '' || deadline === '') throw new Error('Both dates are required.');
    if (new Date(deadline) < new Date(startDate)) throw new Error('Due date must be on or after start date.');
    await apiPut(`/tasks/${id}`, { startDate, deadline });
  }

  public async resolveConflict(
    conflictKey: string,
    action: 'reassign' | 'reschedule' | 'keep_both',
    payload?: { newAssigneeId?: string; newStartDate?: string; newDeadline?: string; targetTaskId?: string },
  ): Promise<void> {
    const [, taskBId] = conflictKey.split('|');
    const targetId = payload?.targetTaskId ?? taskBId;
    if (targetId === undefined || targetId === '' || targetId === 'new') throw new Error('Pick a real task to resolve.');
    if (action === 'reassign' && payload?.newAssigneeId !== undefined) {
      await this.reassignTask(targetId, payload.newAssigneeId);
    } else if (action === 'reschedule' && payload?.newDeadline !== undefined) {
      const task = this.getTaskById(targetId);
      await this.changeTaskDates(targetId, payload.newStartDate ?? task?.startDate ?? payload.newDeadline, payload.newDeadline);
    } else if (action === 'keep_both') {
      const task = this.getTaskById(targetId);
      await apiPost('/activity', {
        projectId: task?.projectId ?? '',
        action: `acknowledged overlap on '${task?.title ?? 'task'}'`,
        targetType: 'task',
        targetId,
      });
    } else {
      throw new Error('Choose how to resolve this conflict.');
    }
  }

  public async submitTask(
    taskId: string,
    input: { note: string; files: File[] },
    onProgress?: (pct: number) => void,
    signal?: AbortSignal,
  ): Promise<{ submissionId: string; version: number }> {
    const task = this.getTaskById(taskId);
    if (task === undefined) throw new Error('Task not found.');
    if (input.files.length === 0) throw new Error('Attach at least one deliverable file.');
    const uploaded = await uploadFiles(
      input.files,
      this.me.uid,
      `projects/${task.projectId}/submissions/${taskId}/`,
      onProgress,
      signal,
    );
    const res = (await apiPost(`/tasks/${taskId}/submit`, {
      files: uploaded.map(({ name, storagePath }) => ({ name, storagePath })),
      note: input.note,
    })) as { submissionId: string; version: number };
    return res;
  }

  public async reviewTask(taskId: string, decision: 'approved' | 'rejected', comments: string, submissionId?: string): Promise<void> {
    if (decision === 'rejected' && comments.trim() === '') {
      throw new Error('Feedback comments are required when requesting a revision.');
    }
    await apiPost(`/tasks/${taskId}/review`, { decision, comments, ...(submissionId ? { submissionId } : {}) });
  }

  public async addRequirement(input: { projectId: string; title: string; details: string; fileUrls?: string[]; files?: Array<{ name: string; storagePath: string }> }): Promise<Requirement> {
    if (input.title.trim() === '') throw new Error('Requirement title is required.');
    const result = (await apiPost(`/projects/${input.projectId}/requirements`, {
      title: input.title.trim(),
      details: input.details,
      ...(input.files && input.files.length > 0 ? { files: input.files } : {}),
    })) as Record<string, unknown>;
    return this.mapRequirement(String(result.id ?? ''), result);
  }

  public async updateProfile(uid: string, patch: { name?: string; phone?: string; department?: string; bio?: string; jobTitle?: string }): Promise<void> {
    if (uid === '') throw new Error('Sign in first.');
    if (patch.name !== undefined && patch.name.trim() === '') throw new Error('Name cannot be empty.');
    await updateDoc(doc(db, 'users', uid), { ...patch, updatedAt: new Date().toISOString() } as Record<string, unknown>);
    this.me = { ...this.me, name: patch.name ?? this.me.name };
    this.users = this.users.map((user) => user.uid === uid ? { ...user, ...patch } : user);
    this.notify();
  }

  public async markNotificationRead(id: string): Promise<void> {
    await apiPatch(`/notifications/${id}/read`, {});
    this.notifications = this.notifications.map((item) => item.id === id ? { ...item, read: true } : item);
    this.notify();
  }

  public async markAllNotificationsRead(): Promise<void> {
    await apiPost('/notifications/read-all', {});
    this.notifications = this.notifications.map((item) => ({ ...item, read: true }));
    this.notify();
  }

  public async deleteNotification(id: string): Promise<void> {
    await apiDelete(`/notifications/${id}`);
    this.notifications = this.notifications.filter((item) => item.id !== id);
    this.notify();
  }

  public async saveSettings(patch: Partial<UserSettings>): Promise<void> {
    this.settings = { ...this.settings, ...patch };
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(this.settings));
    this.applyDensity();
    if (this.me.uid !== '') {
      await setDoc(doc(db, 'userSettings', this.me.uid), { ...this.settings, updatedAt: new Date().toISOString() }, { merge: true });
    }
  }

  public async toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
    const task = this.getTaskById(taskId);
    if (task === undefined || task.subtasks === undefined) return;
    const st = task.subtasks.find((s) => s.id === subtaskId);
    if (st !== undefined) {
      await apiPut(`/tasks/${taskId}/checklist/${subtaskId}`, { completed: !st.completed });
      await this.refresh();
    }
  }

  public async addComment(taskId: string, content: string): Promise<void> {
    const task = this.getTaskById(taskId);
    if (task === undefined || content.trim() === '') return;
    await apiPost(`/tasks/${taskId}/comments`, { content: content.trim() });
    await this.refresh();
  }
}

export const dataStore = new DataStore();
