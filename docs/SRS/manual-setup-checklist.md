# Manual setup checklist (do these yourself, Phase 0)

## Firebase

- [ ] Create Firebase project (console.firebase.google.com), name e.g. `taskorbit-dev`.
- [ ] Enable Authentication -> Sign-in method -> Email/Password.
- [ ] Create Firestore Database (production mode, region closest to you).
- [ ] Enable Storage (default bucket).
- [ ] Generate service account key: Project Settings -> Service accounts ->
      Generate new private key. Save as `node-backend/credentials/serviceAccountKey.json`
      (this path is git-ignored, never commit it).
- [ ] Copy web config values into `frontend/.env` (see `frontend/.env.example`).
- [ ] Set `FIREBASE_PROJECT_ID` + `GOOGLE_APPLICATION_CREDENTIALS` in `node-backend/.env`.

## Local tools

- [ ] Node 20 LTS + npm (`node -v`, `npm -v`).
- [ ] JDK 17 (`java -version`), Maven 3.9+ (`mvn -v`) — needed Phase 10-11.
- [ ] Tomcat 10.1 (Jakarta Servlet 6) — needed Phase 11.
- [ ] PHP 8.2 (`php -v`), Composer 2 (`composer --version`) — needed Phase 12.
- [ ] MySQL 8 (`mysql --version`), create DB in Phase 9:
      `CREATE DATABASE taskorbit_reports CHARACTER SET utf8mb4;`
- [ ] Postman (for `/docs/api` collections, Phase 8+).
- [ ] Git + GitHub, Firebase CLI (`npm i -g firebase-tools`) for Phase 15.

## Verify (Phase 0)

```powershell
cd frontend; npm install; npm run build
cd ../node-backend; npm install; npm test
```
