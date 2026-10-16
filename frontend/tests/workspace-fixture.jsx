// Browser-test fixture only. This module is never imported by the product.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '../src/pages/AppRoutes';
import { ToastProvider } from '../src/components/ui/Toast';
import { store } from '../src/redux/store';
import { setSession } from '../src/redux/sessionSlice';
import { dataStore } from '../src/services/dataService';
import '../src/styles/global.css';

const options = new URL(import.meta.url).searchParams;
const role = options.get('role') || 'manager';
const path = options.get('path') || `/${role}`;
await new Promise((resolve) => setTimeout(resolve, 50));
const uid = `${role}-1`;
const users = ['client', 'manager', 'assignee', 'reviewer'].map((role) => ({ uid: `${role}-1`, name: `${role[0].toUpperCase() + role.slice(1)} One`, email: `${role}@example.test`, role, createdAt: '2026-10-01' }));
Object.assign(dataStore, {
  loading: false, error: '', me: users.find((user) => user.uid === uid), users,
  projects: [{ id: 'project-1', title: 'Customer onboarding', description: 'A clear and accessible first-run experience.', clientId: 'client-1', clientName: 'Client One', managerId: 'manager-1', status: 'active', priority: 'medium', startDate: '2026-10-01', deadline: '2026-10-31', progress: 0, totalTasks: 1, tasksCompleted: 0, teamIds: ['assignee-1', 'reviewer-1'], milestones: [], createdAt: '2026-10-01' }],
  tasks: [{ id: 'task-1', taskIdCode: 'TASK-1', projectId: 'project-1', projectName: 'Customer onboarding', title: 'Review the onboarding flow', description: 'Check the full onboarding flow.', assigneeId: 'assignee-1', reviewerId: 'reviewer-1', status: 'in_review', priority: 'high', startDate: '2026-10-05', deadline: '2026-10-20', conflictWith: [], revisionCount: 0, requirementIds: ['requirement-1'], requirementsList: ['Accessible form'], subtasks: [], labels: [], comments: [], createdAt: '2026-10-01', updatedAt: '2026-10-07' }],
  requirements: [{ id: 'requirement-1', projectId: 'project-1', title: 'Accessible form', details: 'Keyboard-friendly controls.', status: 'Under Review', fileUrls: [], createdAt: '2026-10-01' }],
  documents: [{ id: 'file-1', projectId: 'project-1', name: 'Project brief.pdf', url: 'https://example.test/brief.pdf' }],
  submissions: [{ id: 'submission-1', taskId: 'task-1', submittedBy: 'assignee-1', fileName: 'Onboarding.pdf', fileUrl: 'https://example.test/onboarding.pdf', version: 1, note: 'Ready for a decision.', submittedAt: '2026-10-07T12:00:00Z' }],
  reviews: [],
  feedbacks: [{ id: 'feedback-1', projectId: 'project-1', clientId: 'client-1', projectTitle: 'Customer onboarding', taskTitle: 'Onboarding flow', comment: 'Please clarify the welcome message.', status: 'Pending', repliesCount: 0, createdAt: '2026-10-07T12:00:00Z' }],
  activities: [{ id: 'activity-1', projectId: 'project-1', actorId: 'manager-1', actorName: 'Manager One', action: 'created the project', targetType: 'project', targetId: 'project-1', createdAt: '2026-10-07T12:00:00Z', timeAgo: '1h ago' }],
  notifications: [],
});
if (options.get('state') === 'empty') Object.assign(dataStore, { projects: [], tasks: [], requirements: [], documents: [], submissions: [], feedbacks: [], activities: [] });
store.dispatch(setSession({ uid, name: `${role} One`, email: `${role}@example.test`, role }));
history.replaceState({}, '', path);
createRoot(document.getElementById('root')).render(<Provider store={store}><BrowserRouter><ToastProvider><AppRoutes /></ToastProvider></BrowserRouter></Provider>);
