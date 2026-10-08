import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const Login = lazy(() => import('./auth/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('./auth/Register').then((module) => ({ default: module.Register })));
const Landing = lazy(() => import('./Landing').then((module) => ({ default: module.Landing })));
const UiPreview = lazy(() => import('./UiPreview').then((module) => ({ default: module.UiPreview })));

const ClientOverview = lazy(() => import('./client/Overview').then((module) => ({ default: module.ClientOverview })));
const ClientProjects = lazy(() => import('./client/Projects').then((module) => ({ default: module.ClientProjects })));
const NewProject = lazy(() => import('./client/NewProject').then((module) => ({ default: module.NewProject })));
const ClientProjectDetail = lazy(() => import('./client/ProjectDetail').then((module) => ({ default: module.ClientProjectDetail })));
const ClientRequirements = lazy(() => import('./client/Requirements').then((module) => ({ default: module.ClientRequirements })));
const ClientDocuments = lazy(() => import('./client/Documents').then((module) => ({ default: module.ClientDocuments })));
const ClientFeedback = lazy(() => import('./client/Feedback').then((module) => ({ default: module.ClientFeedback })));
const ClientProgress = lazy(() => import('./client/Progress').then((module) => ({ default: module.ClientProgress })));

const ManagerOverview = lazy(() => import('./manager/Overview').then((module) => ({ default: module.ManagerOverview })));
const ManagerProjects = lazy(() => import('./manager/Projects').then((module) => ({ default: module.ManagerProjects })));
const ManagerProjectDetail = lazy(() => import('./manager/ProjectDetail').then((module) => ({ default: module.ManagerProjectDetail })));
const ManagerTasks = lazy(() => import('./manager/Tasks').then((module) => ({ default: module.ManagerTasks })));
const ManagerTaskDetail = lazy(() => import('./manager/TaskDetail').then((module) => ({ default: module.ManagerTaskDetail })));
const ManagerTimeline = lazy(() => import('./manager/Timeline').then((module) => ({ default: module.ManagerTimeline })));
const Conflicts = lazy(() => import('./manager/Conflicts').then((module) => ({ default: module.Conflicts })));
const Team = lazy(() => import('./manager/Team').then((module) => ({ default: module.Team })));
const Reports = lazy(() => import('./manager/Reports').then((module) => ({ default: module.Reports })));

const AssigneeOverview = lazy(() => import('./assignee/Overview').then((module) => ({ default: module.AssigneeOverview })));
const MyTasks = lazy(() => import('./assignee/MyTasks').then((module) => ({ default: module.MyTasks })));
const AssigneeTaskDetail = lazy(() => import('./assignee/TaskDetail').then((module) => ({ default: module.AssigneeTaskDetail })));
const AssigneeTimeline = lazy(() => import('./assignee/MyTimeline').then((module) => ({ default: module.AssigneeTimeline })));
const AssigneeRevisions = lazy(() => import('./assignee/Revisions').then((module) => ({ default: module.AssigneeRevisions })));
const AssigneeDocuments = lazy(() => import('./assignee/Documents').then((module) => ({ default: module.AssigneeDocuments })));
const AssigneeHistory = lazy(() => import('./assignee/History').then((module) => ({ default: module.AssigneeHistory })));

const ReviewerOverview = lazy(() => import('./reviewer/Overview').then((module) => ({ default: module.ReviewerOverview })));
const ReviewQueue = lazy(() => import('./reviewer/Queue').then((module) => ({ default: module.ReviewQueue })));
const ReviewHistory = lazy(() => import('./reviewer/History').then((module) => ({ default: module.ReviewHistory })));
const ReviewerDocuments = lazy(() => import('./reviewer/Documents').then((module) => ({ default: module.ReviewerDocuments })));
const ReviewDetail = lazy(() => import('./reviewer/ReviewDetail').then((module) => ({ default: module.ReviewDetail })));

const Notifications = lazy(() => import('./shared/Notifications').then((module) => ({ default: module.Notifications })));
const Profile = lazy(() => import('./shared/Profile').then((module) => ({ default: module.Profile })));
const Settings = lazy(() => import('./shared/Settings').then((module) => ({ default: module.Settings })));

import { RequireRole, RequireAuth } from '../routes/RequireRole';

import { useAppSelector } from '../redux/hooks';

function RouteFallback(): JSX.Element {
  return <div role="status" aria-live="polite" style={{ minHeight: '16rem', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>Loading workspace…</div>;
}

function HomeRedirect(): JSX.Element {
  const session = useAppSelector((s) => s.session);
  if (!session.ready) return <p style={{ padding: '24px' }}>Loading workspace…</p>;
  return <Landing />;
}

export function AppRoutes(): JSX.Element {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
      {/* Public / Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/ui-preview" element={<UiPreview />} />

      {/* Shared Pages for all authenticated users */}
      <Route element={<RequireAuth />}>
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Client Module */}
      <Route element={<RequireRole role="client" />}>
        <Route path="/client" element={<ClientOverview />} />
        <Route path="/client/projects" element={<ClientProjects />} />
        <Route path="/client/projects/:id" element={<ClientProjectDetail />} />
        <Route path="/client/new" element={<NewProject />} />
        <Route path="/client/requirements" element={<ClientRequirements />} />
        <Route path="/client/documents" element={<ClientDocuments />} />
        <Route path="/client/feedback" element={<ClientFeedback />} />
        <Route path="/client/progress" element={<ClientProgress />} />
        {/* Fallback alias */}
        <Route path="/client/:id" element={<ClientProjectDetail />} />
      </Route>

      {/* Manager Module */}
      <Route element={<RequireRole role="manager" />}>
        <Route path="/manager" element={<ManagerOverview />} />
        <Route path="/manager/projects" element={<ManagerProjects />} />
        <Route path="/manager/projects/:id" element={<ManagerProjectDetail />} />
        <Route path="/manager/tasks" element={<ManagerTasks />} />
        <Route path="/manager/tasks/:id" element={<ManagerTaskDetail />} />
        <Route path="/manager/timeline" element={<ManagerTimeline />} />
        <Route path="/manager/conflicts" element={<Conflicts />} />
        <Route path="/manager/team" element={<Team />} />
        <Route path="/manager/reports" element={<Reports />} />
      </Route>

      {/* Assignee Module */}
      <Route element={<RequireRole role="assignee" />}>
        <Route path="/assignee" element={<AssigneeOverview />} />
        <Route path="/assignee/tasks" element={<MyTasks />} />
        <Route path="/assignee/tasks/:id" element={<AssigneeTaskDetail />} />
        <Route path="/assignee/timeline" element={<AssigneeTimeline />} />
        <Route path="/assignee/revisions" element={<AssigneeRevisions />} />
        <Route path="/assignee/documents" element={<AssigneeDocuments />} />
        <Route path="/assignee/history" element={<AssigneeHistory />} />
      </Route>

      {/* Reviewer Module */}
      <Route element={<RequireRole role="reviewer" />}>
        <Route path="/reviewer" element={<ReviewerOverview />} />
        <Route path="/reviewer/queue" element={<ReviewQueue />} />
        <Route path="/reviewer/history" element={<ReviewHistory />} />
        <Route path="/reviewer/documents" element={<ReviewerDocuments />} />
        <Route path="/reviewer/reviews/:id" element={<ReviewDetail />} />
        <Route path="/reviewer/:id" element={<ReviewDetail />} />
      </Route>

      {/* Root & Catch-all */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
