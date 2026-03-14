create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists admin_users_select_own on public.admin_users;
create policy admin_users_select_own
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists feedback_insert_own on public.item_feedback;
create policy feedback_insert_own
on public.item_feedback
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    attempt_id is null
    or exists (
      select 1 from public.quiz_attempts qa
      where qa.id = item_feedback.attempt_id
        and qa.user_id = auth.uid()
    )
  )
);
