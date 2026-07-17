create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.personal_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_date date not null,
  source text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, record_date, source)
);

create table public.automation_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider_preference text not null default 'auto' check (provider_preference in ('auto', 'google', 'microsoft')),
  reminder_email text,
  morning_time time not null default '08:00',
  evening_time time not null default '21:00',
  quiet_start time not null default '22:00',
  quiet_end time not null default '07:00',
  timezone text not null default 'UTC',
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('notion', 'fitbit', 'whoop', 'apple_health')),
  job_type text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text
);

create schema if not exists private;
create table private.provider_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  encrypted_tokens bytea not null,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.profiles enable row level security;
alter table public.personal_data enable row level security;
alter table public.health_records enable row level security;
alter table public.automation_preferences enable row level security;
alter table public.sync_jobs enable row level security;

create policy "users manage their profile" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "users manage their own personal data" on public.personal_data for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their own health records" on public.health_records for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their own automation preferences" on public.automation_preferences for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users view their own sync jobs" on public.sync_jobs for select to authenticated using ((select auth.uid()) = user_id);
create policy "users create their own sync jobs" on public.sync_jobs for insert to authenticated with check ((select auth.uid()) = user_id);

revoke all on schema private from public, anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
