# Methodology notes

- Three members build slices against frozen contracts (`DATA_CONTRACT.md`,
  `TASKORBIT_UI_RULES.md`, `frontend/src/types/index.ts`): client, manager,
  assignee-review. Academic slices are read-only over MySQL.
- Branch per slice from `dev`, PR back to `dev`, integration test, then `main`.
- Merge conflicts expected in `firestore.indexes.json` and Postman collections;
  resolve by union, never by delete.
- Definition of done per merge: `tsc --noEmit` clean, Jest green, manual E2E
  step for the touched flow passes.
