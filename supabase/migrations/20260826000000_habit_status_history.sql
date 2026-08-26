create table public.habit_status_history (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.habit_status not null,
  effective_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index habit_status_history_habit_effective_idx
  on public.habit_status_history (habit_id, effective_at);

alter table public.habit_status_history enable row level security;
create policy "Users manage their habit status history" on public.habit_status_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.record_habit_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.habit_status_history (habit_id, user_id, status, effective_at)
    values (new.id, new.user_id, new.status, new.created_at);
  elsif new.status is distinct from old.status then
    insert into public.habit_status_history (habit_id, user_id, status, effective_at)
    values (new.id, new.user_id, new.status, now());
  end if;
  return new;
end;
$$;

create trigger record_habit_status_change
after insert or update of status on public.habits
for each row execute function public.record_habit_status_change();

insert into public.habit_status_history (habit_id, user_id, status, effective_at)
select id, user_id, 'active'::public.habit_status, created_at
from public.habits;

insert into public.habit_status_history (habit_id, user_id, status, effective_at)
select id, user_id, status, updated_at
from public.habits
where status <> 'active';
