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

Supabase Auth uses the production URL as its site URL and allows both:

- `https://aduvia-chi.vercel.app/**`
- `http://localhost:3000/**`

The localhost entry remains available for development. Verify signup confirmation and password recovery before launch.
