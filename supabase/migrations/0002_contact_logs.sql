-- PR2: estados comerciales ampliados, interés primario, campos de
-- seguimiento en leads y bitácora de contactos (contact_logs).

-- 1. Estados comerciales ampliados (reemplaza el enum de 4 valores de PR1).
alter table public.leads alter column status drop default;
alter table public.leads alter column status type text using status::text;
drop type if exists lead_status;
create type lead_status as enum (
  'new',
  'contacted',
  'interested',
  'invited_to_demo',
  'confirmed_demo',
  'attended',
  'no_show',
  'post_demo_follow_up',
  'purchased',
  'lost'
);
update public.leads set status = case status
  when 'nuevo' then 'new'
  when 'contactado' then 'contacted'
  when 'convertido' then 'purchased'
  when 'descartado' then 'lost'
  else 'new'
end;
alter table public.leads
  alter column status type lead_status using status::lead_status,
  alter column status set default 'new';

-- 2. Interés primario (reemplaza "interest"/lead_interest de PR1).
alter table public.leads alter column interest drop default;
alter table public.leads alter column interest type text using interest::text;
drop type if exists lead_interest;
create type primary_interest as enum (
  'easy_recipes',
  'save_time',
  'in_person_demo',
  'virtual_demo',
  'buy_thermomix',
  'more_info'
);
update public.leads set interest = case interest
  when 'recetas' then 'easy_recipes'
  when 'demo_cocina' then 'in_person_demo'
  when 'demo_thermomix' then 'in_person_demo'
  when 'otro' then 'more_info'
  else 'more_info'
end;
alter table public.leads rename column interest to primary_interest;
alter table public.leads
  alter column primary_interest type primary_interest using primary_interest::primary_interest,
  alter column primary_interest set default 'more_info';

-- 3. Campos de seguimiento en leads: notas del admin, último contacto y
-- próximo seguimiento programado.
alter table public.leads add column if not exists notes text;
alter table public.leads add column if not exists next_follow_up_at timestamptz;
alter table public.leads add column if not exists last_contacted_at timestamptz;

do $$ begin
  alter table public.leads
    add constraint leads_notes_length check (notes is null or char_length(notes) <= 2000);
exception
  when duplicate_object then null;
end $$;

create index if not exists leads_next_follow_up_at_idx
  on public.leads (next_follow_up_at);

-- 4. Bitácora de contactos (contact_logs): cada contacto realizado con un
-- lead, con su canal, dirección, resumen, resultado y próximo seguimiento.
do $$ begin
  create type contact_channel as enum (
    'whatsapp',
    'phone',
    'email',
    'instagram',
    'tiktok',
    'in_person',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type contact_direction as enum ('outbound', 'inbound');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.contact_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  channel contact_channel not null,
  direction contact_direction not null,
  summary text not null,
  outcome text,
  next_follow_up_at timestamptz,
  constraint contact_logs_summary_length check (char_length(summary) between 1 and 1000),
  constraint contact_logs_outcome_length check (outcome is null or char_length(outcome) <= 500)
);

create index if not exists contact_logs_lead_id_idx
  on public.contact_logs (lead_id, created_at desc);

alter table public.contact_logs enable row level security;

-- Solo el equipo admin autenticado ve y registra contactos.
-- El formulario público nunca toca esta tabla.
drop policy if exists "Authenticated can read contact logs" on public.contact_logs;
create policy "Authenticated can read contact logs"
  on public.contact_logs
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert contact logs" on public.contact_logs;
create policy "Authenticated can insert contact logs"
  on public.contact_logs
  for insert
  to authenticated
  with check (true);
