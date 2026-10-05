# Git flow (Phase 0 freeze)

Branches: `main` <- `dev` <- `feature/design-system`, `feature/client`,
`feature/manager`, `feature/assignee-review`, `feature/academic-slices`.

- No direct pushes to `main`.
- Flow: branch -> develop -> test -> PR -> review -> merge to `dev` ->
  integration test -> `main`.
- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Phase 0 belongs on `dev` (skeleton + contracts), then PR to `main` after approval.
