-- PR7: segmentación de leads y campañas manuales de outreach.
--
-- Sigue siendo 100% manual: no hay envío automático de WhatsApp/email, no
-- hay integraciones externas, no hay scoring ni IA. Un segmento
-- (lead_segments) guarda un criterio de filtros (jsonb, validado y
-- allowlisted en la aplicación — ver src/lib/validations/lead-segment.ts,
-- nunca SQL crudo armado con input del usuario); qué leads "entran" en él
-- se calcula en vivo contra leads/contact_logs/demo_registrations cada vez
-- que se consulta (no hay tabla de membresía que se pueda desincronizar).
--
-- Una campaña (outreach_campaigns) referencia un segmento y una plantilla,
-- y tiene un ciclo de vida propio de dos pasos, ninguno de los cuales
-- envía mensajes ni crea contact_logs:
--   1. "Materializar destinatarios": snapshotea los leads que matchean el
--      segmento en este momento como outreach_campaign_recipients
--      (status = 'selected'), sin crear ninguna follow_up_task todavía.
--      Solo incluye leads con consent_contact = true, sin importar el
--      criterio del segmento (protección que no se puede desactivar).
--   2. "Generar tareas de seguimiento": por cada recipient 'selected' sin
--      follow_up_task_id todavía, crea una follow_up_task (source =
--      'campaign') y lo marca 'task_created'. Ambos pasos son
--      idempotentes: correrlos de nuevo no duplica recipients ni tareas.
--
-- campaign.status documenta en qué punto de ese ciclo está la campaña
-- (draft → ready → tasks_created), más 'completed' (disponible para
-- marcar a mano cuando ya no queda nada pendiente) y 'cancelled'.

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

do $$ begin
  create type campaign_status as enum (
    'draft',
    'ready',
    'tasks_created',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type campaign_task_priority as enum ('low', 'medium', 'high');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type campaign_recipient_status as enum (
    'selected',
    'task_created',
    'skipped',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

-- 2. lead_segments: un nombre + un criterio de filtros (jsonb). El shape
-- exacto (qué keys existen, sus tipos) lo valida y documenta
-- src/lib/validations/lead-segment.ts (leadSegmentCriteriaSchema, con
-- .strict() para rechazar keys desconocidas); acá solo se exige que sea
-- un objeto JSON, no un array/escalar.
create table if not exists public.lead_segments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  name text not null,
  description text,
  criteria jsonb not null default '{}'::jsonb,
  constraint lead_segments_name_length check (char_length(name) between 2 and 100),
  constraint lead_segments_description_length check (
    description is null or char_length(description) <= 500
  ),
  constraint lead_segments_criteria_is_object check (jsonb_typeof(criteria) = 'object')
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

-- 3. outreach_campaigns: un segmento + una plantilla + la configuración de
-- la tarea que se va a generar por cada destinatario (task_type: canal
-- sugerido, reutiliza contact_channel; task_priority; task_title/
-- task_notes: título/notas de la tarea, con fallback al nombre de la
-- campaña si quedan vacíos; due_at: fecha sugerida para esas tareas).
create table if not exists public.outreach_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  segment_id uuid not null references public.lead_segments (id) on delete cascade,
  message_template_id uuid references public.message_templates (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  status campaign_status not null default 'draft',
  task_type contact_channel not null default 'whatsapp',
  task_priority campaign_task_priority not null default 'medium',
  task_title text,
  task_notes text,
  due_at timestamptz,
  constraint outreach_campaigns_name_length check (char_length(name) between 2 and 150),
  constraint outreach_campaigns_slug_length check (char_length(slug) between 2 and 180),
  constraint outreach_campaigns_description_length check (
    description is null or char_length(description) <= 1000
  ),
  constraint outreach_campaigns_task_title_length check (
    task_title is null or char_length(task_title) between 2 and 150
  ),
  constraint outreach_campaigns_task_notes_length check (
    task_notes is null or char_length(task_notes) <= 500
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

-- 4. outreach_campaign_recipients: snapshot de a quién le tocó esta
-- campaña y en qué paso de su propio ciclo de vida está cada uno
-- ('selected' → 'task_created', o 'skipped'/'cancelled' si no aplica).
-- A diferencia de PR7 v1, no es puramente append-only: el paso 2
-- actualiza status y follow_up_task_id, así que sí necesita policy de
-- update (nunca de delete: el historial de a quién se le seleccionó no se
-- borra, se marca skipped/cancelled).
create table if not exists public.outreach_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  campaign_id uuid not null references public.outreach_campaigns (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  follow_up_task_id uuid references public.follow_up_tasks (id) on delete set null,
  status campaign_recipient_status not null default 'selected',
  skip_reason text,
  constraint outreach_campaign_recipients_unique_lead unique (campaign_id, lead_id),
  constraint outreach_campaign_recipients_skip_reason_length check (
    skip_reason is null or char_length(skip_reason) <= 500
  )
);

create index if not exists outreach_campaign_recipients_campaign_id_idx
  on public.outreach_campaign_recipients (campaign_id);

create index if not exists outreach_campaign_recipients_lead_id_idx
  on public.outreach_campaign_recipients (lead_id);

drop trigger if exists outreach_campaign_recipients_set_updated_at on public.outreach_campaign_recipients;
create trigger outreach_campaign_recipients_set_updated_at
  before update on public.outreach_campaign_recipients
  for each row
  execute function public.set_updated_at();

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

drop policy if exists "Authenticated can update campaign recipients" on public.outreach_campaign_recipients;
create policy "Authenticated can update campaign recipients"
  on public.outreach_campaign_recipients
  for update
  to authenticated
  using (true)
  with check (true);

-- 5. follow_up_tasks.campaign_id: liga la tarea generada con la campaña
-- que la creó (source = 'campaign'). on delete set null: si se borra la
-- campaña, la tarea (y su historial) se conserva, solo pierde el enlace.
-- No reemplaza outreach_campaign_recipients.follow_up_task_id (ese es el
-- enlace recipient → tarea; este es tarea → campaña, útil para filtrar
-- follow_up_tasks por campaña directamente sin pasar por recipients).
alter table public.follow_up_tasks
  add column if not exists campaign_id uuid references public.outreach_campaigns (id) on delete set null;

create index if not exists follow_up_tasks_campaign_id_idx
  on public.follow_up_tasks (campaign_id);
