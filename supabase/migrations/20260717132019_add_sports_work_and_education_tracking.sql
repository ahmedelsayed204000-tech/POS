create table public.athlete_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  primary_sport text not null default 'General fitness',
  experience_level text not null default 'recreational'
    check (experience_level in ('beginner', 'recreational', 'competitive', 'elite')),
  weekly_training_target smallint not null default 4
    check (weekly_training_target between 1 and 21),
  height_cm numeric(5,2) check (height_cm is null or height_cm > 0),
  weight_kg numeric(6,2) check (weight_kg is null or weight_kg > 0),
  goals text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null,
  sport text not null,
  session_type text not null,
  duration_minutes smallint not null check (duration_minutes between 1 and 1440),
  intensity smallint not null check (intensity between 1 and 10),
  distance_km numeric(8,2) check (distance_km is null or distance_km >= 0),
  calories_burned integer check (calories_burned is null or calories_burned >= 0),
  status text not null default 'completed' check (status in ('planned', 'completed', 'skipped')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  food_name text not null,
  calories integer not null default 0 check (calories >= 0),
  protein_g numeric(7,2) not null default 0 check (protein_g >= 0),
  carbs_g numeric(7,2) not null default 0 check (carbs_g >= 0),
  fat_g numeric(7,2) not null default 0 check (fat_g >= 0),
  water_ml integer not null default 0 check (water_ml >= 0),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.athlete_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  metric_type text not null,
  value numeric(12,3) not null,
  unit text not null,
  source text not null default 'manual',
  notes text not null default ''
);

create table public.work_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  employer text not null default '',
  role_title text not null default '',
  weekly_hours_target numeric(5,2) not null default 40 check (weekly_hours_target between 0 and 168),
  career_goal text not null default '',
  updated_at timestamptz not null default now()
);

create table public.work_shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  break_minutes smallint not null default 0 check (break_minutes between 0 and 720),
  shift_type text not null default 'regular' check (shift_type in ('regular', 'night', 'overtime', 'on_call', 'remote', 'leave')),
  employer text not null default '',
  role_title text not null default '',
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'missed', 'cancelled')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time <> start_time)
);

create table public.career_development (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('course', 'certification', 'workshop', 'postgraduate', 'degree', 'self_study')),
  title text not null,
  provider text not null default '',
  field_of_study text not null default '',
  status text not null default 'planned' check (status in ('planned', 'active', 'paused', 'completed', 'cancelled')),
  start_date date,
  target_date date,
  progress smallint not null default 0 check (progress between 0 and 100),
  weekly_hours_target numeric(5,2) not null default 0 check (weekly_hours_target between 0 and 168),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (target_date is null or start_date is null or target_date >= start_date)
);

create table public.career_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization text not null,
  role_title text not null,
  opportunity_type text not null default 'job' check (opportunity_type in ('job', 'promotion', 'freelance', 'internship', 'research')),
  status text not null default 'interested' check (status in ('interested', 'applied', 'screening', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn')),
  applied_date date,
  next_action text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index training_sessions_user_date_idx on public.training_sessions (user_id, session_date desc);
create index nutrition_logs_user_date_idx on public.nutrition_logs (user_id, log_date desc);
create index athlete_metrics_user_recorded_idx on public.athlete_metrics (user_id, recorded_at desc);
create index work_shifts_user_date_idx on public.work_shifts (user_id, shift_date desc);
create index career_development_user_status_idx on public.career_development (user_id, status, target_date);
create index career_opportunities_user_status_idx on public.career_opportunities (user_id, status, updated_at desc);

alter table public.athlete_profiles enable row level security;
alter table public.training_sessions enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.athlete_metrics enable row level security;
alter table public.work_profiles enable row level security;
alter table public.work_shifts enable row level security;
alter table public.career_development enable row level security;
alter table public.career_opportunities enable row level security;

create policy "users manage their athlete profile" on public.athlete_profiles for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their training sessions" on public.training_sessions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their nutrition logs" on public.nutrition_logs for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their athlete metrics" on public.athlete_metrics for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their work profile" on public.work_profiles for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their work shifts" on public.work_shifts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their career development" on public.career_development for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their career opportunities" on public.career_opportunities for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.athlete_profiles, public.training_sessions, public.nutrition_logs, public.athlete_metrics, public.work_profiles, public.work_shifts, public.career_development, public.career_opportunities to authenticated;
revoke all on public.athlete_profiles, public.training_sessions, public.nutrition_logs, public.athlete_metrics, public.work_profiles, public.work_shifts, public.career_development, public.career_opportunities from anon;

-- Current Supabase Data API defaults do not auto-expose SQL-created tables.
-- The frontend sync layer needs only the user's JSON document; RLS still
-- limits every operation to the authenticated owner.
grant select, insert, update, delete on public.personal_data to authenticated;
revoke all on public.personal_data from anon;
