create table if not exists public.habit_status_history (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.habit_status not null,
  effective_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists habit_status_history_habit_effective_idx
  on public.habit_status_history (habit_id, effective_at);

alter table public.habit_status_history enable row level security;
drop policy if exists "Users manage their habit status history" on public.habit_status_history;
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

drop trigger if exists record_habit_status_change on public.habits;
create trigger record_habit_status_change
after insert or update of status on public.habits
for each row execute function public.record_habit_status_change();

insert into public.habit_status_history (habit_id, user_id, status, effective_at)
select h.id, h.user_id, 'active'::public.habit_status, h.created_at
from public.habits h
where not exists (
  select 1
  from public.habit_status_history history
  where history.habit_id = h.id
    and history.status = 'active'::public.habit_status
    and history.effective_at = h.created_at
);

insert into public.habit_status_history (habit_id, user_id, status, effective_at)
select h.id, h.user_id, h.status, h.updated_at
from public.habits h
where h.status <> 'active'
  and not exists (
    select 1
    from public.habit_status_history history
    where history.habit_id = h.id
      and history.status = h.status
      and history.effective_at = h.updated_at
  );
