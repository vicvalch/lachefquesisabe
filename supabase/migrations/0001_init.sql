-- Esquema inicial: captura de leads para La Chef que Sí Sabe.

create extension if not exists pgcrypto;

do $$ begin
  create type lead_interest as enum ('recetas', 'demo_cocina', 'demo_thermomix', 'otro');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type lead_status as enum ('nuevo', 'contactado', 'convertido', 'descartado');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  interest lead_interest not null default 'recetas',
  message text,
  status lead_status not null default 'nuevo',
  source text not null default 'landing',
  consent_contact boolean not null default false,
  constraint leads_name_length check (char_length(name) between 2 and 100),
  constraint leads_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint leads_message_length check (message is null or char_length(message) <= 500)
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

alter table public.leads enable row level security;

-- El formulario público solo puede insertar leads (con consentimiento),
-- nunca leer, actualizar ni borrar registros existentes.
drop policy if exists "Public can submit leads" on public.leads;
create policy "Public can submit leads"
  on public.leads
  for insert
  to anon
  with check (consent_contact = true);

-- Solo usuarios autenticados (el equipo admin) pueden gestionar los leads.
drop policy if exists "Authenticated can read leads" on public.leads;
create policy "Authenticated can read leads"
  on public.leads
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can update leads" on public.leads;
create policy "Authenticated can update leads"
  on public.leads
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete leads" on public.leads;
create policy "Authenticated can delete leads"
  on public.leads
  for delete
  to authenticated
  using (true);
