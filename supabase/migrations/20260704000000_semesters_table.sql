-- Tracks the currently active ITU semester reported by the OBS public API.
-- Single-row table (id = 1) updated on each ingestion run.
create table if not exists public.semesters (
  id integer primary key default 1,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.semesters enable row level security;

-- The active semester is public information; allow anyone to read it.
drop policy if exists "Semesters are readable by everyone" on public.semesters;
create policy "Semesters are readable by everyone"
  on public.semesters
  for select
  using (true);
