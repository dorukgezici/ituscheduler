-- Row Level Security for all public tables.
--
-- Prior to this migration every table had `GRANT ALL` to the `anon` and
-- `authenticated` roles with RLS disabled, so anyone holding the public anon
-- key (embedded in the browser bundle) could INSERT/UPDATE/DELETE catalog
-- data, other users' schedules, and even read the legacy `users` table which
-- stores password hashes. This migration enables RLS everywhere and replaces
-- the blanket grants with least-privilege policies.
--
-- Model:
--   * Course catalog (courses, lectures, majors, course_codes, semesters) is
--     public information: anyone (anon) can SELECT. Writes are reserved for
--     the service_role (the ingestion trigger), which bypasses RLS.
--   * User-owned tables (schedules, schedule_courses, user_courses,
--     user_major) are scoped to the owning auth user via auth.uid().
--   * Legacy/sensitive tables (posts, users, sessions) expose nothing to anon
--     or authenticated roles; only the service_role can reach them.
--
-- service_role always bypasses RLS, so the ingestion jobs keep working once
-- they authenticate with the service role key.

-- ---------------------------------------------------------------------------
-- Enable RLS on every table that doesn't already have it.
-- ---------------------------------------------------------------------------
alter table public.courses          enable row level security;
alter table public.lectures         enable row level security;
alter table public.majors           enable row level security;
alter table public.posts            enable row level security;
alter table public.schedules        enable row level security;
alter table public.schedule_courses enable row level security;
alter table public.user_courses     enable row level security;
alter table public.user_major       enable row level security;
alter table public.users            enable row level security;
alter table public.sessions         enable row level security;
-- public.semesters already has RLS enabled (20260704000000_semesters_table.sql).

-- ===========================================================================
-- Course catalog: publicly readable, service_role-writable.
-- ===========================================================================

-- courses
drop policy if exists "Courses are readable by everyone" on public.courses;
create policy "Courses are readable by everyone"
  on public.courses for select to anon, authenticated using (true);

-- lectures
drop policy if exists "Lectures are readable by everyone" on public.lectures;
create policy "Lectures are readable by everyone"
  on public.lectures for select to anon, authenticated using (true);

-- majors
drop policy if exists "Majors are readable by everyone" on public.majors;
create policy "Majors are readable by everyone"
  on public.majors for select to anon, authenticated using (true);

-- course_codes is a view over public.courses; it inherits RLS from the base
-- table, so no dedicated policy is needed. We just keep SELECT granted below.

-- ===========================================================================
-- Schedules: owner-scoped. schedules.user_id -> auth.users.id (uuid).
-- ===========================================================================

drop policy if exists "Users can read their own schedules" on public.schedules;
create policy "Users can read their own schedules"
  on public.schedules for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert their own schedules" on public.schedules;
create policy "Users can insert their own schedules"
  on public.schedules for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own schedules" on public.schedules;
create policy "Users can update their own schedules"
  on public.schedules for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete their own schedules" on public.schedules;
create policy "Users can delete their own schedules"
  on public.schedules for delete to authenticated
  using (user_id = auth.uid());

-- ===========================================================================
-- schedule_courses: scoped through the owning schedule.
-- A row is accessible iff the referenced schedules row belongs to auth.uid().
-- ===========================================================================

drop policy if exists "Users can read their schedule courses" on public.schedule_courses;
create policy "Users can read their schedule courses"
  on public.schedule_courses for select to authenticated
  using (exists (
    select 1 from public.schedules s
    where s.id = schedule_courses.schedule_id
      and s.user_id = auth.uid()));

drop policy if exists "Users can insert their schedule courses" on public.schedule_courses;
create policy "Users can insert their schedule courses"
  on public.schedule_courses for insert to authenticated
  with check (exists (
    select 1 from public.schedules s
    where s.id = schedule_courses.schedule_id
      and s.user_id = auth.uid()));

drop policy if exists "Users can update their schedule courses" on public.schedule_courses;
create policy "Users can update their schedule courses"
  on public.schedule_courses for update to authenticated
  using (exists (
    select 1 from public.schedules s
    where s.id = schedule_courses.schedule_id
      and s.user_id = auth.uid()))
  with check (exists (
    select 1 from public.schedules s
    where s.id = schedule_courses.schedule_id
      and s.user_id = auth.uid()));

drop policy if exists "Users can delete their schedule courses" on public.schedule_courses;
create policy "Users can delete their schedule courses"
  on public.schedule_courses for delete to authenticated
  using (exists (
    select 1 from public.schedules s
    where s.id = schedule_courses.schedule_id
      and s.user_id = auth.uid()));

-- ===========================================================================
-- user_courses: owner-scoped. user_courses.user_id -> auth.users.id (uuid).
-- ===========================================================================

drop policy if exists "Users can read their own user_courses" on public.user_courses;
create policy "Users can read their own user_courses"
  on public.user_courses for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert their own user_courses" on public.user_courses;
create policy "Users can insert their own user_courses"
  on public.user_courses for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own user_courses" on public.user_courses;
create policy "Users can update their own user_courses"
  on public.user_courses for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete their own user_courses" on public.user_courses;
create policy "Users can delete their own user_courses"
  on public.user_courses for delete to authenticated
  using (user_id = auth.uid());

-- ===========================================================================
-- user_major: owner-scoped. user_major.user_id -> auth.users.id (uuid).
-- ===========================================================================

drop policy if exists "Users can read their own major" on public.user_major;
create policy "Users can read their own major"
  on public.user_major for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert their own major" on public.user_major;
create policy "Users can insert their own major"
  on public.user_major for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own major" on public.user_major;
create policy "Users can update their own major"
  on public.user_major for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete their own major" on public.user_major;
create policy "Users can delete their own major"
  on public.user_major for delete to authenticated
  using (user_id = auth.uid());

-- ===========================================================================
-- posts: public announcements (author/date/content) — readable by everyone,
-- writable only by the service_role.
drop policy if exists "Posts are readable by everyone" on public.posts;
create policy "Posts are readable by everyone"
  on public.posts for select to anon, authenticated using (true);

-- ===========================================================================
-- Legacy / sensitive tables: no anon or authenticated access.
-- users (legacy, stores password hashes), sessions (legacy, tokens).
-- Only the service_role (RLS-bypassing) can reach these. We still enable RLS
-- so that even if grants leak, the empty policy set denies anon/authenticated.
-- ===========================================================================
-- No policies defined: default-deny for anon and authenticated.

-- ---------------------------------------------------------------------------
-- Tighten table grants: revoke write privileges from anon everywhere and
-- keep only the SELECT that the public-read policies require. The
-- authenticated role keeps broad grants on user-owned tables (RLS gates them)
-- but is revoked on catalog/legacy tables. service_role keeps ALL (it
-- bypasses RLS and powers the ingestion trigger).
-- ---------------------------------------------------------------------------

-- Catalog tables: anon gets SELECT only; authenticated gets SELECT only.
revoke all on table public.courses from anon, authenticated;
grant select on table public.courses to anon, authenticated;

revoke all on table public.lectures from anon, authenticated;
grant select on table public.lectures to anon, authenticated;

revoke all on table public.majors from anon, authenticated;
grant select on table public.majors to anon, authenticated;

-- course_codes view: SELECT only for anon/authenticated.
revoke all on table public.course_codes from anon, authenticated;
grant select on table public.course_codes to anon, authenticated;

-- semesters: keep existing public-read behavior, drop write grants from anon.
revoke insert, update, delete, truncate, references, trigger
  on table public.semesters from anon, authenticated;
grant select on table public.semesters to anon, authenticated;

-- User-owned tables: authenticated keeps full privileges (RLS scopes them);
-- anon gets nothing.
revoke all on table public.schedules from anon;
revoke all on table public.schedule_courses from anon;
revoke all on table public.user_courses from anon;
revoke all on table public.user_major from anon;

-- posts: anon/authenticated keep SELECT (public read); writes revoked.
revoke all on table public.posts from anon, authenticated;
grant select on table public.posts to anon, authenticated;

-- Legacy / sensitive tables: no anon or authenticated access at all.
revoke all on table public.users from anon, authenticated;
revoke all on table public.sessions from anon, authenticated;

-- Sequences used by user-owned tables: only authenticated needs usage for
-- inserts (schedules_id_seq). anon loses it.
revoke all on sequence public.schedules_id_seq from anon;
grant usage, select on sequence public.schedules_id_seq to authenticated;

-- Catalog/legacy sequences: anon had ALL purely because of the blanket grant.
-- The ingestion (service_role) and authenticated users don't need them.
revoke all on sequence public.lectures_id_seq from anon, authenticated;
revoke all on sequence public.posts_id_seq from anon, authenticated;
