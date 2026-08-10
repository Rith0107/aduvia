# Initial data model

The first Supabase migration lives in `supabase/migrations/20260805000000_initial_schema.sql`.

## Ownership

Every user-owned record carries `user_id`. Row-level security restricts reads and writes to `auth.uid() = user_id`. Child records also keep `user_id` so authorization does not depend on joins.

## Scheduling

Habit schedules are stored as validated JSON at the application boundary. This lets the MVP support daily and selected-weekday schedules before deciding whether more complex recurrence deserves normalized tables.

Example:

```json
{ "type": "weekdays", "days": [1, 3, 5] }
```

## Scoring

Check-ins persist a normalized completion value from `0` to `1`. Baseline metrics cap credit at `1`, while the original measurement can be retained in `actual_value`.

Priorities use integer weights:

- Low: `1`
- Medium: `2`
- High: `3`

## Production foundation

- New authenticated users receive a profile automatically.
- Category, check-in, and milestone relationships validate ownership.
- Mutable records maintain `updated_at` automatically.
- Quest storage supports the paused state used by the product UI.

## Before launch

- Test every row-level security policy against two separate users.
- Add generated TypeScript database types to CI.
- Define retention and account-deletion behavior for user-owned data.
