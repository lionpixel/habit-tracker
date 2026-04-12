-- ─────────────────────────────────────────────
-- Migration 005 — Focus / Pomodoro Analytics
-- focus_daily    — aggregated daily focus stats
-- focus_goals    — monthly focus hour targets
-- ─────────────────────────────────────────────

-- ── focus_goals ───────────────────────────────
create table if not exists public.focus_goals (
  user_id      uuid    primary key references public.users (id) on delete cascade,
  goal_hours   integer not null default 80,       -- monthly target
  updated_at   timestamptz not null default now()
);

create trigger focus_goals_updated_at
  before update on public.focus_goals
  for each row execute procedure public.handle_updated_at();

-- ── focus_daily ───────────────────────────────
-- Stores aggregated per-day focus totals.
-- Populated by a trigger or Edge Function when
-- task_sessions rows are inserted.
create table if not exists public.focus_daily (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.users (id) on delete cascade,
  date_key     text        not null,              -- "YYYY-MM-DD"
  total_min    integer     not null default 0,    -- minutes of focus
  sessions     smallint    not null default 0,    -- number of pomodoros
  deep_work    boolean     not null default false -- true if total >= 90 min
);

create unique index focus_daily_user_date_idx
  on public.focus_daily (user_id, date_key);

create index focus_daily_user_id_idx on public.focus_daily (user_id);

-- Auto-create focus_goals on user creation
create or replace function public.handle_new_user_focus()
returns trigger language plpgsql security definer as $$
begin
  insert into public.focus_goals (user_id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_user_created_focus_goals
  after insert on public.users
  for each row execute procedure public.handle_new_user_focus();

comment on table public.focus_goals is 'Monthly focus hour goals per user.';
comment on table public.focus_daily is 'Aggregated daily focus time totals.';
