# Aduvia

Aduvia is a daily-routine and monthly side-quest tracker. It combines fast habit check-ins, meaningful personal goals, and analytics that help users understand consistency, efficiency, and momentum.

The name blends the Telugu word **adugu** (అడుగు, “step”) with **via** (“path”): a path shaped one step at a time.

## Project status

The application foundation is being built with Next.js, TypeScript, Tailwind CSS, Supabase, and Recharts. The current dashboard uses sample data while the first vertical product slice is developed. GitHub is the source of truth.

## Product areas

- **Today:** habits scheduled for today, quick check-ins, and daily reflection.
- **Habits:** recurring routines with flexible schedules and measurable targets.
- **Side Quests:** monthly goals with progress, milestones, and carry-forward history.
- **Insights:** consistency, routine efficiency, momentum, and monthly reviews.

## Documentation

- [Product requirements](docs/PRD.md)
- [Contributing workflow](CONTRIBUTING.md)
- [Architecture decisions](docs/decisions/README.md)

## Local development

Use Node.js 26 and pnpm:

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

Run the quality checks with `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.

## Next decisions

1. Confirm the database schema and row-level security policies.
2. Build the Today dashboard as the first complete product slice.
3. Select the hosting and deployment approach.
