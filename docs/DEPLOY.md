# Deployment

- Frontend: Firebase Hosting. `firebase deploy --only hosting,firestore:rules,storage` from `firebase/`. Set production `VITE_*` vars in hosting env / `.env.production`.
- Firestore/Storage rules + indexes: `firebase deploy --only firestore:rules,firestore:indexes,storage`.
- Express backend: deploy to a Node host of your choice (Render/Fly/Railway/VPS). Do not assume a paid plan — pick with the team. Set `PORT`, `FIREBASE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS` (secret file, never in repo), MySQL vars.
- Spring Boot / JSP / Laravel: college demo runs locally; for production use any Java/PHP host. Document URLs in frontend `.env.production` (`VITE_ANALYTICS_URL`, `VITE_JSP_REPORT_URL`, `VITE_LARAVEL_NOTES_URL`).
- Verify deployed app with demo accounts from `npm run seed` output.
