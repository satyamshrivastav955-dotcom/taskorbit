# Deployment

- Frontend: Firebase Hosting. `firebase deploy --only hosting,firestore:rules,storage` from `firebase/`. Set production `VITE_*` vars in hosting env / `.env.production`.
- Firestore/Storage rules + indexes: `firebase deploy --only firestore:rules,firestore:indexes,storage`.
- Express backend: deploy to a Node host of your choice (Render/Fly/Railway/VPS). Do not assume a paid plan — pick with the team. Set `PORT`, `FIREBASE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS` (secret file, never in repo), MySQL vars.
- Spring Boot / JSP / Laravel: college demo runs locally; for production use any Java/PHP host. Document URLs in frontend `.env.production` (`VITE_ANALYTICS_URL`, `VITE_JSP_REPORT_URL`, `VITE_LARAVEL_NOTES_URL`).
- Before deployment, run `npm run build`, `npm test`, `npm run test:ui`, and
  `npm run test:workflow`. The UI suite is fixture-backed; the workflow suite
  is emulator-backed and must not be treated as proof that deployed Firebase
  rules, hosting rewrites, or external reporting services are live.
- Verify the deployed app with demo accounts from `npm run seed` output, then
  exercise sign-in, one task upload, review/revision, project files, and report
  export in the deployed environment. Confirm browser console/network errors
  and mobile navigation before calling the deployment complete.
