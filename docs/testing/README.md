# Testing notes

- Jest suite (Express + conflictService) must stay green from Phase 5 onward.
- Manual end-to-end script covering full lifecycle
  (including a conflict, a rejection, a resubmission): `docs/testing/e2e-manual.md`.
- Emulator workflow: `npm run test:workflow` from the repository root. The
  repository-local launcher uses the downloaded Java 21 runtime and Firebase
  CLI, and `tests/workflow.cjs` exercises real Auth tokens, Express routes,
  Firestore persistence, Storage metadata verification, create → start → submit
  → reject → revise → resubmit → approve, project completion, and conflict
  detection. It uses only the isolated `demo-taskorbit` emulator project.

## Current verification (WSL, 2026-10-07)

- `npm test`: passed 7 Jest suites / 26 tests.
- `npm run build`: passed TypeScript and the Vite production build; role pages
  are route-split and React/Firebase/icons are separate vendor chunks.
- `npm run test:ui`: passed 41 Playwright checks at desktop and mobile widths,
  including empty/error states, unknown records, role redirects, focus trapping,
  reduced motion, and live inspector refresh. These use test-only fixture data,
  not Firebase persistence.
- `npm run test:workflow`: passed the genuine emulator-backed HTTP workflow,
  including Auth, Firestore, Storage metadata, lifecycle transitions, and a
  rejected-client mutation. This is emulator evidence; deployed Firebase and
  production hosting still require a separate smoke test.
- `node --check tests/workflow.cjs`: passed. Maven remains unavailable, so the
  Spring/JSP and Laravel integrations are not build-verified here.
