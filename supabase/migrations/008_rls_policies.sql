-- ─────────────────────────────────────────────
-- Migration 008 — Row Level Security (RLS)
--
-- Every table that stores user data has RLS enabled.
-- The rule is simple: a user can only access rows
-- where user_id = auth.uid().
--
-- achievement_definitions is public read-only.
-- ─────────────────────────────────────────────

-- ── Enable RLS ────────────────────────────────

alter table public.users                  enable row level security;
alter table public.habits                 enable row level security;
alter table public.habit_logs             enable row level security;
alter table public.sleep_config           enable row level security;
alter table public.sleep_entries          enable row level security;
alter table public.tasks                  enable row level security;
alter table public.task_sessions          enable row level security;
alter table public.focus_goals            enable row level security;
alter table public.focus_daily            enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.user_achievements      enable row level security;
alter table public.xp_events              enable row level security;
alter table public.weekly_stats           enable row level security;

-- ── users ─────────────────────────────────────

create policy "Users: select own row"
  on public.users for select
  using (id = auth.uid());

create policy "Users: update own row"
  on public.users for update
  using (id = auth.uid());

-- ── habits ────────────────────────────────────

create policy "Habits: select own"
  on public.habits for select
  using (user_id = auth.uid());

create policy "Habits: insert own"
  on public.habits for insert
  with check (user_id = auth.uid());

create policy "Habits: update own"
  on public.habits for update
  using (user_id = auth.uid());

create policy "Habits: delete own"
  on public.habits for delete
  using (user_id = auth.uid());

-- ── habit_logs ────────────────────────────────

create policy "HabitLogs: select own"
  on public.habit_logs for select
  using (user_id = auth.uid());

create policy "HabitLogs: insert own"
  on public.habit_logs for insert
  with check (user_id = auth.uid());

create policy "HabitLogs: delete own"
  on public.habit_logs for delete
  using (user_id = auth.uid());

-- ── sleep_config ──────────────────────────────

create policy "SleepConfig: select own"
  on public.sleep_config for select
  using (user_id = auth.uid());

create policy "SleepConfig: upsert own"
  on public.sleep_config for all
  using (user_id = auth.uid());

-- ── sleep_entries ─────────────────────────────

create policy "SleepEntries: select own"
  on public.sleep_entries for select
  using (user_id = auth.uid());

create policy "SleepEntries: insert own"
  on public.sleep_entries for insert
  with check (user_id = auth.uid());

create policy "SleepEntries: update own"
  on public.sleep_entries for update
  using (user_id = auth.uid());

create policy "SleepEntries: delete own"
  on public.sleep_entries for delete
  using (user_id = auth.uid());

-- ── tasks ─────────────────────────────────────

create policy "Tasks: select own"
  on public.tasks for select
  using (user_id = auth.uid());

create policy "Tasks: insert own"
  on public.tasks for insert
  with check (user_id = auth.uid());

create policy "Tasks: update own"
  on public.tasks for update
  using (user_id = auth.uid());

create policy "Tasks: delete own"
  on public.tasks for delete
  using (user_id = auth.uid());

-- ── task_sessions ─────────────────────────────

create policy "TaskSessions: select own"
  on public.task_sessions for select
  using (user_id = auth.uid());

create policy "TaskSessions: insert own"
  on public.task_sessions for insert
  with check (user_id = auth.uid());

-- ── focus_goals ───────────────────────────────

create policy "FocusGoals: select own"
  on public.focus_goals for select
  using (user_id = auth.uid());

create policy "FocusGoals: upsert own"
  on public.focus_goals for all
  using (user_id = auth.uid());

-- ── focus_daily ───────────────────────────────

create policy "FocusDaily: select own"
  on public.focus_daily for select
  using (user_id = auth.uid());

create policy "FocusDaily: upsert own"
  on public.focus_daily for all
  using (user_id = auth.uid());

-- ── achievement_definitions ───────────────────
-- Public read-only — no user_id column

create policy "AchievementDefs: anyone can read"
  on public.achievement_definitions for select
  using (true);

-- ── user_achievements ─────────────────────────

create policy "UserAchievements: select own"
  on public.user_achievements for select
  using (user_id = auth.uid());

create policy "UserAchievements: insert own"
  on public.user_achievements for insert
  with check (user_id = auth.uid());

-- ── xp_events ─────────────────────────────────

create policy "XpEvents: select own"
  on public.xp_events for select
  using (user_id = auth.uid());

create policy "XpEvents: insert own"
  on public.xp_events for insert
  with check (user_id = auth.uid());

-- ── weekly_stats ──────────────────────────────

create policy "WeeklyStats: select own"
  on public.weekly_stats for select
  using (user_id = auth.uid());

create policy "WeeklyStats: upsert own"
  on public.weekly_stats for all
  using (user_id = auth.uid());
