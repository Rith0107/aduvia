# ADR 0001: Application stack

**Status:** Accepted  
**Date:** 2026-08-04

## Context

Aduvia needs a responsive web experience, secure user-specific persistence, interactive charts, and a codebase that can grow from an MVP without splitting frontend and backend prematurely.

## Decision

- Next.js App Router with TypeScript for the web application.
- Tailwind CSS for styling and a small shared component system.
- Supabase for PostgreSQL, authentication, and row-level security.
- Recharts for product analytics visualizations.
- Zod for runtime validation at system boundaries.
- Vitest and Testing Library for automated tests.
- pnpm for deterministic dependency management.

The initial deployment target will be evaluated separately after the first vertical product slice is working.

## Consequences

- The project standardizes on Node.js 26 for local development and CI.
- Database access must use row-level security before real user data is introduced.
- Server and client modules must remain explicitly separated.
- Metric calculations should live in pure, tested domain functions rather than UI components.

## Alternatives considered

- A separate API service was deferred because it adds operational complexity before the domain is validated.
- Native mobile development was deferred because the PRD identifies responsive web as the initial platform.
