# Aduvia design system

## Default public identity: Aduvia Calm

Landing, login, signup, and onboarding always use the same pre-auth identity. A returning user's saved theme must not recolor these screens.

- Display type: Manrope
- Reading type: Inter
- Ink: `#29322c`
- Deep green: `#143d31`
- Muted text: `#737b75`
- Clay accent: `#a86f5b`
- Gold action accent: `#d89a42`
- Sage tint: `#d7e3dc`
- Clay tint: `#ead8cd`
- Blue tint: `#dbe2e9`
- Surface: `#eef0e9`

Shared public primitives are defined in `globals.css`:

- `.public-canvas` fixes the default palette and type pair.
- `.public-surface` supplies the frosted surface, border, and shadow.
- `.public-toolbar` supplies the shared navigation treatment.
- `.skip-link` and the global focus ring keep keyboard behavior consistent.

## Personalization boundary

Palette and typography preferences apply only after the user enters the application. Home, Habits, Quests, Insights, Evening mode, and Account may use the selected theme; acquisition and authentication screens remain recognizably Aduvia.
