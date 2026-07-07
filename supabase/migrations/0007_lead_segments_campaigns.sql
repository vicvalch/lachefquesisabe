-- PR7: segmentación de leads y campañas manuales de outreach.
--
-- Sigue siendo 100% manual: no hay envío automático de WhatsApp/email, no
-- hay integraciones externas, no hay scoring ni IA. Un segmento
-- (lead_segments) guarda un conjunto simple de filtros; qué leads
-- "entran" en él se calcula en vivo contra la tabla leads cada vez que se
-- consulta (no hay una tabla de membresía que se pueda desincronizar). Una
-- campaña (outreach_campaigns) referencia un segmento y una plantilla, y al
-- "generar tareas" crea una follow_up_tasks por cada lead que matchea el
-- segmento y todavía no la tenga (idempotente: correrlo de nuevo solo
-- alcanza a los leads que entraron al segmento después). El snapshot de a
-- quién ya se le generó tarea desde cada campaña queda en
-- outreach_campaign_recipients, para no duplicar.

-- 1. Nuevo source de tarea para las generadas desde una campaña. Se
-- recrea el tipo completo (igual que 0002_contact_logs.sql hizo con
-- lead_status/primary_interest) porque ALTER TYPE ... ADD VALUE no puede
-- usarse de forma segura dentro de la misma migración en la que además se
-- referencia ese valor nuevo.
alter table public.follow_up_tasks alter column source drop default;
alter table public.follow_up_tasks alter column source type text using source::text;
drop type if exists task_source;
create type task_source as enum (
  'initial_contact',
  'demo_invitation',
  'demo_confirmation',
  'demo_reminder',
  'post_demo_follow_up',
  'no_show_recovery',
  'status_change',
  'contact_log',
  'manual',
  'campaign'
);
alter table public.follow_up_tasks
  alter column source type task_source using source::task_source,
  alter column source set default 'manual';

-- 2. lead_segments: un conjunto de filtros simples con nombre. Cada campo
-- de filtro es opcional (arreglo vacío / null = sin restricción en esa
-- dimensión); listLeadsMatchingSegment (código) los combina con AND.
create table if not exists public.lead_segments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  name text not null,
  description text,
  filter_statuses lead_status[] not null default '{}',
  filter_primary_interests primary_interest[] not null default '{}',
  filter_source text,
  filter_created_after timestamptz,
  filter_created_before timestamptz,
  filter_has_open_task boolean,
  constraint lead_segments_name_length check (char_length(name) between 2 and 100),
  constraint lead_segments_description_length check (
    description is null or char_length(description) <= 500
  ),
  constraint lead_segments_filter_source_length check (
    filter_source is null or char_length(filter_source) <= 100
  ),
  constraint lead_segments_created_range check (
    filter_created_after is null
    or filter_created_before is null
    or filter_created_after <= filter_created_before
  )
);

drop trigger if exists lead_segments_set_updated_at on public.lead_segments;
create trigger lead_segments_set_updated_at
  before update on public.lead_segments
  for each row
  execute function public.set_updated_at();

alter table public.lead_segments enable row level security;

-- Uso exclusivo del equipo admin: los segmentos son una herramienta interna
-- para organizar el trabajo de seguimiento, el sitio público nunca los toca.
drop policy if exists "Authenticated can read lead segments" on public.lead_segments;
create policy "Authenticated can read lead segments"
  on public.lead_segments
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert lead segments" on public.lead_segments;
create policy "Authenticated can insert lead segments"
  on public.lead_segments
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update lead segments" on public.lead_segments;
create policy "Authenticated can update lead segments"
  on public.lead_segments
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete lead segments" on public.lead_segments;
create policy "Authenticated can delete lead segments"
  on public.lead_segments
  for delete
  to authenticated
  using (true);

-- 3. outreach_campaigns: una campaña manual = un segmento + una plantilla
-- sugerida + un nombre. No tiene columna de estado: "borrador" vs
-- "enviada" se deriva de si ya tiene filas en outreach_campaign_recipients
-- (ver src/lib/campaigns/queries.ts), para no mantener dos fuentes de
-- verdad sincronizadas.
create table if not exists public.outreach_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  segment_id uuid not null references public.lead_segments (id) on delete cascade,
  message_template_key text references public.message_templates (key) on delete set null,
  name text not null,
  notes text,
  constraint outreach_campaigns_name_length check (char_length(name) between 2 and 150),
  constraint outreach_campaigns_notes_length check (
    notes is null or char_length(notes) <= 1000
  )
);

create index if not exists outreach_campaigns_segment_id_idx
  on public.outreach_campaigns (segment_id);

drop trigger if exists outreach_campaigns_set_updated_at on public.outreach_campaigns;
create trigger outreach_campaigns_set_updated_at
  before update on public.outreach_campaigns
  for each row
  execute function public.set_updated_at();

alter table public.outreach_campaigns enable row level security;

drop policy if exists "Authenticated can read outreach campaigns" on public.outreach_campaigns;
create policy "Authenticated can read outreach campaigns"
  on public.outreach_campaigns
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert outreach campaigns" on public.outreach_campaigns;
create policy "Authenticated can insert outreach campaigns"
  on public.outreach_campaigns
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update outreach campaigns" on public.outreach_campaigns;
create policy "Authenticated can update outreach campaigns"
  on public.outreach_campaigns
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete outreach campaigns" on public.outreach_campaigns;
create policy "Authenticated can delete outreach campaigns"
  on public.outreach_campaigns
  for delete
  to authenticated
  using (true);

-- 4. outreach_campaign_recipients: snapshot de a qué lead ya se le generó
-- una tarea desde esta campaña. Es un registro de auditoría (append-only,
-- igual que contact_logs): no se edita ni se borra a mano, así que solo
-- tiene políticas de lectura e inserción.
create table if not exists public.outreach_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  campaign_id uuid not null references public.outreach_campaigns (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  follow_up_task_id uuid references public.follow_up_tasks (id) on delete set null,
  constraint outreach_campaign_recipients_unique_lead unique (campaign_id, lead_id)
);

create index if not exists outreach_campaign_recipients_campaign_id_idx
  on public.outreach_campaign_recipients (campaign_id);

create index if not exists outreach_campaign_recipients_lead_id_idx
  on public.outreach_campaign_recipients (lead_id);

alter table public.outreach_campaign_recipients enable row level security;

drop policy if exists "Authenticated can read campaign recipients" on public.outreach_campaign_recipients;
create policy "Authenticated can read campaign recipients"
  on public.outreach_campaign_recipients
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert campaign recipients" on public.outreach_campaign_recipients;
create policy "Authenticated can insert campaign recipients"
  on public.outreach_campaign_recipients
  for insert
  to authenticated
  with check (true);

-- 5. follow_up_tasks.campaign_id: liga la tarea generada con la campaña
-- que la creó (source = 'campaign'). on delete set null: si se borra la
-- campaña, la tarea (y su historial) se conserva, solo pierde el enlace.
alter table public.follow_up_tasks
  add column if not exists campaign_id uuid references public.outreach_campaigns (id) on delete set null;

create index if not exists follow_up_tasks_campaign_id_idx
  on public.follow_up_tasks (campaign_id);
