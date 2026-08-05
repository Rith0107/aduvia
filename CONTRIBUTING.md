# Contributing

GitHub is the source of truth for this project. Keep changes small, reviewable, and documented.

## Workflow

1. Start from an up-to-date `main` branch.
2. Create a focused branch such as `feature/today-dashboard` or `docs/refine-prd`.
3. Make one coherent change and verify it locally.
4. Commit with a clear, imperative message.
5. Open a pull request describing the outcome, verification, and tradeoffs.
6. Merge only after checks pass and the change is reviewed.

Do not commit secrets, local environment files, generated build output, or editor-specific state. Record material technical decisions in `docs/decisions/`.

## Commit style

Use short conventional prefixes where useful:

- `feat:` user-facing functionality
- `fix:` defect correction
- `docs:` documentation only
- `test:` test coverage
- `chore:` tooling and maintenance

