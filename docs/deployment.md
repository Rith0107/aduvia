# Deployment

## Vercel

- Project: `aduvia`
- Team: Rithwik Lagishetty
- Plan: Hobby
- Framework preset: Next.js
- Root directory: `./`
- Production branch: `design/soft-digital`
- Production URL: https://aduvia-chi.vercel.app

The following browser-safe variables are configured for Production and Preview:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never add Supabase secret or service-role keys to Vercel client environment variables.
The quality workflow runs `pnpm verify:client-secrets` after every production build and fails if a privileged Supabase variable or service-role marker appears in generated application output.

## Web Analytics

Vercel Web Analytics is mounted once in the root layout through `@vercel/analytics/next`. It records page-level traffic and navigation only. Aduvia does not send custom events containing habit names, quest titles, reflection text, email addresses, or other user-entered content.

After deployment, visit the production site and confirm a request to Vercel's `/_vercel/insights` route, then check the project's Analytics dashboard after processing completes. Content blockers can prevent a local browser from sending the request.

Supabase Auth uses the production URL as its site URL and allows both:

- `https://aduvia-chi.vercel.app/**`
- `http://localhost:3000/**`

The localhost entry remains available for development. Verify signup confirmation and password recovery before launch.

## Web client

- `/manifest.webmanifest` makes Aduvia installable from supported browsers.
- `/sw.js` provides a navigation-only offline fallback. Supabase data remains network-backed; queued mutations retry through the application sync layer.
- `/robots.txt` indexes the public marketing/auth surfaces and excludes authenticated product screens.
- `/sitemap.xml` lists public pages.
- Browser calendar actions use the member's IANA timezone and sync it to `profiles.timezone`.
