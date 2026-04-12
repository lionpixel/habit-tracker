-- ─────────────────────────────────────────────
-- Migration 004 — Sleep Tracking
-- sleep_entries  — daily wake/sleep records
-- sleep_config   — per-user target settings
-- ─────────────────────────────────────────────

create table if not exists public.sleep_config (
  user_id      uuid    primary key references public.users (id) on delete cascade,
  target_wake  text    not null default '06:00',  -- "HH:MM"
  updated_at   timestamptz not null default now()
);

create trigger sleep_config_updated_at
  before update on public.sleep_config
  for each row execute procedure public.handle_updated_at();

-- ── sleep_entries ─────────────────────────────
create table if not exists public.sleep_entries (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.users (id) on delete cascade,
  date_key        text        not null,           -- "YYYY-MM-DD"
  wake_time       text        not null,           -- "HH:MM"
  sleep_time      text,                           -- "HH:MM" — optional
  sleep_duration  numeric(4,2),                   -- hours (computed)
  badge           text        not null default 'ok'
    check (badge in ('ok','near','off')),
  energy_score    smallint    check (energy_score between 1 and 10),
  notes           text,
  created_at      timestamptz not null default now()
);

create unique index sleep_entries_user_date_idx
  on public.sleep_entries (user_id, date_key);

create index sleep_entries_user_id_idx on public.sleep_entries (user_id);

-- Auto-create sleep_config on user creation
create or replace function public.handle_new_user_sleep()
returns trigger language plpgsql security definer as $$
begin
  insert into public.sleep_config (user_id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_user_created_sleep_config
  after insert on public.users
  for each row execute procedure public.handle_new_user_sleep();

comment on table public.sleep_config  is 'Per-user sleep goal configuration.';
comment on table public.sleep_entries is 'Daily sleep/wake time records.';
