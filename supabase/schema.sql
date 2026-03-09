-- Extensions
create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  preferred_language text not null default 'es' check (preferred_language in ('es', 'en')),
  region text,
  target_exam_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Questions bank (private, only server-side access)
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section = 'quant'),
  topic text not null,
  subtopic text not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  stem text not null,
  choices jsonb not null,
  correct_choice text not null check (correct_choice in ('A', 'B', 'C', 'D', 'E')),
  explanation_en text not null,
  explanation_es text not null,
  source_type text not null default 'original' check (source_type = 'original'),
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'published')),
  reviewer_1 uuid references auth.users(id),
  reviewer_2 uuid references auth.users(id),
  quality_flags jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- Attempts summary
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  section text not null check (section = 'quant'),
  requested_filters jsonb not null,
  time_limit_seconds integer not null check (time_limit_seconds between 60 and 10800),
  total_questions integer not null check (total_questions between 1 and 100),
  correct_answers integer not null check (correct_answers >= 0),
  score_accuracy numeric(5, 2) not null check (score_accuracy between 0 and 100),
  avg_time_seconds numeric(8, 2) not null check (avg_time_seconds >= 0),
  started_at timestamptz not null default now(),
  submitted_at timestamptz not null default now()
);

-- Attempt items
create table if not exists public.attempt_items (
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  selected_choice text not null check (selected_choice in ('A', 'B', 'C', 'D', 'E')),
  is_correct boolean not null,
  time_spent_seconds integer not null check (time_spent_seconds >= 0),
  primary key (attempt_id, question_id)
);

-- Mastery snapshots by week
create table if not exists public.mastery_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  subtopic text not null,
  questions_answered integer not null check (questions_answered >= 0),
  accuracy numeric(5, 2) not null check (accuracy between 0 and 100),
  avg_time_seconds numeric(8, 2) not null check (avg_time_seconds >= 0),
  snapshot_week date not null,
  updated_at timestamptz not null default now(),
  unique (user_id, topic, subtopic, snapshot_week)
);

-- Item feedback
create table if not exists public.item_feedback (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  attempt_id uuid references public.quiz_attempts(id) on delete set null,
  feedback_type text not null check (feedback_type in ('error', 'ambiguous', 'too_easy', 'too_hard', 'other')),
  comment text,
  difficulty_vote smallint check (difficulty_vote between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists idx_questions_filter
  on public.questions (section, status, topic, subtopic, difficulty);

create unique index if not exists idx_questions_unique_stem
  on public.questions (section, topic, subtopic, stem);

create index if not exists idx_quiz_attempts_user_submitted
  on public.quiz_attempts (user_id, submitted_at desc);

create index if not exists idx_attempt_items_attempt
  on public.attempt_items (attempt_id);

create index if not exists idx_mastery_user_week
  on public.mastery_snapshots (user_id, snapshot_week desc);

create index if not exists idx_feedback_question
  on public.item_feedback (question_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_questions_updated_at on public.questions;
create trigger trg_questions_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

-- RLS
alter table public.user_profiles enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.attempt_items enable row level security;
alter table public.mastery_snapshots enable row level security;
alter table public.item_feedback enable row level security;

-- user_profiles policies
drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own
on public.user_profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists user_profiles_insert_own on public.user_profiles;
create policy user_profiles_insert_own
on public.user_profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own
on public.user_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- questions table is private for client roles; only service role should read/write
drop policy if exists questions_no_access_auth on public.questions;
create policy questions_no_access_auth
on public.questions
for all
to authenticated
using (false)
with check (false);

drop policy if exists questions_no_access_anon on public.questions;
create policy questions_no_access_anon
on public.questions
for all
to anon
using (false)
with check (false);

-- quiz_attempts policies
drop policy if exists quiz_attempts_select_own on public.quiz_attempts;
create policy quiz_attempts_select_own
on public.quiz_attempts
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists quiz_attempts_insert_own on public.quiz_attempts;
create policy quiz_attempts_insert_own
on public.quiz_attempts
for insert
to authenticated
with check (user_id = auth.uid());

-- attempt_items policies via parent attempt ownership
drop policy if exists attempt_items_select_own on public.attempt_items;
create policy attempt_items_select_own
on public.attempt_items
for select
to authenticated
using (
  exists (
    select 1 from public.quiz_attempts qa
    where qa.id = attempt_items.attempt_id
      and qa.user_id = auth.uid()
  )
);

drop policy if exists attempt_items_insert_own on public.attempt_items;
create policy attempt_items_insert_own
on public.attempt_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.quiz_attempts qa
    where qa.id = attempt_items.attempt_id
      and qa.user_id = auth.uid()
  )
);

-- mastery snapshots
drop policy if exists mastery_select_own on public.mastery_snapshots;
create policy mastery_select_own
on public.mastery_snapshots
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists mastery_insert_own on public.mastery_snapshots;
create policy mastery_insert_own
on public.mastery_snapshots
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists mastery_update_own on public.mastery_snapshots;
create policy mastery_update_own
on public.mastery_snapshots
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- feedback
drop policy if exists feedback_select_own on public.item_feedback;
create policy feedback_select_own
on public.item_feedback
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists feedback_insert_own on public.item_feedback;
create policy feedback_insert_own
on public.item_feedback
for insert
to authenticated
with check (user_id = auth.uid());
