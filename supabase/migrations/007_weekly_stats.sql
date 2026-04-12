-- ─────────────────────────────────────────────
-- Migration 007 — Weekly Stats Snapshots
-- weekly_stats  — pre-aggregated weekly summaries
--                 populated by a cron job or Edge
--                 Function at the end of each week.
-- ─────────────────────────────────────────────

create table if not exists public.weekly_stats (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references public.users (id) on delete cascade,
  week_start          date        not null,       -- Monday of the ISO week
  week_key            text        not null,       -- "YYYY-WNN"
  consistency_score   smallint    not null default 0,   -- 0-100
  sessions            smallint    not null default 0,
  total_minutes       integer     not null default 0,
  streak_average      numeric(5,2) not null default 0,
  energy_average      numeric(5,2),               -- avg of sleep energy scores
  focus_average       numeric(5,2),               -- avg of daily focus scores
  best_habit          text,                       -- HabitKey with highest consistency
  habits_json         jsonb,                      -- snapshot: { habitKey: { sessions, minutes } }
  created_at          timestamptz not null default now(),
  unique (user_id, week_key)
);

create index weekly_stats_user_id_idx    on public.weekly_stats (user_id);
create index weekly_stats_week_start_idx on public.weekly_stats (week_start desc);

-- View: last 8 weeks per user (useful for EvolutionChart)
create or replace view public.recent_weekly_stats as
select *
from public.weekly_stats
where week_start >= current_date - interval '56 days'
order by week_start desc;

comment on table public.weekly_stats       is 'Pre-aggregated weekly performance snapshots per user.';
comment on view  public.recent_weekly_stats is 'Last 8 weeks of weekly stats — used by EvolutionChart.';
