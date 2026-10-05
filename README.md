# TaskOrbit — final delivery

Role-based project lifecycle management (see `docs/SRS/outline.md`).

## Setup

```powershell
# Firebase: create project, enable Auth/Firestore/Storage,
# save service key to node-backend/credentials/serviceAccountKey.json (ignored)
cd frontend; npm install; npm run dev        # http://localhost:5173
cd ../node-backend; npm install; npm test; npm run seed; npm run dev
mysql < db/schema.sql
# Spring: cd springboot-service; mvn test; mvn spring-boot:run
# JSP: cd servlet-jsp; mvn package  (deploy war to Tomcat 10.1)
# Laravel: cd php-laravel; composer install; php artisan serve
```

Full order: `docs/RUN_ALL.md`. Deployment: `docs/DEPLOY.md`.
API collections: `docs/api/taskorbit-express.json`, `docs/api/taskorbit-spring.json`.
E2E script: `docs/testing/e2e-manual.md`. Viva: `docs/VIVA.md`.

## Demo credentials

Created by `node-backend/scripts/seed.js`, printed to console only, never in code.
1 client, 1 manager, 3 assignees (Rahul Deshmukh, Amit Joshi, Sneha Patil),
2 reviewers (Kavya Reddy, Vikram Rao). Seed includes one intentional conflict
and one task in every status.

## Architecture

`docs/diagrams/architecture.md` + `docs/diagrams/workflow.md`.
Frontend (role shells) -> Firebase Auth (custom claims) -> Firestore/Storage
-> Express (state machine + conflicts + export) -> MySQL -> Spring/JSP/Laravel (read-only).
