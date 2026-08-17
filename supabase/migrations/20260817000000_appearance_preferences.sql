-- Palette and typography were purely a localStorage preference, so logging
-- into the same account on a different device always started from the
-- defaults instead of the look the user had already chosen. Null means "no
-- preference saved yet" — the client falls back to its own default (forest /
-- modern) rather than baking a specific default in here.
alter table public.profiles
  add column if not exists palette text,
  add column if not exists typography text;
