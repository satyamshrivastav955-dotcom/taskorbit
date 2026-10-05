// Frozen data contract mirror. Extend only after approval.
// Dates are Firestore Timestamps at day granularity (local midnight).
// Display format: "05 Oct 2026"; ranges: "01 Oct - 05 Oct".

export type Role = 'client' | 'manager' | 'assignee' | 'reviewer';

export type ProjectStatus = 'draft' | 'submitted' | 'active' | 'completed';

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
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  managerId: string | null;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  deadline: string;
  createdAt: string;
}

export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  details: string;
  fileUrls: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  taskId: string;
  submittedBy: string;
  fileUrl: string;
  fileName: string;
  note: string;
  version: number;
  submittedAt: string;
}

export interface Review {
  id: string;
  taskId: string;
  submissionId: string;
  reviewerId: string;
  decision: ReviewDecision;
  comments: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  type: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
