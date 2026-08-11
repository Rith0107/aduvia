# Deployment

## Vercel

- Project: `aduvia`
- Team: Rithwik Lagishetty
- Plan: Hobby
- Framework preset: Next.js
- Root directory: `./`
- Production branch: `design/soft-digital`

The following browser-safe variables are configured for Production and Preview:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never add Supabase secret or service-role keys to Vercel client environment variables.

After Vercel assigns the production domain, add it as the Supabase Auth site URL and allow the exact callback paths before testing signup, confirmation, and password recovery.
