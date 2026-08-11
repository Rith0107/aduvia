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
- [ ] Confirm no Supabase service-role secret reaches the browser bundle.

## Product journeys

- [ ] Signup → email confirmation → onboarding → Today.
- [ ] Login, logout, expired session, and password recovery.
- [ ] Create, pause, resume, and schedule a habit.
- [ ] Complete and undo a daily check-in from Today and Evening mode.
- [ ] Create and update every quest status.
- [ ] Save and reload a private reflection.
- [ ] Verify Insights across 28-, 29-, 30-, and 31-day months.
- [ ] Export account data and download/share a monthly image.

## Quality

- [ ] GitHub quality workflow passes on the release commit.
- [ ] Keyboard-only navigation reaches every interactive control.
- [ ] Screen-reader labels and live status messages are understandable.
- [ ] Reduced-motion and increased-contrast preferences remain usable.
- [ ] Test current Chrome, Safari, Firefox, and Edge.
- [ ] Test representative small phone, large phone, tablet, laptop, and wide desktop widths.
- [ ] Check slow network, offline interruption, empty data, and database error states.

## Operations

- [ ] Add error monitoring without capturing reflection text or other sensitive content.
- [ ] Add privacy-conscious product analytics for signup and onboarding completion.
- [ ] Configure uptime checks for the landing page and Auth callback.
- [ ] Prepare rollback instructions and identify the last known-good release.
