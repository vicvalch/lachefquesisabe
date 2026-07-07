-- PR6: arquitectura real de seguimiento. Reemplaza el mecanismo liviano de
-- PR5 (basado únicamente en leads.next_follow_up_at) por tareas de
-- seguimiento persistidas (follow_up_tasks) con ciclo de vida propio y
-- plantillas de mensaje editables desde el admin (message_templates).
--
-- Todo sigue siendo manual: no hay envío automático de WhatsApp/email, no
-- hay cron jobs ni integraciones externas. Lo único "automático" es la
-- creación de la tarea inicial cuando ocurre un evento importante (se crea
-- un lead, se inscribe en una demo): dos triggers `security definer` para
-- que funcione también cuando el evento lo dispara el formulario público
-- (rol `anon`, que no tiene permiso de escritura sobre follow_up_tasks).

do $$ begin
  create type task_status as enum ('pending', 'completed', 'skipped', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type task_source as enum (
    'lead_created',
    'status_change',
    'demo_registration',
    'contact_log',
    'manual'
  );
exception
  when duplicate_object then null;
end $$;

-- 1. message_templates: plantillas de mensaje editables desde /admin/plantillas.
-- `key` es el identificador estable que usa el código (sugerencias de
-- seguimiento, triggers de creación automática); label y body son lo único
-- que el admin edita.
create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  key text not null unique,
  label text not null,
  body text not null,
  is_active boolean not null default true,
  constraint message_templates_key_length check (char_length(key) between 2 and 60),
  constraint message_templates_label_length check (char_length(label) between 2 and 100),
  constraint message_templates_body_length check (char_length(body) between 1 and 1000)
);

-- Reutiliza la función public.set_updated_at() creada en 0003_demo_events.sql.
drop trigger if exists message_templates_set_updated_at on public.message_templates;
create trigger message_templates_set_updated_at
  before update on public.message_templates
  for each row
  execute function public.set_updated_at();

alter table public.message_templates enable row level security;

drop policy if exists "Authenticated can read message templates" on public.message_templates;
create policy "Authenticated can read message templates"
  on public.message_templates
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert message templates" on public.message_templates;
create policy "Authenticated can insert message templates"
  on public.message_templates
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update message templates" on public.message_templates;
create policy "Authenticated can update message templates"
  on public.message_templates
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete message templates" on public.message_templates;
create policy "Authenticated can delete message templates"
  on public.message_templates
  for delete
  to authenticated
  using (true);

insert into public.message_templates (key, label, body) values
  (
    'primer_contacto',
    'Primer contacto',
    '¡Hola {{name}}! 👩‍🍳 Soy la chef que sí sabe. Vi que dejaste tus datos porque te interesa lo que te comenté. ¿Tienes un minuto para contarme un poco más y ver cómo te puedo ayudar?'
  ),
  (
    'seguimiento',
    'Seguimiento',
    'Hola {{name}} 🙋‍♀️ Te escribo para dar seguimiento a tu interés. ¿Sigues interesada/o? Cuéntame si tienes dudas, con gusto te ayudo.'
  ),
  (
    'invitacion_demo',
    'Invitación a demo',
    '¡Hola {{name}}! 👩‍🍳 Te escribo para invitarte a "{{demo_title}}" el {{demo_date}} a las {{demo_time}}{{demo_location}}. ¿Te gustaría reservar tu lugar?'
  ),
  (
    'recordatorio_demo',
    'Recordatorio de demo',
    '¡Hola {{name}}! Te escribo para recordarte "{{demo_title}}" el {{demo_date}} a las {{demo_time}}{{demo_location}}. Cualquier cambio avísame por aquí. ¡Nos vemos pronto!'
  ),
  (
    'post_demo',
    'Después de la demo',
    'Hola {{name}}, ¡gracias por tu tiempo en la demostración! Espero que te haya gustado tanto como a mí compartirla. Quedo atenta a cualquier pregunta que tengas.'
  ),
  (
    'reagendar',
    'Reagendar',
    'Hola {{name}}, notamos que no pudiste asistir a la demostración. ¿Te gustaría reagendar para otro día? Cuéntame qué horario te acomoda y buscamos una nueva fecha.'
  )
on conflict (key) do nothing;

-- 2. follow_up_tasks: la tarea de seguimiento real. Un lead puede tener
-- varias tareas a lo largo del tiempo (historial); en un momento dado solo
-- debería haber, como mucho, un puñado de tareas "pending" por lead.
create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  demo_event_id uuid references public.demo_events (id) on delete set null,
  contact_log_id uuid references public.contact_logs (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  title text not null,
  message_template_key text references public.message_templates (key) on delete set null,
  status task_status not null default 'pending',
  due_at timestamptz not null default now(),
  source task_source not null default 'manual',
  completed_at timestamptz,
  notes text,
  constraint follow_up_tasks_title_length check (char_length(title) between 2 and 150),
  constraint follow_up_tasks_notes_length check (notes is null or char_length(notes) <= 500)
);

create index if not exists follow_up_tasks_lead_id_idx
  on public.follow_up_tasks (lead_id);

create index if not exists follow_up_tasks_status_due_at_idx
  on public.follow_up_tasks (status, due_at);

create index if not exists follow_up_tasks_demo_event_id_idx
  on public.follow_up_tasks (demo_event_id);

drop trigger if exists follow_up_tasks_set_updated_at on public.follow_up_tasks;
create trigger follow_up_tasks_set_updated_at
  before update on public.follow_up_tasks
  for each row
  execute function public.set_updated_at();

alter table public.follow_up_tasks enable row level security;

-- Uso exclusivo del equipo admin: el sitio público nunca lee ni escribe
-- tareas de seguimiento directamente (solo dispara su creación de forma
-- indirecta, vía los triggers `security definer` de abajo).
drop policy if exists "Authenticated can read follow up tasks" on public.follow_up_tasks;
create policy "Authenticated can read follow up tasks"
  on public.follow_up_tasks
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert follow up tasks" on public.follow_up_tasks;
create policy "Authenticated can insert follow up tasks"
  on public.follow_up_tasks
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update follow up tasks" on public.follow_up_tasks;
create policy "Authenticated can update follow up tasks"
  on public.follow_up_tasks
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete follow up tasks" on public.follow_up_tasks;
create policy "Authenticated can delete follow up tasks"
  on public.follow_up_tasks
  for delete
  to authenticated
  using (true);

-- 3. Creación automática de la tarea inicial al crear un lead nuevo desde
-- el formulario público (rol `anon`, sin acceso de escritura a
-- follow_up_tasks). `security definer` hace que el insert corra con los
-- privilegios del dueño de la función (quien aplica la migración),
-- saltándose RLS solo para esta escritura puntual y bien acotada.
-- Solo aplica cuando el lead nace en status 'new' (el flujo típico de la
-- landing): un lead que nace en otro estado (por ejemplo 'confirmed_demo'
-- desde el registro público a una demo) recibe su tarea desde el trigger
-- de demo_registrations, que tiene contexto de la demo concreta.
create or replace function public.create_initial_follow_up_task()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'new' then
    insert into public.follow_up_tasks (lead_id, title, message_template_key, due_at, source)
    values (new.id, 'Enviar primer contacto', 'primer_contacto', now(), 'lead_created');
  end if;
  return new;
end;
$$;

drop trigger if exists leads_create_initial_follow_up_task on public.leads;
create trigger leads_create_initial_follow_up_task
  after insert on public.leads
  for each row
  execute function public.create_initial_follow_up_task();

-- 4. Creación automática de la tarea de seguimiento al inscribir un lead en
-- una demo (tanto si lo hace el equipo admin como si el lead se
-- autoinscribe desde el sitio público con `attendance_status = 'confirmed'`,
-- rol `anon`). Igual que arriba, `security definer` es necesario para el
-- camino público.
create or replace function public.create_demo_follow_up_task()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  task_title text;
  template_key text;
begin
  if new.attendance_status = 'registered' then
    task_title := 'Confirmar demo';
    template_key := 'invitacion_demo';
  elsif new.attendance_status = 'confirmed' then
    task_title := 'Recordar demo';
    template_key := 'recordatorio_demo';
  else
    return new;
  end if;

  if not exists (
    select 1
    from public.follow_up_tasks
    where lead_id = new.lead_id
      and demo_event_id = new.demo_event_id
      and status = 'pending'
  ) then
    insert into public.follow_up_tasks (
      lead_id, demo_event_id, title, message_template_key, due_at, source
    )
    values (
      new.lead_id, new.demo_event_id, task_title, template_key, now(), 'demo_registration'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists demo_registrations_create_follow_up_task on public.demo_registrations;
create trigger demo_registrations_create_follow_up_task
  after insert on public.demo_registrations
  for each row
  execute function public.create_demo_follow_up_task();

-- 5. leads.next_follow_up_at queda reemplazado por follow_up_tasks (una
-- fecha por tarea, no una sola por lead). El Centro de Seguimientos y el
-- dashboard ahora leen follow_up_tasks directamente.
drop index if exists leads_next_follow_up_at_idx;
alter table public.leads drop column if exists next_follow_up_at;
