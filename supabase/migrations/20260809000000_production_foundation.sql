alter type public.quest_status add value if not exists 'paused' after 'in_progress';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, timezone)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'UTC')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.validate_category_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.category_id is not null and not exists (
    select 1 from public.categories
    where id = new.category_id and user_id = new.user_id
  ) then
    raise exception 'Category must belong to the same user';
  end if;
  return new;
end;
$$;

create or replace function public.validate_check_in_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.habits
    where id = new.habit_id and user_id = new.user_id
  ) then
    raise exception 'Habit must belong to the same user';
  end if;
  return new;
end;
$$;

create or replace function public.validate_milestone_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.side_quests
    where id = new.side_quest_id and user_id = new.user_id
  ) then
    raise exception 'Side quest must belong to the same user';
  end if;
  return new;
end;
$$;

create trigger habits_validate_category
  before insert or update of category_id, user_id on public.habits
  for each row execute procedure public.validate_category_owner();
create trigger quests_validate_category
  before insert or update of category_id, user_id on public.side_quests
  for each row execute procedure public.validate_category_owner();
create trigger check_ins_validate_habit
  before insert or update of habit_id, user_id on public.habit_check_ins
  for each row execute procedure public.validate_check_in_owner();
create trigger milestones_validate_quest
  before insert or update of side_quest_id, user_id on public.quest_milestones
  for each row execute procedure public.validate_milestone_owner();

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger habits_set_updated_at before update on public.habits
  for each row execute procedure public.set_updated_at();
create trigger check_ins_set_updated_at before update on public.habit_check_ins
  for each row execute procedure public.set_updated_at();
create trigger quests_set_updated_at before update on public.side_quests
  for each row execute procedure public.set_updated_at();
create trigger reflections_set_updated_at before update on public.daily_reflections
  for each row execute procedure public.set_updated_at();
