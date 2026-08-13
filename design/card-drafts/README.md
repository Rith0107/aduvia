# Shareable card drafts

Static, self-contained concept drafts for the "download/share a monthly image" launch-checklist
item. Open any file directly in a browser — no build step, no dependencies.

Every iteration is kept as its own file rather than overwritten in place, so earlier drafts stay
around for comparison. `step-cards.html` always mirrors the latest version.

## Step Cards — versions

- **`step-cards-v1.html`** — first pass. Diagonal scatter-plot hero glyph, flat rotated-square gem,
  no idle motion (holo sheen only appears on hover).
- **`step-cards-v2.html`** (= `step-cards.html`, current) — hero glyph rebuilt as an actual
  staircase silhouette (tread + riser, gradient-filled area under the achieved run) instead of
  points on a line; added an always-on idle foil shimmer scaled by rarity (real foil catches light
  at rest, not just on interaction); faceted gem with a highlight instead of a flat square; fine
  dot-grid surface texture so the face isn't empty flat space; deeper inset shadow on the hero
  window.

## `step-cards.html` — Step Cards

A monthly review exported as one collectible object, built around Aduvia's own metaphor
(*adugu* + *via* — a path shaped one step at a time) rather than generic trading-card tropes.

- **Rarity is earned, not decorative.** Bronze / Silver / Gold / Prism Step is read directly off
  that month's real consistency score (under 60% / 60–79% / 80–94% / 95%+), so a shared card is
  proof of something real, not a random skin.
- **The hero art is generative, not illustrated.** A canvas-drawn staircase of nodes where the
  filled count is the actual data. Momentum and Side Quest variants reuse the same step/path
  visual language (dual arcs weighted 70/30, a row of quest diamonds on a dotted path) so the
  three "species" read as one family.
- **True trading-card proportions** (2.5:3.5), foil-edged frame, and a holo sheen built entirely
  from Aduvia's existing palette (gold/clay/blue-tint/sage-tint) rather than a neon rainbow foil.
- Hover or focus a card for a pointer-tracked tilt + holo-angle shift (respects
  `prefers-reduced-motion`).
- Typefaces are the native Apple system stack (SF Pro Display / SF Pro Text / SF Mono) per the
  brief. Swap in Aduvia's existing Manrope/Inter pairing (already loaded via `next/font` in
  `src/app/layout.tsx`) if brand consistency with the rest of the app matters more than the
  system-font read.

## Open before implementation

- Pick a direction (or mix pieces of each) before this gets wired into a real Next.js route.
- Card backs aren't drafted yet.
- Rarity naming is only worked out for the Consistency species; Momentum/Side Quest need their
  own tier names or should inherit Consistency's.
- Real data wiring: where does the exported card pull `habits`, `quests`, and `metrics.ts` output
  from, and does export happen client-side (canvas → PNG, same pattern as the JSON export in
  `account-screen.tsx`) or server-side?
