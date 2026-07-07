-- PR3: demostraciones (demo_events), inscripción de leads a una demo
-- (demo_registrations), control de asistencia, y visibilidad pública para
-- que el sitio público liste demos y reciba registros sin necesitar sesión.

do $$ begin
  create type demo_mode as enum ('in_person', 'virtual');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type demo_event_status as enum (
    'draft',
    'scheduled',
    'full',
    'completed',
    'cancelled'
  );
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
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  title text not null,
  slug text not null unique,
  mode demo_mode not null default 'in_person',
  status demo_event_status not null default 'scheduled',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location_name text,
  location_address text,
  meeting_url text,
  capacity integer not null default 8,
  description text,
  public_notes text,
  internal_notes text,
  constraint demo_events_title_length check (char_length(title) between 2 and 150),
  constraint demo_events_slug_length check (char_length(slug) between 2 and 180),
  constraint demo_events_description_length check (
    description is null or char_length(description) <= 1000
  ),
  constraint demo_events_public_notes_length check (
    public_notes is null or char_length(public_notes) <= 500
  ),
  constraint demo_events_internal_notes_length check (
    internal_notes is null or char_length(internal_notes) <= 2000
  ),
  constraint demo_events_location_name_length check (
    location_name is null or char_length(location_name) <= 150
  ),
  constraint demo_events_location_address_length check (
    location_address is null or char_length(location_address) <= 250
  ),
  constraint demo_events_meeting_url_length check (
    meeting_url is null or char_length(meeting_url) <= 500
  ),
  constraint demo_events_capacity_range check (capacity between 1 and 200),
  constraint demo_events_ends_after_starts check (ends_at is null or ends_at >= starts_at)
);

create index if not exists demo_events_starts_at_idx
  on public.demo_events (starts_at);

create index if not exists demo_events_public_visibility_idx
  on public.demo_events (status, starts_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists demo_events_set_updated_at on public.demo_events;
create trigger demo_events_set_updated_at
  before update on public.demo_events
  for each row
  execute function public.set_updated_at();

alter table public.demo_events enable row level security;

-- El equipo admin autenticado gestiona demos por completo.
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

-- El sitio público solo puede leer demos programadas/con cupo lleno y que
-- todavía no ocurrieron. Nunca puede crear, actualizar ni borrar demos.
drop policy if exists "Public can read open demo events" on public.demo_events;
create policy "Public can read open demo events"
  on public.demo_events
  for select
  to anon
  using (status in ('scheduled', 'full') and starts_at >= now());

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

-- Solo el equipo admin autenticado lee y gestiona inscripciones.
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

-- El sitio público solo puede insertar su propia inscripción ("confirmed")
-- y solo contra una demo abierta (scheduled/full y todavía futura). Nunca
-- puede leer, actualizar ni borrar inscripciones (ni las propias): la
-- confirmación se comunica por WhatsApp, no releyendo la fila.
drop policy if exists "Public can register for open demo events" on public.demo_registrations;
create policy "Public can register for open demo events"
  on public.demo_registrations
  for insert
  to anon
  with check (
    attendance_status = 'confirmed'
    and exists (
      select 1
      from public.demo_events de
      where de.id = demo_event_id
        and de.status in ('scheduled', 'full')
        and de.starts_at >= now()
    )
  );
