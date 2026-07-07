-- PR3: demostraciones (demo_events), registro de leads a una demo
-- (demo_registrations) y control de asistencia. Uso exclusivo del equipo
-- admin: el formulario público nunca crea ni lee demos.

do $$ begin
  create type demo_type as enum ('in_person', 'virtual');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type demo_event_status as enum ('scheduled', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type attendance_status as enum (
    'registered',
    'confirmed',
    'attended',
    'no_show',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.demo_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  title text not null,
  description text,
  demo_type demo_type not null default 'in_person',
  location text,
  scheduled_at timestamptz not null,
  capacity integer not null default 8,
  status demo_event_status not null default 'scheduled',
  notes text,
  constraint demo_events_title_length check (char_length(title) between 2 and 150),
  constraint demo_events_description_length check (
    description is null or char_length(description) <= 1000
  ),
  constraint demo_events_location_length check (
    location is null or char_length(location) <= 200
  ),
  constraint demo_events_notes_length check (notes is null or char_length(notes) <= 2000),
  constraint demo_events_capacity_range check (capacity between 1 and 200)
);

create index if not exists demo_events_scheduled_at_idx
  on public.demo_events (scheduled_at);

alter table public.demo_events enable row level security;

-- Solo el equipo admin autenticado gestiona demos. El formulario público
-- nunca toca esta tabla.
drop policy if exists "Authenticated can read demo events" on public.demo_events;
create policy "Authenticated can read demo events"
  on public.demo_events
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert demo events" on public.demo_events;
create policy "Authenticated can insert demo events"
  on public.demo_events
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update demo events" on public.demo_events;
create policy "Authenticated can update demo events"
  on public.demo_events
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete demo events" on public.demo_events;
create policy "Authenticated can delete demo events"
  on public.demo_events
  for delete
  to authenticated
  using (true);

create table if not exists public.demo_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  demo_event_id uuid not null references public.demo_events (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  attendance_status attendance_status not null default 'registered',
  notes text,
  constraint demo_registrations_notes_length check (
    notes is null or char_length(notes) <= 1000
  ),
  constraint demo_registrations_unique_lead_per_demo unique (demo_event_id, lead_id)
);

create index if not exists demo_registrations_demo_event_id_idx
  on public.demo_registrations (demo_event_id);

create index if not exists demo_registrations_lead_id_idx
  on public.demo_registrations (lead_id);

alter table public.demo_registrations enable row level security;

drop policy if exists "Authenticated can read demo registrations" on public.demo_registrations;
create policy "Authenticated can read demo registrations"
  on public.demo_registrations
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert demo registrations" on public.demo_registrations;
create policy "Authenticated can insert demo registrations"
  on public.demo_registrations
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update demo registrations" on public.demo_registrations;
create policy "Authenticated can update demo registrations"
  on public.demo_registrations
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete demo registrations" on public.demo_registrations;
create policy "Authenticated can delete demo registrations"
  on public.demo_registrations
  for delete
  to authenticated
  using (true);
