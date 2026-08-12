# Aduvia launch checklist

## Production services

- [x] Create the production Supabase project.
- [x] Apply migrations in timestamp order.
- [x] Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the hosting environment.
- [x] Configure the production site URL and allowed Auth redirect URLs while retaining localhost for development.
- [x] Enable mandatory email confirmation for new accounts.
- [ ] Verify the production confirmation email template and link journey.
- [x] Deploy with Vercel and connect the GitHub production branch.

## Security and privacy

- [x] Confirm a habit created by one test user is invisible to a second user and persists for its owner.
- [ ] Confirm neither user can update or delete the other's rows through direct API requests.
- [ ] Confirm account deletion removes the Auth user and all cascading application data.
- [ ] Confirm exported JSON contains only the current user's records.
- [ ] Document backup retention and deletion timing in the privacy policy.
- [x] Confirm no Supabase service-role secret reaches the browser bundle (enforced after every CI build).

## Product journeys

- [ ] Signup → email confirmation → onboarding → Today.
- [ ] Login, logout, expired session, and password recovery.
- [ ] Create, pause, resume, and schedule a habit.
- [ ] Complete and undo a daily check-in from Today and Evening mode.
- [ ] Create and update every quest status.
- [ ] Save and reload a private reflection.
- [x] Verify Insights across 28-, 29-, 30-, and 31-day months and month-to-date behavior.
- [ ] Export account data and download/share a monthly image.

## Quality

- [x] GitHub quality workflow passes on the latest deployment commits.
- [x] Keyboard-only navigation reaches every primary interactive journey.
- [x] Automated screen-reader labels and live status checks pass across core screens.
- [x] Reduced-motion and increased-contrast preferences remain usable.
- [x] Test Chrome, Firefox, WebKit/Safari-equivalent, and Edge-equivalent engines.
- [x] Test representative small phone, large phone, tablet, laptop, and wide desktop widths.
- [ ] Check slow network, empty data, and database error states.
- [x] Verify offline interruption displays recovery guidance and clears after reconnecting.

## Web application readiness

- [x] Add an installable web manifest and palette-aligned app icons.
- [x] Add a service-worker offline fallback and live offline status.
- [x] Add landing-page metadata, social metadata, robots rules, and sitemap.
- [x] Use the browser timezone for calendar dates, weekday schedules, and check-ins.
- [x] Persist the detected timezone to the member profile.
- [x] Add friendly global error and not-found recovery screens.
- [x] Add baseline response security headers.

## Operations

- [ ] Add error monitoring without capturing reflection text or other sensitive content.
- [ ] Add privacy-conscious product analytics for signup and onboarding completion.
- [ ] Configure uptime checks for the landing page and Auth callback.
- [x] Prepare rollback instructions and identify the last known-good release.
