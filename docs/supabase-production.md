# Supabase production

## Project

- Name: Aduvia Production
- Project reference: `ewlaylbqdetdomqmubnk`
- Region: East US (Ohio), `us-east-2`
- Plan: Free

## Applied migrations

The following migrations were applied in timestamp order on August 10, 2026:

1. `20260805000000_initial_schema.sql`
2. `20260809000000_production_foundation.sql`
3. `20260810000000_account_deletion.sql`

The schema enables row-level security on every user-data table, restricts rows to `auth.uid()`, validates ownership across related records, and exposes account deletion only to authenticated users.

## Application configuration

Local development uses ignored `.env.local` values for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Only the browser-safe anonymous/publishable key belongs in a `NEXT_PUBLIC_` variable. Never add a secret or service-role key to the application environment, source control, client bundle, logs, or documentation.

## Authentication URLs

- Current site URL: `http://localhost:3000`
- Allowed local redirect: `http://localhost:3000/**`

Replace the site URL and add the exact production callback URLs when the hosting domain is available.

## Verified

- Supabase Auth settings endpoint accepts the configured browser key.
- Anonymous REST access reaches the API but returns no profile rows under RLS.
- A production smoke test with two temporary confirmed users verified owner-only habit reads and owner persistence. The temporary users and cascading test data were removed afterward.
- Unauthenticated access to `/today` redirects to `/login?next=%2Ftoday`.

## Remaining production checks

- Add hosting environment variables.
- Configure the deployed site URL and redirect URLs.
- Verify email confirmation and password-recovery templates.
- Run the complete product journey with two independent test users.
- Confirm cross-user reads, writes, and deletes are rejected.
