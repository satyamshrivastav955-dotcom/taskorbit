// TaskOrbit Data Types & Contracts
// Dates are ISO strings or standard date strings (e.g., "Mar 12, 2025").

export type Role = 'client' | 'manager' | 'assignee' | 'reviewer';

export type ProjectStatus = 'draft' | 'submitted' | 'active' | 'completed' | 'on_track' | 'at_risk' | 'delayed' | 'not_started';

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'submitted'
  | 'in_review'
  | 'revision'
  | 'approved';

export type Priority = 'low' | 'medium' | 'high';

export type ReviewDecision = 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  jobTitle?: string;
  avatar?: string;
  phone?: string;
  department?: string;
  bio?: string;
  activeProjectsCount?: number;
  assignedTasksCount?: number;
  workloadPercentage?: number;
  availabilityStatus?: 'Available' | 'Busy' | 'Overloaded';
  createdAt: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  phase?: string;
}

export interface Project {
  id: string;
  title: string;
  name?: string;
  description: string;
  clientId: string;
  clientName?: string;
  managerId: string | null;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  deadline: string;
  endDate?: string;
  budget?: string;
  progress: number; // 0-100
  tasksCompleted?: number;
  totalTasks?: number;
  teamIds?: string[];
  milestones?: ProjectMilestone[];
  createdAt: string;
}

export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  details?: string;
  priority?: Priority;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Under Review';
  submittedDate?: string;
  fileUrls: string[];
  files?: Attachment[];
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: string;
  status?: 'todo' | 'in_progress' | 'completed';
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // 'figma' | 'pdf' | 'image' | 'archive' | 'doc'
  size: string;
  url: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes?: number;
}

export interface Task {
  id: string;
  taskIdCode?: string; // e.g. "TASK-101"
  projectId: string;
  projectName?: string;
  title: string;
  description: string;
  assigneeId: string;
  reviewerId: string;
  startDate: string;
  deadline: string;
  priority: Priority;
  status: TaskStatus;
  conflictWith: string[];
  revisionCount: number;
  progress?: number;
  estimatedHours?: number;
  actualHours?: number;
  labels?: string[];
  requirementIds?: string[];
  requirementsList?: string[];
  subtasks?: Subtask[];
  attachments?: Attachment[];
  comments?: TaskComment[];
  dependencies?: { id: string; title: string; status: 'completed' | 'in_progress' | 'todo' }[];
  relatedTaskIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  taskId: string;
  submittedBy: string;
  fileUrl: string;
  fileName: string;
  files?: Attachment[];
  note: string;
  version: number;
  submittedAt: string;
}

export interface ReviewAnnotation {
  id: string;
  number: number;
  x: number;
  y: number;
  comment: string;
  author: string;
  createdAt: string;
}

export interface Review {
  id: string;
  taskId: string;
  submissionId: string;
  reviewerId: string;
  decision: ReviewDecision;
  comments: string;
  annotations?: ReviewAnnotation[];
  checklistResults?: { id: string; label: string; passed: boolean }[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  type: 'mention' | 'status_change' | 'submission' | 'deadline' | 'assigned' | 'conflict' | 'approval' | 'revision' | 'system';
  link: string;
  read: boolean;
  createdAt: string;
  timeAgo?: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  action: string;
  targetType: string;
  targetId: string;
  description?: string;
  createdAt: string;
  timeAgo?: string;
}

export interface ConflictDetail {
  id: string;
  assigneeId: string;
  assigneeName: string;
  taskA: {
    id: string;
    title: string;
    startDate: string;
    deadline: string;
    status: TaskStatus;
    projectName: string;
  };
  taskB: {
    id: string;
    title: string;
    startDate: string;
    deadline: string;
    status: TaskStatus;
    projectName: string;
  };
  overlapDays: number;
  overlapDateRange: string;
  resolved: boolean;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface ClientFeedback {
  id: string;
  projectId?: string;
  response?: string;
  clientId: string;
  taskTitle: string;
  projectTitle: string;
  comment: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  repliesCount: number;
  createdAt: string;
}
