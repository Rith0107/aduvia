# Aduvia release and rollback runbook

## Release gate

1. Confirm the deployment branch is `design/soft-digital` and the working tree is clean.
2. Confirm the latest GitHub `Quality` workflow is green.
3. Open the Vercel deployment created from that exact commit and smoke-test landing, authentication, Home, Habits, Quests, Insights, Evening mode, account export, and logout.
4. Record the commit SHA and Vercel deployment URL in the release notes before promoting or tagging it.
5. Tag the verified commit only after the production smoke test: `git tag -a vX.Y.Z <sha>` followed by `git push origin vX.Y.Z`.

## Last known-good release

Until the first formal version tag is created, the most recent commit with a green GitHub `Quality` run and a successful Vercel production smoke test is the rollback target. Do not use a newer commit merely because it built successfully.

## Rollback

1. In Vercel, open **Project → Deployments**.
2. Select the recorded last known-good deployment.
3. Use **Promote to Production**. This changes the production alias without rewriting Git history or database data.
4. Smoke-test `/`, `/login`, `/today`, `/habits`, `/quests`, `/insights`, and `/check-in`.
5. If the problem came from a database migration, do not reverse it blindly. Add a forward-only corrective migration, test it against a non-production project, and apply it separately.
6. Open a GitHub issue describing the failed commit, user impact, rollback deployment, and corrective follow-up.

## Data safety

- Never roll back by deleting production rows or resetting the Supabase database.
- Never expose a service-role key to the browser or use one as a `NEXT_PUBLIC_` value.
- Keep schema changes backward-compatible for at least one application release whenever possible.
