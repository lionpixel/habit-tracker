-- ─────────────────────────────────────────────
-- Migration 002 — Habits & Habit Logs
-- habits        — habit definitions per user
-- habit_logs    — individual session records
-- ─────────────────────────────────────────────

-- ── habits ────────────────────────────────────
create table if not exists public.habits (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users (id) on delete cascade,
  title       text        not null,
  category    text        not null,                         -- 'health' | 'learning' | 'mindset' | 'nutrition'
  icon        text        not null default 'Star',          -- Lucide icon name
  color       text        not null default '#6366f1',       -- hex color
  frequency   integer     not null default 5,              -- sessions per week
  duration    integer     not null default 50,             -- minutes per session
  completed   boolean     not null default false,           -- soft delete / archive
  streak      integer     not null default 0,
  risk_level  text        check (risk_level in ('low','medium','high','critical')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index habits_user_id_idx on public.habits (user_id);

create trigger habits_updated_at
  before update on public.habits
  for each row execute procedure public.handle_updated_at();

-- ── habit_logs ────────────────────────────────
create table if not exists public.habit_logs (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.users (id) on delete cascade,
  habit_id        uuid        not null references public.habits (id) on delete cascade,
  completed_at    timestamptz not null default now(),
  week_key        text        not null,  -- e.g. "2026-W14"
  month_key       text        not null,  -- e.g. "2026-04"
  energy_score    smallint    check (energy_score between 1 and 10),
  focus_score     smallint    check (focus_score between 1 and 10),
  sleep_score     smallint    check (sleep_score between 1 and 10),
  notes           text
);

create index habit_logs_user_id_idx   on public.habit_logs (user_id);
create index habit_logs_habit_id_idx  on public.habit_logs (habit_id);
create index habit_logs_week_key_idx  on public.habit_logs (week_key);
create index habit_logs_month_key_idx on public.habit_logs (month_key);

comment on table public.habits     is 'Habit definitions — one row per user habit.';
comment on table public.habit_logs is 'Individual session records for each habit completion.';
