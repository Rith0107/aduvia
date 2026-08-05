create extension if not exists pgcrypto;

create type public.habit_status as enum ('active', 'paused', 'archived');
create type public.check_in_status as enum ('complete', 'partial', 'skipped', 'missed');
create type public.quest_status as enum (
  'not_started', 'in_progress', 'blocked', 'completed', 'deferred', 'abandoned'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'UTC',
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  schedule jsonb not null default '{"type":"daily"}'::jsonb,
  measurement_type text not null default 'binary',
  target_value numeric,
  unit text,
  priority smallint not null default 2 check (priority between 1 and 3),
  status public.habit_status not null default 'active',
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.habit_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  scheduled_date date not null,
  status public.check_in_status not null,
  actual_value numeric,
  completion numeric not null check (completion between 0 and 1),
  skip_reason text,
  note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, scheduled_date)
);

create table public.side_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  description text,
  target_month date not null check (target_month = date_trunc('month', target_month)::date),
  target_date date,
  priority smallint not null default 2 check (priority between 1 and 3),
  estimated_minutes integer check (estimated_minutes >= 0),
  actual_minutes integer check (actual_minutes >= 0),
  progress numeric not null default 0 check (progress between 0 and 1),
  status public.quest_status not null default 'not_started',
  carried_from_id uuid references public.side_quests(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quest_milestones (
  id uuid primary key default gen_random_uuid(),
  side_quest_id uuid not null references public.side_quests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  position integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.daily_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reflection_date date not null,
  mood smallint check (mood between 1 and 5),
  energy smallint check (energy between 1 and 5),
  focus smallint check (focus between 1 and 5),
  satisfaction smallint check (satisfaction between 1 and 5),
  note text,
  biggest_win text,
  main_blocker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, reflection_date)
);

create index habit_check_ins_user_date_idx
  on public.habit_check_ins (user_id, scheduled_date desc);
create index side_quests_user_month_idx
  on public.side_quests (user_id, target_month desc);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.habits enable row level security;
alter table public.habit_check_ins enable row level security;
alter table public.side_quests enable row level security;
alter table public.quest_milestones enable row level security;
alter table public.daily_reflections enable row level security;

create policy "Users manage their profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage their categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their habits" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their check-ins" on public.habit_check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their quests" on public.side_quests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their milestones" on public.quest_milestones
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their reflections" on public.daily_reflections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
