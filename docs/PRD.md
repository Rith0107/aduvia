# Product Requirements Document: QuestLog

**Status:** Draft v0.1  
**Product:** Personal routine and monthly goal tracker  
**Initial platform:** Responsive web application

## Product summary

QuestLog helps people complete daily routines, pursue meaningful monthly “side quests,” and understand their progress through useful metrics and visual reports. It should feel like a lightweight personal operating system, not merely a checklist.

The core loop is: **Plan → Act → Check in → Review → Adjust**.

## Problem

Many habit trackers overemphasize streaks and binary completion. They disconnect recurring habits from one-time personal goals, treat low- and high-priority work equally, and present charts without actionable interpretation. QuestLog should represent progress honestly through consistency, priority, effort, and reflection.

## Product principles

- Progress over perfection: a missed day affects consistency without erasing prior work.
- Low friction: a daily check-in should take less than 30 seconds.
- Meaningful metrics: every prominent metric should support a decision.
- Flexible routines: support daily, selected-day, weekly-frequency, and custom schedules.
- Separate models: habits and monthly goals are related but have different completion semantics.
- Honest productivity: easy tasks must not overpower incomplete high-impact commitments.

## MVP navigation and capabilities

### Today

- Show only habits scheduled for the current day.
- Mark a habit complete, partial, skipped, or missed.
- Support numeric values, notes, and undo.
- Show daily completion and a short progress insight.
- Offer an optional mood, energy, focus, satisfaction, win, and blocker reflection.

### Habits

- Create, edit, pause, archive, and delete a habit.
- Configure category, priority, schedule, measurement, target, unit, and reminder.
- Support binary, duration, count, quantity, and rating measurements.
- Preserve historical check-ins when a habit changes or is archived.

### Side Quests

- Create a goal for a selected month.
- Track binary, percentage, numeric, or milestone progress.
- Use not-started, in-progress, blocked, completed, deferred, and abandoned states.
- Carry unfinished quests forward without losing their history.
- Warn when the user appears overcommitted.

### Insights

- Filter by period, category, and habit.
- Show completion trends, completion by habit, weekday consistency, category distribution, and quest status.
- Produce a persistent monthly review with highlights and planning adjustments.

## Core metrics

### Habit consistency

`completed scheduled occurrences / total scheduled occurrences × 100`

Only scheduled occurrences count. Partial completion receives proportional credit capped at 100%.

### Routine efficiency

`sum(completion score × priority weight) / sum(scheduled priority weight) × 100`

Initial weights: low = 1, medium = 2, high = 3. The UI must explain the score rather than presenting it as an opaque judgment.

### Side-quest completion

`completed committed quests / total committed quests × 100`

Deferred and abandoned quests remain visible and do not count as completed.

### Momentum

`recent 7-day completion × 0.70 + previous 7-day completion × 0.30`

Momentum complements streaks by changing gradually.

## Primary entities

- User and preferences
- Category
- Habit and schedule
- Habit check-in
- Side quest
- Quest milestone
- Daily reflection
- Monthly review snapshot

Detailed schema design will follow the stack and persistence decisions.

## Non-goals for MVP

- Social feeds, public profiles, and competitions
- Team or workplace task management
- Full calendar replacement
- AI life coaching
- Wearable integrations
- Native mobile applications
- Marketplace integrations

## Success criteria

- A new user can create a habit and side quest during onboarding.
- A returning user can finish a typical daily check-in in under 30 seconds.
- Scheduled-frequency habits are scored correctly.
- Users can understand why their efficiency score changed.
- Monthly reviews preserve completed and carried-forward quests.
- Users can export and delete their personal data.

## Open product decisions

- Whether authentication is required for the first usable release.
- Which reminder channels belong in MVP.
- How planned rest, sickness, and travel affect scoring.
- Whether actual effort tracking is required for side quests in MVP.
- Which insight visualizations are essential for the first release.

## Open technical decisions

- Frontend and backend architecture
- Database and authentication provider
- Hosting and deployment platform
- Offline behavior and synchronization
- Analytics charting library
- Testing strategy and CI provider

