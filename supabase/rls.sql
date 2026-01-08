alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.payments enable row level security;
alter table public.lesson_progress enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$ language sql stable;

drop policy if exists "courses_read_published" on public.courses;
create policy "courses_read_published"
on public.courses for select
using (is_published = true);

drop policy if exists "courses_admin_all" on public.courses;
create policy "courses_admin_all"
on public.courses for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "lessons_read_free" on public.lessons;
create policy "lessons_read_free"
on public.lessons for select
using (is_free = true and exists (select 1 from public.courses c where c.id = course_id and c.is_published = true));

drop policy if exists "lessons_read_paid_for_active" on public.lessons;
create policy "lessons_read_paid_for_active"
on public.lessons for select
using (
  is_free = true
  or exists (
    select 1 from public.enrollments e
    where e.course_id = lessons.course_id and e.user_id = auth.uid() and e.status = 'active'
  )
);

drop policy if exists "lessons_admin_all" on public.lessons;
create policy "lessons_admin_all"
on public.lessons for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read"
on public.profiles for select
using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
on public.profiles for update
using (id = auth.uid() or public.is_admin(auth.uid()))
with check (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "enrollments_read_own_or_admin" on public.enrollments;
create policy "enrollments_read_own_or_admin"
on public.enrollments for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "enrollments_insert_own" on public.enrollments;
create policy "enrollments_insert_own"
on public.enrollments for insert
with check (user_id = auth.uid());

drop policy if exists "enrollments_update_admin" on public.enrollments;
create policy "enrollments_update_admin"
on public.enrollments for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "payments_read_own_or_admin" on public.payments;
create policy "payments_read_own_or_admin"
on public.payments for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own"
on public.payments for insert
with check (user_id = auth.uid());

drop policy if exists "payments_update_admin" on public.payments;
create policy "payments_update_admin"
on public.payments for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- lesson_progress: user reads/inserts own; admin can read all
drop policy if exists "progress_read_own_or_admin" on public.lesson_progress;
create policy "progress_read_own_or_admin"
on public.lesson_progress for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "progress_upsert_own" on public.lesson_progress;
create policy "progress_upsert_own"
on public.lesson_progress for insert
with check (user_id = auth.uid());

drop policy if exists "progress_delete_own" on public.lesson_progress;
create policy "progress_delete_own"
on public.lesson_progress for delete
using (user_id = auth.uid());
