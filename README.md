# TaskOrbit

Role-based project lifecycle management system (college project).

Client creates project + requirements -> Manager breaks it into tasks, assigns assignee
and reviewer, sets deadlines -> system checks deadline conflicts -> Assignee works and
submits -> Reviewer approves or rejects -> rejected work returns as a revision ->
project completes when every task is approved.

Distinguishing feature: deadline conflict detection + a role-aware, hand-built
timeline (real logic, never a decorative chart).

## Stack (fixed, do not change without approval)

- Frontend: React 18 + TypeScript (strict) + Vite, React Router v6, Redux Toolkit
  (session/UI state only), lucide-react, Inter, plain CSS (no UI library, no Tailwind)
- Auth + DB + Files: Firebase Authentication (email/password, role as custom claim),
  Cloud Firestore, Firebase Storage
- Trusted backend: Node.js + Express + Firebase Admin SDK (`/node-backend`), Jest
- Reporting (read-only, fed from Node export, never write back to Firestore):
  Spring Boot 3 (Java 17) analytics API, Servlet + JSP printable report,
  PHP 8.2 + Laravel 11 Report Notes module, MySQL 8 shared reporting DB
- Tools: Postman, Git/GitHub, Firebase Hosting

## Repo layout

```text
TaskOrbit/
  frontend/src/{components/{layout,ui,project,feedback},pages/{auth,client,manager,assignee,reviewer},hooks,redux,services,types,routes,utils,styles}
  node-backend/{src/{server.js,config/firebase.js,routes,controllers,services,middleware,utils},tests,scripts/{seed.js,syncToMysql.js}}
  firebase/{firestore.rules,storage.rules,firestore.indexes.json,firebase.json}
  springboot-service/  (Maven layout, Phase 10)
  servlet-jsp/         (Maven war layout, Phase 11)
  php-laravel/         (standard Laravel layout, Phase 12)
  db/{schema.sql,seed-check.sql}  (Phase 9)
  docs/{SRS,diagrams,methodology,screenshots,testing,api,TASKORBIT_UI_RULES.md,DATA_CONTRACT.md}
```

## Phases

Built in Phase 0-16 strictly in order. Each phase ends with STOP + approval.
See `docs/SRS/` for requirements and `docs/diagrams/workflow.md` for the lifecycle.

- Phase 0: setup + freeze (this commit). No app code yet, only contracts.
- Phase 1: design system + `/ui-preview`
- Phase 2: Firebase + Auth + role shells
- Phase 3: thin slice (client creates project -> manager creates task -> assignee sees it)
- Phase 4-8: core modules, conflicts, timeline, reviews, notifications, hardening
- Phase 9-12: MySQL sync, Spring Boot, Servlet/JSP, Laravel slices
- Phase 13-16: integration links, testing, deployment, final delivery

## Quick start (Phase 0 — skeleton only)

This phase creates the skeleton and frozen contracts. There is no runnable app yet.

```powershell
# 1. Complete the manual checklist in docs/SRS/manual-setup-checklist.md
# 2. Frontend (from Phase 1 onward)
cd frontend; npm install; npm run dev
# 3. Backend (from Phase 2 onward)
cd node-backend; npm install; npm test; npm run dev
```

## Demo credentials

Never hard-coded in frontend code. `node-backend/scripts/seed.js` (Phase 2)
creates 1 client, 1 manager, 3 assignees, 2 reviewers and prints credentials
to the console only.

## Frozen contracts

- `docs/TASKORBIT_UI_RULES.md` — tokens, typography, layout, component rules
- `docs/DATA_CONTRACT.md` — collections, fields, enums, transitions, storage layout
- `frontend/src/types/index.ts` — TypeScript mirror of the data contract

Do not change stack, tokens, data contract, or scope silently. Propose first.

## Git flow

Branches: `main` <- `dev` <- `feature/design-system`, `feature/client`,
`feature/manager`, `feature/assignee-review`, `feature/academic-slices`.
No direct pushes to `main`. See `docs/methodology/git-flow.md` (Phase 0 stub).
Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
