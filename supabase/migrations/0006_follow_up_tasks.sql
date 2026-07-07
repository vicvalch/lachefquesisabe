-- PR6: arquitectura real de seguimiento. Reemplaza el mecanismo liviano de
-- PR5 (basado únicamente en leads.next_follow_up_at) por tareas de
-- seguimiento persistidas (follow_up_tasks) con ciclo de vida propio y
-- plantillas de mensaje editables desde el admin (message_templates).
--
-- leads.next_follow_up_at NO se elimina: follow_up_tasks es la fuente real,
-- pero next_follow_up_at se mantiene como snapshot derivado (la fecha de la
-- tarea "open" más próxima de cada lead, o null si no tiene ninguna) para
-- que el resto del admin (listado de leads, dashboard) lo pueda seguir
-- usando sin necesitar un join. Se mantiene sincronizado automáticamente
-- por un trigger sobre follow_up_tasks (ver más abajo), no a mano.
--
-- Todo sigue siendo manual: no hay envío automático de WhatsApp/email, no
-- hay cron jobs ni integraciones externas. Lo único "automático" es la
-- creación de la tarea inicial cuando ocurre un evento importante (se crea
-- un lead, se inscribe en una demo) y el snapshot en next_follow_up_at:
-- tres triggers `security definer` para que funcionen también cuando el
-- evento lo dispara el formulario público (rol `anon`, que no tiene permiso
-- de escritura sobre follow_up_tasks).

do $$ begin
  create type task_status as enum ('open', 'completed', 'skipped', 'cancelled');
exception
  when duplicate_object then null;
end $$;

-- `source` documenta tanto el mecanismo (qué disparó el insert) como el
-- "tipo" de seguimiento (para qué es la tarea): los cinco valores más
-- específicos (initial_contact, demo_invitation, demo_confirmation,
-- post_demo_follow_up, no_show_recovery) corresponden 1:1 a los eventos
-- automáticos de creación de tareas descritos abajo. status_change cubre
-- el resto de cambios de estado del lead sin un evento tan específico
-- (contacted, interested); contact_log y manual son creaciones desde el
-- admin (programar el siguiente seguimiento / tarea libre).
do $$ begin
  create type task_source as enum (
    'initial_contact',
    'demo_invitation',
    'demo_confirmation',
    'post_demo_follow_up',
    'no_show_recovery',
    'status_change',
    'contact_log',
    'manual'
  );
exception
  when duplicate_object then null;
end $$;

-- 1. message_templates: plantillas de mensaje editables desde /admin/plantillas.
-- `key` es el identificador estable que usa el código (sugerencias de
-- seguimiento, triggers de creación automática); label, body e is_active
-- son lo que el admin edita desde /admin/plantillas/[id]. También puede
-- crear plantillas nuevas desde /admin/plantillas/new (con su propio key),
-- aunque esas no quedarán conectadas a ninguna sugerencia automática.
create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  key text not null unique,
  label text not null,
  body text not null,
  is_active boolean not null default true,
  constraint message_templates_key_length check (char_length(key) between 2 and 60),
  constraint message_templates_key_format check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
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

-- 8 plantillas seed: una por cada evento/momento de seguimiento previsto.
-- seguimiento-compra es la única que no corresponde a ningún evento
-- automático (purchased es un estado final: no genera tarea); queda
-- disponible para elegir a mano al contactar a alguien que ya compró.
insert into public.message_templates (key, label, body) values
  (
    'primer-contacto',
    'Primer contacto',
    '¡Hola {{name}}! 👩‍🍳 Soy la chef que sí sabe. Vi que dejaste tus datos porque te interesa lo que te comenté. ¿Tienes un minuto para contarme un poco más y ver cómo te puedo ayudar?'
  ),
  (
    'invitacion-demo',
    'Invitación a demo',
    '¡Hola {{name}}! 👩‍🍳 Te escribo para invitarte a "{{demo_title}}" el {{demo_date}} a las {{demo_time}}{{demo_location}}. ¿Te gustaría reservar tu lugar?'
  ),
  (
    'confirmacion-demo',
    'Confirmación de demo',
    '¡Hola {{name}}! Tu lugar en "{{demo_title}}" quedó confirmado para el {{demo_date}} a las {{demo_time}}{{demo_location}}. ¡Te espero! 🎉'
  ),
  (
    'recordatorio-demo',
    'Recordatorio de demo',
    '¡Hola {{name}}! Te escribo para recordarte "{{demo_title}}" el {{demo_date}} a las {{demo_time}}{{demo_location}}. Cualquier cambio avísame por aquí. ¡Nos vemos pronto!'
  ),
  (
    'seguimiento-post-demo',
    'Seguimiento post-demo',
    'Hola {{name}}, ¡gracias por tu tiempo en la demostración! Espero que te haya gustado tanto como a mí compartirla. Quedo atenta a cualquier pregunta que tengas.'
  ),
  (
    'recuperacion-no-show',
    'Recuperación de no-show',
    'Hola {{name}}, notamos que no pudiste asistir a la demostración. ¿Te gustaría reagendar para otro día? Cuéntame qué horario te acomoda y buscamos una nueva fecha.'
  ),
  (
    'recontacto-suave',
    'Recontacto suave',
    'Hola {{name}} 🙋‍♀️ Te escribo para dar seguimiento a tu interés. ¿Sigues interesada/o? Cuéntame si tienes dudas, con gusto te ayudo.'
  ),
  (
    'seguimiento-compra',
    'Seguimiento post-compra',
    '¡Hola {{name}}! 🎉 Felicidades por tu Thermomix. Quiero asegurarme de que la estés disfrutando al máximo — ¿ya la probaste? Cualquier duda o receta que quieras que te comparta, aquí estoy.'
  )
on conflict (key) do nothing;

-- 2. follow_up_tasks: la tarea de seguimiento real. Un lead puede tener
-- varias tareas a lo largo del tiempo (historial); en un momento dado solo
-- debería haber, como mucho, un puñado de tareas "open" por lead.
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
  status task_status not null default 'open',
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
-- landing, evento "lead nuevo" => initial_contact): un lead que nace en
-- otro estado (por ejemplo 'confirmed_demo' desde el registro público a
-- una demo) recibe su tarea desde el trigger de demo_registrations, que
-- tiene contexto de la demo concreta.
create or replace function public.create_initial_follow_up_task()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'new' then
    insert into public.follow_up_tasks (lead_id, title, message_template_key, due_at, source)
    values (new.id, 'Enviar primer contacto', 'primer-contacto', now(), 'initial_contact');
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
-- una demo:
-- - El equipo admin agrega un lead a una demo (`attendance_status` nace en
--   'registered') => evento "admin agrega lead a demo", tarea
--   "Confirmar demo" / source `demo_invitation`.
-- - El lead se autoinscribe desde el sitio público, que siempre inserta
--   `attendance_status = 'confirmed'` directamente (rol `anon`) => evento
--   "registro público a demo", tarea "Recordar demo" / source
--   `demo_confirmation`.
-- Igual que arriba, `security definer` es necesario para que el camino
-- público (anon) pueda disparar el insert.
create or replace function public.create_demo_follow_up_task()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  task_title text;
  template_key text;
  task_source_value task_source;
begin
  if new.attendance_status = 'registered' then
    task_title := 'Confirmar demo';
    template_key := 'invitacion-demo';
    task_source_value := 'demo_invitation';
  elsif new.attendance_status = 'confirmed' then
    task_title := 'Recordar demo';
    template_key := 'recordatorio-demo';
    task_source_value := 'demo_confirmation';
  else
    return new;
  end if;

  if not exists (
    select 1
    from public.follow_up_tasks
    where lead_id = new.lead_id
      and demo_event_id = new.demo_event_id
      and status = 'open'
  ) then
    insert into public.follow_up_tasks (
      lead_id, demo_event_id, title, message_template_key, due_at, source
    )
    values (
      new.lead_id, new.demo_event_id, task_title, template_key, now(), task_source_value
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

-- 5. leads.next_follow_up_at (creado en 0002_contact_logs.sql) se mantiene,
-- pero deja de editarse a mano: este trigger lo recalcula automáticamente
-- cada vez que cambian las tareas de seguimiento de un lead (se crea una,
-- se reprograma, se completa/salta/cancela, o se borra), tomando la fecha
-- de la tarea "open" más próxima (o null si ya no queda ninguna). Corre
-- `security definer` por la misma razón que los triggers anteriores: debe
-- funcionar también cuando el insert en follow_up_tasks lo dispara uno de
-- esos dos triggers en el camino público (anon).
create or replace function public.sync_lead_next_follow_up_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_lead_id uuid;
  next_due_at timestamptz;
begin
  affected_lead_id := coalesce(new.lead_id, old.lead_id);

  select due_at into next_due_at
  from public.follow_up_tasks
  where lead_id = affected_lead_id
    and status = 'open'
  order by due_at asc
  limit 1;

  update public.leads
  set next_follow_up_at = next_due_at
  where id = affected_lead_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists follow_up_tasks_sync_lead_next_follow_up_at on public.follow_up_tasks;
create trigger follow_up_tasks_sync_lead_next_follow_up_at
  after insert or update or delete on public.follow_up_tasks
  for each row
  execute function public.sync_lead_next_follow_up_at();
