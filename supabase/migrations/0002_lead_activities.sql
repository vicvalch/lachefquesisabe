-- Notas de seguimiento y registro de contactos por lead (PR2).

do $$ begin
  create type lead_activity_type as enum ('note', 'contact');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type contact_channel as enum ('whatsapp', 'llamada', 'email', 'otro');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  type lead_activity_type not null,
  channel contact_channel,
  content text not null,
  constraint lead_activities_content_length check (char_length(content) between 1 and 1000),
  constraint lead_activities_channel_matches_type check (
    (type = 'contact' and channel is not null) or (type = 'note' and channel is null)
  )
);

create index if not exists lead_activities_lead_id_idx
  on public.lead_activities (lead_id, created_at desc);

alter table public.lead_activities enable row level security;

-- Solo el equipo admin autenticado ve y gestiona notas/contactos.
-- El formulario público nunca toca esta tabla.
drop policy if exists "Authenticated can read lead activities" on public.lead_activities;
create policy "Authenticated can read lead activities"
  on public.lead_activities
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert lead activities" on public.lead_activities;
create policy "Authenticated can insert lead activities"
  on public.lead_activities
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can delete lead activities" on public.lead_activities;
create policy "Authenticated can delete lead activities"
  on public.lead_activities
  for delete
  to authenticated
  using (true);
