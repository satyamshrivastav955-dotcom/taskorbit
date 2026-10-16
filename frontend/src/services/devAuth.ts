import type { Role } from '../types';

export const DEV_CREDENTIALS = {
  name: 'Test Engineer',
  email: 'engineer1@taskorbit.local',
  password: 'TaskOrbitDev123!',
  defaultRole: 'client' as Role,
  jobTitle: 'Lead QA Engineer',
  department: 'Engineering',
  bio: 'Development testing account for TaskOrbit.',
};

export const ROLE_PROFILES: Record<Role, { uid: string; name: string; email: string; jobTitle: string; department: string }> = {
  client: {
    uid: 'dev-engineer-1',
    name: 'Test Engineer',
    email: 'engineer1@taskorbit.local',
    jobTitle: 'Lead QA Engineer / Client Lead',
    department: 'Engineering',
  },
  manager: {
    uid: 'dev-manager-1',
    name: 'Test Engineer (Manager)',
    email: 'engineer1@taskorbit.local',
    jobTitle: 'Engineering Manager',
    department: 'Project Operations',
  },
  assignee: {
    uid: 'dev-assignee-1',
    name: 'Test Engineer (Assignee)',
    email: 'engineer1@taskorbit.local',
    jobTitle: 'Senior Software Developer',
    department: 'Product Development',
  },
  reviewer: {
    uid: 'dev-reviewer-1',
    name: 'Test Engineer (Reviewer)',
    email: 'engineer1@taskorbit.local',
    jobTitle: 'Lead Code Reviewer',
    department: 'Quality Assurance',
  },
};

export interface DevSession {
  uid: string;
  email: string;
  name: string;
  role: Role;
  jobTitle?: string;
  department?: string;
  bio?: string;
}

const DEV_SESSION_KEY = 'taskorbit_dev_session';
export const DEV_AUTH_TOKEN_SECRET = 'taskorbit-dev-local-secret-2026';

export function getDevAuthToken(role: Role): string {
  return `dev-token:${role}:${DEV_AUTH_TOKEN_SECRET}`;
}

export function isDevMode(): boolean {
  return true; // Active local development mode
}

export function getDevSession(): DevSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DEV_SESSION_KEY) || sessionStorage.getItem(DEV_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DevSession;
    if (parsed && parsed.email === DEV_CREDENTIALS.email && parsed.role) {
      return parsed;
    }
  } catch {
    // Corrupt entry
  }
  return null;
}

export function setDevSession(session: DevSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
    sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage quota or private browsing error
  }
}

export function clearDevSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DEV_SESSION_KEY);
    sessionStorage.removeItem(DEV_SESSION_KEY);
  } catch {
    // Ignore
  }
}

export type DevLoginResult =
  | { isDevUser: false }
  | { isDevUser: true; success: false; error: string }
  | { isDevUser: true; success: true; session: DevSession };

export function validateDevLogin(
  email: string,
  password: string,
  role?: Role | ''
): DevLoginResult {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== DEV_CREDENTIALS.email.toLowerCase()) {
    return { isDevUser: false };
  }
  if (password !== DEV_CREDENTIALS.password) {
    return { isDevUser: true, success: false, error: 'Incorrect email or password.' };
  }
  const resolvedRole: Role = (role && (['client', 'manager', 'assignee', 'reviewer'] as Role[]).includes(role))
    ? role
    : DEV_CREDENTIALS.defaultRole;
  const profile = ROLE_PROFILES[resolvedRole] || ROLE_PROFILES.client;
  const session: DevSession = {
    uid: profile.uid,
    email: DEV_CREDENTIALS.email,
    name: profile.name,
    role: resolvedRole,
    jobTitle: profile.jobTitle,
    department: profile.department,
    bio: DEV_CREDENTIALS.bio,
  };
  return { isDevUser: true, success: true, session };
}
