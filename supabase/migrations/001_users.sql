-- ─────────────────────────────────────────────
-- Migration 001 — Users
-- Extends Supabase auth.users with app-specific
-- profile data. The id column references auth.users
-- so Supabase Auth manages authentication.
-- ─────────────────────────────────────────────

create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text        not null unique,
  name        text,
  avatar_url  text,
  level       integer     not null default 1,
  xp          integer     not null default 0,
  streak      integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on row change
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

comment on table public.users is 'App user profiles — extends Supabase auth.users.';
