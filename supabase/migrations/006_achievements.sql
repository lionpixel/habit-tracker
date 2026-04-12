-- ─────────────────────────────────────────────
-- Migration 006 — Achievements & XP
-- achievement_definitions  — static catalog
-- user_achievements        — per-user unlocks
-- xp_events                — XP history log
-- ─────────────────────────────────────────────

-- ── achievement_definitions ───────────────────
create table if not exists public.achievement_definitions (
  id          text    primary key,  -- e.g. 'streak_7'
  type        text    not null,     -- 'streak' | 'consistency' | 'sessions' | 'minutes' | ...
  title       text    not null,
  description text    not null,
  icon        text    not null,     -- Lucide icon name
  xp          integer not null default 0,
  threshold   integer,              -- target value for progress achievements
  sort_order  integer not null default 0
);

-- Seed with the same definitions as achievementService.ts
insert into public.achievement_definitions
  (id, type, title, description, icon, xp, threshold, sort_order)
values
  ('first_session',  'first_session',  'Primeiro Passo',      'Registre sua primeira sessão.',                    'Footprints',   50,   1,    10),
  ('streak_7',       'streak',         'Semana Perfeita',     'Complete todos os hábitos por 7 dias consecutivos.','Flame',       200,   7,    20),
  ('streak_30',      'streak',         'Mês de Ferro',        'Mantenha streak por 30 dias.',                     'ShieldCheck', 500,  30,    30),
  ('consistency_80', 'consistency',    'Alta Performance',    'Atinja 80% de consistência em uma semana.',        'TrendingUp',  150,  80,    40),
  ('consistency_100','perfect_week',   'Semana Imaculada',    'Atinja 100% de consistência em uma semana.',       'Star',        300, 100,    50),
  ('sessions_50',    'sessions',       'Cinquentona',         'Acumule 50 sessões totais.',                       'CheckCircle2',100,  50,    60),
  ('sessions_200',   'sessions',       'Duzentos Fortes',     'Acumule 200 sessões totais.',                      'Trophy',      400, 200,    70),
  ('minutes_1000',   'minutes',        'Mil Minutos',         'Acumule 1000 minutos de hábitos.',                 'Timer',       250, 1000,   80),
  ('minutes_5000',   'minutes',        'Cinco Mil Minutos',   'Acumule 5000 minutos de hábitos.',                 'Zap',        1000, 5000,   90),
  ('comeback',       'comeback',       'De Volta ao Jogo',    'Retome hábitos após 7+ dias de inatividade.',      'RotateCcw',   150,   1,   100)
on conflict (id) do nothing;

-- ── user_achievements ─────────────────────────
create table if not exists public.user_achievements (
  id                     uuid        primary key default gen_random_uuid(),
  user_id                uuid        not null references public.users (id) on delete cascade,
  achievement_id         text        not null references public.achievement_definitions (id),
  unlocked_at            timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index user_achievements_user_id_idx on public.user_achievements (user_id);

-- ── xp_events ─────────────────────────────────
-- Append-only XP ledger; sum gives current XP
create table if not exists public.xp_events (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references public.users (id) on delete cascade,
  source         text        not null,   -- 'achievement' | 'session' | 'streak' | 'bonus'
  source_id      text,                   -- achievement_id or habit_id
  amount         integer     not null,
  created_at     timestamptz not null default now()
);

create index xp_events_user_id_idx on public.xp_events (user_id);

-- Update users.xp after each xp_event insert
create or replace function public.handle_xp_event()
returns trigger language plpgsql as $$
begin
  update public.users
  set xp = xp + new.amount
  where id = new.user_id;
  return new;
end;
$$;

create trigger xp_event_update_user
  after insert on public.xp_events
  for each row execute procedure public.handle_xp_event();

comment on table public.achievement_definitions is 'Static catalog of all achievement types.';
comment on table public.user_achievements       is 'Per-user achievement unlock records.';
comment on table public.xp_events              is 'Append-only XP ledger.';
