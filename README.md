# Aduvia

Aduvia is a daily-routine and monthly side-quest tracker. It combines fast habit check-ins, meaningful personal goals, and analytics that help users understand consistency, efficiency, and momentum.

The name blends the Telugu word **adugu** (అడుగు, “step”) with **via** (“path”): a path shaped one step at a time.

## Project status

The working application uses Next.js, TypeScript, Tailwind CSS, Supabase, and Recharts. Authenticated accounts persist habits, schedules, daily check-ins, side quests, and private reflections in Supabase; an unconfigured local environment falls back to browser-local preview data. GitHub is the source of truth.

Production: https://aduvia-chi.vercel.app

## Product areas

- **Today:** habits scheduled for today, quick check-ins, and daily reflection.
- **Habits:** recurring routines with flexible schedules and measurable targets.
- **Side Quests:** monthly goals with progress, milestones, and carry-forward history.
- **Insights:** consistency, routine efficiency, momentum, and monthly reviews.

## Documentation

- [Product requirements](docs/PRD.md)
- [Contributing workflow](CONTRIBUTING.md)
- [Architecture decisions](docs/decisions/README.md)
- [Design system](docs/design-system.md)
- [Launch checklist](docs/launch-checklist.md)

## Local development

Use Node.js 26 and pnpm:

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

Run the quality checks with `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.

## Before launch

The application is deployed through Vercel and connected to the production Supabase project. Before public launch, verify row-level security with two independent users, test signup confirmation and password recovery, and complete the remaining launch checklist. GitHub Actions runs typecheck, lint, tests, and the production build on every push and pull request.
