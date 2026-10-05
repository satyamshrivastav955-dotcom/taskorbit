# TaskOrbit — DATA CONTRACT (frozen in Phase 0)

Extend only after asking. `frontend/src/types/index.ts` is the TypeScript mirror.
MySQL mirror lands in Phase 9 (`db/schema.sql`).

## Conventions

- Dates: Firestore Timestamps at day granularity (local midnight).
- Display: `05 Oct 2026`. Ranges: `01 Oct - 05 Oct`.
- Storage layout: `projects/{projectId}/{requirements|submissions|final}/...`
- Errors (Express): `{ error: { code, message } }`. Invalid transitions return 409.

## Collections

### users/{uid}

| field     | type   | notes                                    |
| --------- | ------ | ---------------------------------------- |
| name      | string | e.g. Rahul Deshmukh                      |
| email     | string | login email                              |
| role      | enum   | `client` \| `manager` \| `assignee` \| `reviewer` |
| createdAt | Timestamp |                                       |

Role is also set as a Firebase Auth custom claim. Frontend checks are UX only.

### projects/{id}

| field       | type            | notes                          |
| ----------- | --------------- | ------------------------------ |
| title       | string          |                                |
| description | string          |                                |
| clientId    | string (uid)    | owner                           |
| managerId   | string \| null  | assigned manager, nullable      |
| status      | enum            | `draft` \| `submitted` \| `active` \| `completed` |
| priority    | enum            | `low` \| `medium` \| `high`     |
| startDate   | Timestamp (day) |                                |
| deadline    | Timestamp (day) |                                |
| createdAt   | Timestamp       |                                |

Progress = approved tasks / total tasks. Status becomes `completed`
automatically when every task is `approved`.

### requirements/{id}

| field     | type        | notes              |
| --------- | ----------- | ------------------ |
| projectId | string      | parent project     |
| title     | string      |                    |
| details   | string      |                    |
| fileUrls  | string[]    | Storage URLs       |
| createdAt | Timestamp   |                    |

### tasks/{id}

| field         | type            | notes                        |
| ------------- | --------------- | ---------------------------- |
| projectId     | string          |                              |
| title         | string          | e.g. Set up staging environment |
| description   | string          |                              |
| assigneeId    | string (uid)    |                              |
| reviewerId    | string (uid)    |                              |
| startDate     | Timestamp (day) |                              |
| deadline      | Timestamp (day) |                              |
| priority      | enum            | `low` \| `medium` \| `high`   |
| status        | enum            | `todo` \| `in_progress` \| `submitted` \| `in_review` \| `revision` \| `approved` |
| conflictWith  | string[]        | conflicting task ids, both sides match |
| revisionCount | number          | increments on each rejection |
| createdAt     | Timestamp       |                              |
| updatedAt     | Timestamp       |                              |

### submissions/{id}

| field       | type      | notes                    |
| ----------- | --------- | ------------------------ |
| taskId      | string    |                          |
| submittedBy | string (uid) | assignee              |
| fileUrl     | string    | Storage URL              |
| fileName    | string    | original name             |
| note        | string    | assignee note            |
| version     | number    | previous + 1             |
| submittedAt | Timestamp |                          |

### reviews/{id}

| field        | type      | notes                       |
| ------------ | --------- | --------------------------- |
| taskId       | string    |                             |
| submissionId | string    | reviewed submission         |
| reviewerId   | string (uid) |                          |
| decision     | enum      | `approved` \| `rejected`     |
| comments     | string    | required on rejection       |
| createdAt    | Timestamp |                             |

### notifications/{id}

| field     | type      | notes                                    |
| --------- | --------- | ---------------------------------------- |
| userId    | string (uid) | recipient                             |
| message   | string    | e.g. task assigned, revision requested   |
| type      | string    | `assigned` \| `revision` \| `conflict` \| `submission` |
| link      | string    | route to open on click                   |
| read      | boolean   |                                          |
| createdAt | Timestamp |                                          |

Bell shows unread count, dropdown lists latest 10, click marks read + navigates.

### activityLogs/{id}

| field      | type      | notes                                              |
| ---------- | --------- | -------------------------------------------------- |
| projectId  | string    |                                                    |
| actorId    | string (uid) |                                                 |
| actorName  | string    | denormalised, e.g. Rahul Deshmukh                  |
| action     | string    | e.g. submitted, approved, created                  |
| targetType | string    | `project` \| `task` \| `submission` \| `review`    |
| targetId   | string    |                                                    |
| createdAt  | Timestamp | feed line e.g. 09:42 Rahul Deshmukh submitted Task Set up staging environment |

## Status transitions (enforced server-side)

```text
todo -> in_progress (assignee)
in_progress -> submitted (assignee, requires a submission)
submitted -> in_review (reviewer opens it)
in_review -> approved | revision (reviewer; rejection requires comments)
revision -> in_progress (assignee)
```

Anything else returns 409. Every mutation writes an `activityLogs` entry
and the relevant notification.

## Conflict detection

- Location: `node-backend/src/services/conflictService.js`, pure + unit-testable.
- `findConflicts(candidateTask, existingTasks)`:
  - Consider only tasks with same `assigneeId`, different `id`, status != `approved`.
  - Conflict if `a.start <= b.end AND b.start <= a.end` (inclusive days).
  - Return conflicting task ids.
- Runs on task create, update (dates/assignee changed) and reassign.
- Persist into `tasks.conflictWith` and update the OTHER tasks so both sides match.
  When a task is approved or deleted, remove it from others.
- Conflicts never block creation. API returns them; UI shows dialog:
  `Rahul Deshmukh already has 'X' (01 Oct - 05 Oct). Assign anyway?`
  Actions: Assign anyway, Change dates, Pick another assignee.
- Notify the manager on conflict.

## Backend API (Express, base /api; all routes need verifyToken)

| method | route                    | role     | notes                              |
| ------ | ------------------------ | -------- | ---------------------------------- |
| POST   | /auth/register           | public   | self-registration + role choice, sets claim |
| POST   | /projects/:id/tasks      | manager  | create + conflict check            |
| PUT    | /tasks/:id               | manager  | edit + conflict re-check           |
| POST   | /tasks/:id/reassign      | manager  |                                    |
| DELETE | /tasks/:id               | manager  |                                    |
| POST   | /tasks/:id/start         | assignee |                                    |
| POST   | /tasks/:id/submit        | assignee | creates submission, version = prev + 1 |
| POST   | /tasks/:id/open-review   | reviewer |                                    |
| POST   | /tasks/:id/review        | reviewer | {decision, comments}               |
| GET    | /conflicts               | manager  | active conflicts grouped by assignee |
| GET    | /export/report/:projectId| manager  | flattened JSON                     |
| GET    | /export/all              | manager  | flattened JSON for every project   |

Express middleware: `verifyToken` (Admin SDK `verifyIdToken`) and
`requireRole(...roles)`.
