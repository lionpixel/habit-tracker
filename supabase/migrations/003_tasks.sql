-- ─────────────────────────────────────────────
-- Migration 003 — Pomodoro Tasks
-- tasks         — task definitions
-- task_sessions — pomodoro session records
-- ─────────────────────────────────────────────

create table if not exists public.tasks (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users (id) on delete cascade,
  title       text        not null,
  priority    text        not null default 'P2' check (priority in ('P1','P2','P3')),
  completed   boolean     not null default false,
  pomodoros   smallint    not null default 0,
  date_key    text        not null,  -- "YYYY-MM-DD" — the day this task belongs to
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index tasks_user_id_idx  on public.tasks (user_id);
create index tasks_date_key_idx on public.tasks (date_key);

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

-- ── task_sessions ─────────────────────────────
-- Records each pomodoro session (25 min block)
create table if not exists public.task_sessions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.users (id) on delete cascade,
  task_id      uuid        not null references public.tasks (id) on delete cascade,
  started_at   timestamptz not null,
  ended_at     timestamptz not null,
  duration_min smallint    not null default 25,
  focus_score  smallint    check (focus_score between 1 and 10)
);

create index task_sessions_user_id_idx on public.task_sessions (user_id);
create index task_sessions_task_id_idx on public.task_sessions (task_id);

comment on table public.tasks         is 'Pomodoro task list — one row per task per day.';
comment on table public.task_sessions is 'Individual 25-min focus blocks per task.';
