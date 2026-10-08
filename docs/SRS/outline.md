# TaskOrbit — SRS outline (draft, Phase 0)

Full SRS is finished in Phase 16. This outline freezes scope so three members
can build slices in parallel.

## 1. Purpose

Role-based project lifecycle management: client creates project + requirements,
manager breaks into tasks with assignee/reviewer/deadlines, system checks
deadline conflicts, assignee submits, reviewer approves or rejects,
rejection returns as revision, project completes when all tasks approved.

## 2. Scope

In scope: auth + roles, projects, requirements + file attach, tasks,
conflict detection, submissions (versioned), reviews, notifications,
activity log, progress auto-completion, manager reports, hand-built timeline,
MySQL sync + Spring Boot analytics + JSP printable report + Laravel notes.
Out of scope: payments, chat, Gantt drag-and-drop, mobile app.

## 3. Roles

- client: create projects; read/update own projects while draft;
  read own projects tasks (read-only). Screens: Overview, New Project,
  Project Detail, Feedback.
- manager: read all projects; tasks written only through backend.
  Screens: Overview, Projects, Project Detail + Add-task panel, Timeline,
  Conflicts, Team, Reports.
- assignee: read only tasks where assigneeId == uid; upload submissions only
  to own tasks. Screens: Overview, My Tasks, Task Detail, My Timeline.
- reviewer: read only tasks where reviewerId == uid; reviews via backend only.
  Screens: Review Queue, Review screen, History.

## 4. Functional requirements

1. One login page `/login` plus public `/register` (name, email, password,
   role choice). Role is stored as an ID token custom claim + `users/{uid}`
   and routes to `/client`, `/manager`, `/assignee`, `/reviewer`.
   Enforcement stays server-side (guards, middleware, rules).
2. Client creates project with requirements + file attach (Storage).
3. Manager creates/edits/reassigns/deletes tasks via Express API with
   conflict check; conflicts never block, UI shows Assign anyway /
   Change dates / Pick another assignee.
4. Assignee starts, uploads, submits (version = prev + 1).
5. Reviewer opens review, approves or rejects (comments required on reject).
6. Progress = approved / total; project auto-completes when all approved.
7. Timeline hand-built (CSS grid + absolute bars), 4-week window, today marker,
   conflict outline in red.
8. Notifications bell (unread count, latest 10) + per-project activity feed.
9. Manager Reports tables + export JSON (`/export/report/:projectId`, `/export/all`).
10. Academic slices read MySQL only, never write back to Firestore.

## 5. Non-functional requirements

- Usable down to 1024px, max-width 1200px, no horizontal overflow.
- Every async state handled: loading skeleton/inline text, error + retry,
  empty one line + action.
- TypeScript strict, no `any` without comment, files ~250 lines max.
- Secrets via `.env` only, `.env.example` placeholders, never commit keys.
- Conventional commits.

## 6. Use cases (summary)

Client creates project -> Manager staffs tasks -> Conflict dialog ->
Assignee submits -> Reviewer decides -> Revision loop -> Completion.

## 7. Workflow

See `docs/diagrams/workflow.md` (Mermaid).

## 8. Constraints

Fixed stack (React 18 + Vite + Redux Toolkit session-only + Firebase +
Express + MySQL + Spring Boot + JSP + Laravel). No UI libraries, no Tailwind,
no charting lib, plain CSS variables + CSS modules. Inter + lucide-react only.
