-- Side quests are meant to belong to the month they were created in.
-- target_month already existed but was being overwritten to "now" on every
-- edit from the client, so it never actually scoped anything. A DB default
-- plus removing that client-side overwrite means it's set once, at
-- creation, and never drifts.
alter table public.side_quests
  alter column target_month set default date_trunc('month', current_date)::date;

-- completed_at records the moment a quest was actually finished, not just
-- that it currently has status = 'completed'. Trigger-managed (like
-- updated_at already is) so it's correct regardless of which client path
-- touches the row, and clears itself if a completion is ever undone.
alter table public.side_quests add column completed_at timestamptz;

create or replace function public.set_quest_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'completed' and (old is null or old.status is distinct from 'completed') then
    new.completed_at = now();
  elsif new.status != 'completed' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger side_quests_set_completed_at
  before insert or update of status on public.side_quests
  for each row execute procedure public.set_quest_completed_at();

-- Tracks whether an unfinished quest's "carry forward or let it go"
-- decision has been made, independent of status. Left null means it still
-- needs asking about; set (either path) means it's resolved and the
-- month-rollover prompt should stop surfacing it. Deliberately not modeled
-- as a status value — a declined quest keeps whatever status it already
-- had (in-progress, blocked, whatever), it just stops being "current."
alter table public.side_quests add column rollover_reviewed_at timestamptz;
