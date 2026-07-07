# La Chef que Sí Sabe

**lachefquesisabe.com** — website público + mini CRM/admin privado para
capturar leads interesados en recetas, demos de cocina y demostraciones de
Thermomix.

> Cocina rico, fácil y sin complicarte.

Este repositorio contiene el **PR 1** (landing, captura de leads, Supabase,
admin con login y un dashboard inicial), el **PR 2** (detalle de lead,
estados comerciales ampliados, notas, próximos seguimientos, bitácora de
contactos y plantillas de WhatsApp), el **PR 3** (módulo de demostraciones
completo, tanto para el equipo admin (`/admin/demos`: crear demos, agregar
leads, controlar asistencia) como para el público (`/demos`: ver próximas
demostraciones y registrarse a una desde el sitio, sin sesión)) y el **PR
4**: un content hub flexible (categorías + posts de contenido: recetas,
tips y guías), administrable desde `/admin/content` (crear, editar,
publicar, despublicar/archivar) y publicado en `/recetas` (la ruta pública
sigue hablando de "recetas" porque comercialmente es más claro, aunque el
modelo interno soporta los tres tipos de contenido), con CTAs hacia las
demos y la captura de leads, para que el sitio deje de ser solo landing +
demos y empiece a atraer tráfico propio. Y el **PR 6**: la arquitectura
real de seguimiento — tareas de seguimiento (`follow_up_tasks`) con ciclo
de vida propio (open/completada/saltada/cancelada), creadas
automáticamente ante eventos importantes (lead nuevo, inscripción a una
demo, cambio de estado del lead), y plantillas de mensaje editables desde
el admin (`message_templates`, con listado + creación + edición en
`/admin/plantillas`), que reemplazan los arreglos estáticos de WhatsApp de
PR 2/PR 3. El Centro de Seguimientos (`/admin/seguimientos`) ahora se basa
en tareas reales; `leads.next_follow_up_at` se mantiene, pero como
snapshot derivado de esas tareas (no como fuente de verdad ni campo
editable a mano). Y el **PR 7**: segmentación de leads (`lead_segments`,
con un criterio de filtros allowlisted y validado — nunca SQL crudo) y
campañas manuales de outreach (`outreach_campaigns` +
`outreach_campaign_recipients`) en dos pasos explícitos, ninguno de los
cuales envía mensajes: **materializar destinatarios** (snapshotea quién
matchea el segmento, solo con consentimiento de contacto) y **generar
tareas de seguimiento** (crea una `follow_up_tasks` por destinatario).
No incluye automatizaciones, WhatsApp API, email automation, HubSpot,
pagos, carrito, inventario, cursos pagos, membresías, subida avanzada de
imágenes, IA generativa, scoring de leads, comentarios públicos, ratings,
favoritos, login de usuarios finales, newsletter avanzada, cron jobs ni
envío automático de mensajes — eso queda para PRs posteriores.

Finalmente, el **PR 8** cierra el MVP para producción: no agrega módulos
nuevos, sino que endurece lo que ya existe — QA de rutas públicas y
privadas, protección consistente de `/admin/*`, estados vacíos y de error
amigables en todo el admin, un dashboard priorizado (deja de mostrar todo
a la vez), pulido mobile-first (sidebar y header con menú colapsable),
revisión de RLS/policies, y documentación nueva para operar el sitio en
producción: [`docs/admin-guide.md`](./docs/admin-guide.md) (guía para una
persona administradora no técnica) y
[`docs/qa-checklist.md`](./docs/qa-checklist.md) (checklist manual de QA y
smoke test). Ver "Dashboard, QA y producción (PR 8)" más abajo para el
detalle completo.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4
- [Supabase](https://supabase.com) (Postgres + Auth) vía `@supabase/ssr`
- Zod para validaciones
- React Hook Form para el formulario público de leads
- Vitest + Testing Library para tests

## Estructura

```
src/
  app/
    page.tsx                 # Landing pública
    demos/                    # Sitio público de demostraciones
      page.tsx                 # Próximas demos (cards)
      [slug]/page.tsx           # Detalle de una demo + formulario de registro
    recetas/                  # Sitio público del content hub (recetas/tips/guías)
      page.tsx                 # Posts publicados (cards) con filtros ?type y ?category
      [slug]/page.tsx           # Detalle de un post + CTAs
    gracias/                  # Thank-you page (leads y registros a demo)
    api/
      leads/route.ts           # Endpoint de captura de leads (landing)
      demos/[slug]/register/route.ts  # Endpoint de registro público a una demo
    admin/
      (auth)/login/           # Login (fuera del layout protegido)
      (protected)/            # Dashboard, listado y detalle de leads (requieren sesión)
        leads/[id]/            # Detalle de un lead: estado, notas, WhatsApp
        demos/                  # Listado, creación y detalle de demostraciones
          [id]/                  # Roster, cupo y asistencia de una demo
          new/                   # Crear una demo
        content/                 # Listado, creación y edición de contenido
          [id]/                    # Editar y publicar/despublicar/archivar
          new/                     # Crear receta, tip o guía (borrador o publicado)
        plantillas/              # Listado de plantillas de mensaje (message_templates)
          [id]/                    # Editar una plantilla (label, body, is_active)
          new/                     # Crear una plantilla (define su key)
        segmentos/               # Listado, creación y detalle de segmentos de leads
          [id]/                    # Editar filtros + preview de leads + campañas
          new/                     # Crear un segmento (criterio de filtros)
        campanas/                # Listado, creación y detalle de campañas manuales
          [id]/                    # Materializar destinatarios, generar tareas, cancelar
          new/                     # Crear una campaña (segmento + plantilla + config de tarea)
  components/
    landing/                  # Header, Hero, Features, LeadForm, Footer...
    demos/                    # DemoCard, PublicDemoRegistrationForm (sitio público)
    content/                  # ContentPostCard, ContentCtaSection, ContentFilterBar
                               # (sitio público)
    admin/                    # Sidebar, StatCard, LeadsTable, LeadInfoCard,
                               # LeadUpdateForm, ContactLogForm/Timeline,
                               # UpcomingFollowUps, MessageTemplatePicker,
                               # MessageTemplateForm, MessageTemplatesTable,
                               # CreateMessageTemplateForm, FollowUpTaskList/Card/Actions,
                               # ScheduleFollowUpForm, LeadFollowUpTasks,
                               # DemoEventForm/InfoCard/StatusForm,
                               # DemoEventsList, DemoRegistrationForm,
                               # DemoRosterTable, DemoTemplateActions,
                               # UpcomingDemos, ContentPostForm, ContentPostsTable,
                               # RecentContentPosts, LoginForm,
                               # LeadSegmentForm/EditLeadSegmentForm, LeadSegmentsTable,
                               # CampaignForm, OutreachCampaignsTable,
                               # MaterializeRecipientsForm, GenerateCampaignTasksForm,
                               # CancelCampaignForm, CampaignRecipientsTable,
                               # LeadCampaignMemberships
    ui/                       # Button, Input, Field, Select, Textarea, Card, Badge,
                               # SafeTextRenderer
  lib/
    supabase/                 # Clientes de Supabase (server + proxy/sesión)
    validations/               # Schemas Zod compartidos (incluye registro público a demo)
    leads/                     # Capa de acceso a datos de leads, tareas de
                                # seguimiento (ciclo de vida + queries) y sugerencias
                                # por estado (testeable)
    demos/                     # Capa de acceso a datos de demos e inscripciones,
                                # registro público, slugs y formato de fecha/hora
    content/                   # Capa de acceso a datos de content_categories y
                                # content_posts, slugs únicos y estadísticas para
                                # el dashboard
    message-templates/         # Queries, creación, edición y renderizado de
                                # plantillas de mensaje persistidas (reemplaza los
                                # arreglos estáticos de whatsapp/templates.ts)
    segments/                  # Criterio de filtros (allowlist), queries
                                # (listLeadsMatchingCriteria), create/update y resumen
                                # legible del criterio
    campaigns/                 # Queries, creación, slug, materializeCampaignRecipients,
                                # generateFollowUpTasksForCampaign, cancelOutreachCampaign
    whatsapp/                  # Utilidades de wa.me (normalizar teléfono, armar link)
    actions/                   # Server actions (auth, leads, contact logs, demos,
                                # content, follow-up tasks, message templates,
                                # segments, campaigns)
  proxy.ts                     # Protege /admin (antes "middleware.ts")
supabase/
  migrations/
    0001_init.sql              # Tabla leads, enums y políticas RLS
    0002_contact_logs.sql      # Estados ampliados, primary_interest, notas,
                                # seguimientos y tabla contact_logs
    0003_demo_events.sql       # demo_events, demo_registrations y políticas RLS
                                # (admin + lectura/registro público)
    0004_leads_email_optional.sql  # leads.email pasa a ser opcional
    0005_content_hub.sql       # content_categories y content_posts, políticas RLS
                                # (admin + lectura pública acotada) y seed de categorías
    0006_follow_up_tasks.sql   # follow_up_tasks y message_templates, 3 triggers
                                # security definer (creación automática de tareas +
                                # sincronizar leads.next_follow_up_at)
    0007_lead_segments_campaigns.sql  # lead_segments (criterio jsonb), outreach_campaigns
                                # (status, plantilla, config de tarea) y
                                # outreach_campaign_recipients (status), en dos pasos
                                # manuales: materializar destinatarios + generar tareas
```

## Configuración

### 1. Variables de entorno

Copia `.env.example` a `.env.local` y completa con los datos de tu proyecto
de Supabase (Project Settings → API):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

No se necesita `service_role key`: toda la app opera con la anon key,
apoyándose en las políticas RLS de Postgres. Ninguna variable privada se
expone al frontend: solo se usan las dos `NEXT_PUBLIC_*` de arriba.

### 2. Base de datos

Aplica las migraciones en orden en tu proyecto de Supabase. Puedes pegar el
contenido de cada archivo en el SQL Editor del dashboard de Supabase, o, si
usas la Supabase CLI:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

**`0001_init.sql`** crea la tabla `leads`, índices y políticas de Row Level
Security:

- El formulario público solo puede **insertar** leads (rol `anon`), y solo
  si `consent_contact = true`.
- Solo usuarios **autenticados** (el equipo admin) pueden leer/actualizar/
  borrar leads.

**`0002_contact_logs.sql`** (PR 2) reemplaza los enums iniciales por el
modelo comercial completo y agrega la bitácora de contactos:

- `leads.status` pasa a 10 valores: `new`, `contacted`, `interested`,
  `invited_to_demo`, `confirmed_demo`, `attended`, `no_show`,
  `post_demo_follow_up`, `purchased`, `lost`.
- `leads.interest` se renombra a `leads.primary_interest`, con enum
  `easy_recipes`, `save_time`, `in_person_demo`, `virtual_demo`,
  `buy_thermomix`, `more_info`.
- Se agregan `leads.notes`, `leads.next_follow_up_at` y
  `leads.last_contacted_at`.
- Se crea la tabla `contact_logs` (canal, dirección, resumen, resultado y
  próximo seguimiento de cada contacto realizado). Es de uso exclusivo del
  equipo admin: solo usuarios **autenticados** pueden leer/insertar; el
  formulario público nunca la toca ni puede leerla.

> Esta migración reescribe tipos de columna existentes (`status`,
> `interest` → `primary_interest`). Si ya habías aplicado una versión previa
> de `0002` en tu proyecto de Supabase con el nombre `lead_activities`,
> reinicia el esquema de ese proyecto antes de reaplicarla.

**`0003_demo_events.sql`** (PR 3) agrega el módulo de demostraciones, con
visibilidad admin **y** pública:

- `demo_events`: `title`, `slug` (único, generado en el servidor al crear
  la demo), `mode` (`in_person` / `virtual`), `status` (`draft`,
  `scheduled`, `full`, `completed`, `cancelled`), `starts_at`, `ends_at`,
  `location_name`, `location_address`, `meeting_url`, `capacity`,
  `description` (pública), `public_notes` (pública) e `internal_notes`
  (solo admin). `updated_at` se mantiene con un trigger.
- `demo_registrations`: relaciona un lead con una demo, con su propio
  estado de asistencia (`registered`, `confirmed`, `attended`, `no_show`,
  `cancelled`) y notas. Un mismo lead no puede inscribirse dos veces en la
  misma demo (`unique (demo_event_id, lead_id)`).
- El equipo **autenticado** puede leer/insertar/actualizar/borrar ambas
  tablas sin restricciones.
- El rol **`anon`** (sitio público, sin sesión) puede:
  - **Leer** `demo_events` solo cuando `status in ('scheduled', 'full')` y
    `starts_at >= now()` — así es como `/demos` y `/demos/[slug]` filtran
    demos en borrador, ya realizadas, canceladas o vencidas sin necesitar
    lógica extra en la app.
  - **Insertar** en `demo_registrations` solo con `attendance_status =
    'confirmed'` y solo si la demo referenciada sigue abierta (misma
    condición que la policy de lectura). Nunca puede leer, actualizar ni
    borrar inscripciones — ni siquiera las propias.
  - Nunca puede insertar, actualizar ni borrar `demo_events`.

**`0004_leads_email_optional.sql`** (PR 3) relaja `leads.email` a nullable:
el registro público a una demo pide WhatsApp obligatorio y email opcional
(WhatsApp es el canal principal para confirmar el lugar). El formulario
general de la landing sigue pidiendo email obligatorio a nivel de Zod; esto
solo permite que la base acepte el otro flujo.

**`0005_content_hub.sql`** (PR 4) agrega el content hub (categorías +
posts de contenido), con visibilidad admin **y** pública:

- `content_categories`: `name`, `slug` (único), `description`,
  `sort_order`, `is_active`. Se siembran 5 categorías iniciales: Recetas
  fáciles, Ahorro de tiempo, Familia, Postres y Demos Thermomix
  (`on conflict (slug) do nothing`, así que reaplicar la migración no
  duplica filas).
- `content_posts`: `title`, `slug` (único, generado en el servidor),
  `content_type` (`recipe`, `tip`, `guide`), `status` (`draft`,
  `published`, `archived`), `category_id` (opcional, `on delete set
  null`), `excerpt`, `body`, `ingredients`, `instructions`,
  `prep_time_minutes`, `cook_time_minutes`, `servings`, `difficulty`
  (`easy`/`medium`/`hard`, opcional), `image_url`, `seo_title`,
  `seo_description`, `featured` y `published_at`. `updated_at` se
  mantiene con el mismo trigger `set_updated_at()` que ya usa
  `demo_events`.
- El equipo **autenticado** puede leer/insertar/actualizar/borrar ambas
  tablas sin restricciones.
- El rol **`anon`** (sitio público, sin sesión) puede:
  - **Leer** `content_categories` solo cuando `is_active = true`.
  - **Leer** `content_posts` solo cuando `status = 'published' and
    published_at is not null and published_at <= now()` — así es como
    `/recetas` y `/recetas/[slug]` filtran borradores, contenido
    archivado o programado a futuro sin necesitar lógica extra en la app.
  - Nunca puede insertar, actualizar ni borrar ninguna de las dos tablas.

**`0006_follow_up_tasks.sql`** (PR 6) agrega la arquitectura real de
seguimiento y reemplaza el mecanismo liviano de PR 5, **sin** eliminar
`leads.next_follow_up_at` — se mantiene como snapshot derivado (ver más
abajo):

- `message_templates`: plantillas de mensaje editables (`key` estable en
  kebab-case, `label`, `body` con placeholders `{{name}}`,
  `{{demo_title}}`, `{{demo_date}}`, `{{demo_time}}`, `{{demo_location}}`,
  `is_active`). Se siembran 8 plantillas iniciales: `primer-contacto`,
  `invitacion-demo`, `confirmacion-demo`, `recordatorio-demo`,
  `seguimiento-post-demo`, `recuperacion-no-show`, `recontacto-suave` y
  `seguimiento-compra`.
- `follow_up_tasks`: la tarea de seguimiento real, con `lead_id`,
  `demo_event_id` opcional, `message_template_key` opcional, `status`
  (`open`/`completed`/`skipped`/`cancelled`), `due_at`, `source`
  (`initial_contact`/`demo_invitation`/`demo_confirmation`/
  `demo_reminder`/`post_demo_follow_up`/`no_show_recovery`/
  `status_change`/`contact_log`/`manual` — documenta tanto el mecanismo
  como el "tipo" de la tarea; `demo_confirmation` y `demo_reminder` son
  eventos distintos, ver la tabla más abajo), `completed_at`,
  `contact_log_id` (qué contacto la resolvió) y `notes`.
- El equipo **autenticado** puede leer/insertar/actualizar/borrar ambas
  tablas sin restricciones. El rol **`anon`** no tiene ninguna policy
  sobre ninguna de las dos: no lee ni escribe tareas ni plantillas
  directamente.
- Dos triggers `security definer` crean la tarea inicial automáticamente
  ante eventos que sí puede disparar el rol `anon` (formularios
  públicos):
  - Al insertar un lead con `status = 'new'` → tarea "Enviar primer
    contacto" (`source = initial_contact`, plantilla `primer-contacto`).
  - Al insertar una inscripción a demo con `attendance_status =
    'registered'` (el equipo admin agrega un lead a una demo, todavía sin
    confirmar) → tarea "Confirmar demo" (`source = demo_invitation`,
    plantilla `invitacion-demo`); con `attendance_status = 'confirmed'`
    (el lead se autoinscribe desde el sitio público, ya queda
    confirmado) → tarea "Enviar confirmación de demo" (`source =
    demo_confirmation`, plantilla `confirmacion-demo`), atada a esa demo.

  El recordatorio más cerca de la fecha (`source = demo_reminder`,
  plantilla `recordatorio-demo`) es un evento distinto y posterior: no lo
  crea este trigger, sino `ensureFollowUpTaskForStatus` cuando
  `leads.status` pasa a `confirmed_demo` (típicamente porque el equipo
  admin confirma manualmente la asistencia de una inscripción que había
  quedado en `registered`). El resto de la creación automática (cambio de
  estado del lead — incluida la sincronización de asistencia a una demo,
  que puede generar `post_demo_follow_up` al marcar "asistió" o
  `no_show_recovery` al marcar "no asistió" —, y el ciclo de completar/
  saltar/cancelar/reprogramar) vive en TypeScript (`lib/leads/
  follow-up-task-lifecycle.ts`), no en triggers, porque esos caminos ya
  corren siempre con sesión autenticada.
- Un tercer trigger `security definer` (`sync_lead_next_follow_up_at`,
  `after insert or update or delete on follow_up_tasks`) mantiene
  `leads.next_follow_up_at` como snapshot derivado: cada vez que cambian
  las tareas de un lead, lo recalcula a la fecha de su tarea `open` más
  próxima, o `null` si ya no le queda ninguna. Corre a nivel de base de
  datos (no en TypeScript) precisamente para cubrir también las tareas
  que crean los dos triggers de arriba en el camino público. Nunca se
  edita a mano desde ningún formulario.

### 3. Crear el usuario admin

Por ahora no hay registro público de administradores. Crea el primer
usuario manualmente desde el dashboard de Supabase: **Authentication →
Users → Add user** (con email y contraseña). Con ese usuario podrás
ingresar en `/admin/login`.

### 4. Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para la landing y
[http://localhost:3000/admin/login](http://localhost:3000/admin/login)
para el panel admin.

## Scripts

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # ESLint
npm run typecheck  # TypeScript (tsc --noEmit)
npm run test       # Tests (Vitest)
npm run test:watch # Tests en modo watch
```

Antes de cada deploy, corré los cuatro (`lint`, `typecheck`, `test`,
`build`) y completá manualmente el
[checklist de QA](./docs/qa-checklist.md), que incluye un smoke test
manual de punta a punta. Para el día a día operando el sitio (no
técnico), ver la [guía rápida de uso](./docs/admin-guide.md).

## Detalle de lead y seguimiento (PR 2)

Desde `/admin/leads` cada fila enlaza al detalle del lead
(`/admin/leads/[id]`), pensado para el seguimiento manual día a día:

- **Datos completos** del lead (contacto, interés primario, mensaje,
  estado, último contacto y próximo seguimiento —
  `leads.next_follow_up_at`, sincronizado automáticamente con sus tareas
  abiertas, ver PR 6—).
- **Actualización del lead** (`LeadUpdateForm`): el admin puede cambiar
  `status` y `notes` desde un único formulario con validación Zod y un
  allowlist explícito en la capa de datos (`lib/leads/update-lead.ts`) —
  `email`, `phone`, `source`, `consent_contact` y `created_at` nunca se
  aceptan desde este formulario. El próximo seguimiento ya no se edita
  acá directamente: ver "Seguimientos y plantillas de mensaje (PR 6)".
- **Registrar contacto** (`ContactLogForm`): guarda un registro en
  `contact_logs` (canal, dirección, resumen, resultado opcional y próximo
  seguimiento opcional). Al guardarlo, automáticamente:
  1. Inserta la fila en `contact_logs` con `created_by` tomado de la sesión
     autenticada (nunca del formulario).
  2. Actualiza `leads.last_contacted_at` a la hora actual.
  3. Si viene `task_id` (se registró desde una tarea puntual), completa esa
     tarea de seguimiento y la enlaza con este contact log.
  4. Si se indicó `next_follow_up_at`, crea una nueva tarea de seguimiento
     abierta para esa fecha (ver PR 6).
  5. Revalida el detalle del lead, el listado, el Centro de Seguimientos y
     el dashboard.
- **Plantillas de mensaje** (`MessageTemplatePicker`) personalizadas con
  el nombre del lead (y, si aplica, los datos de una demo), listas para
  copiar o abrir directo en WhatsApp (`wa.me`) si el lead tiene teléfono.
  Las plantillas están persistidas y son editables desde `/admin/plantillas`
  (ver PR 6). `lib/whatsapp/templates.ts` expone `normalizePhoneForWhatsApp`
  y `buildWhatsAppUrl`, que limpian espacios/guiones/paréntesis y agregan el
  código `506` a números ticos de 8 dígitos sin código de país. No hay
  integración con la API de WhatsApp: el envío sigue siendo manual.

`/admin/leads` admite filtros simples por query params (`status`,
`interest` — este último filtra internamente contra `primary_interest`),
por ejemplo `/admin/leads?status=contacted&interest=buy_thermomix`. Sigue
limitado a 50 resultados ordenados por `created_at` descendente.

`/admin/dashboard` incluye una sección **Seguimientos pendientes** con
tareas de seguimiento vencidas o de hoy, ordenadas por `due_at` ascendente
(ver "Dashboard (PR 8)" más abajo para el layout completo).

## Demostraciones (PR 3)

### Sitio público

- **`/demos`**: lista las próximas demostraciones visibles (`status` en
  `scheduled`/`full` y `starts_at` futuro — lo mismo que ya filtra RLS). Cada
  card muestra título, fecha, hora, modalidad, lugar (si es presencial) o
  aviso de modalidad virtual, descripción corta y un CTA "Ver detalles". Si
  no hay demos, muestra: *"Pronto tendremos nuevas demostraciones. Dejá tus
  datos en la página principal y te avisamos."*
- **`/demos/[slug]`**: detalle completo (título, fecha, hora, modalidad,
  descripción, lugar/dirección o nota de modalidad virtual) y el formulario
  de registro (nombre, WhatsApp obligatorio, email opcional, interés
  principal — con default según la modalidad de la demo —, mensaje opcional
  y consentimiento de contacto). Si la demo no existe o ya no está abierta
  (cancelada, realizada, en borrador o con fecha pasada), la página
  responde 404: no se listan ni resuelven por slug fuera de esa ventana.
- Al enviar el formulario correctamente, redirige a `/gracias?demo=<slug>`.
  `/gracias` muestra un mensaje específico de registro a demo cuando viene
  ese query param, y el mensaje general de siempre cuando no.
- El registro público (`lib/demos/public-register.ts`,
  `registerPublicLeadForDemo`, expuesto en
  `POST /api/demos/[slug]/register`) valida el payload con Zod, confirma
  que la demo existe y sigue abierta (`status` y `starts_at`), crea el lead
  con un **allowlist explícito** (nunca acepta `status`, `created_by` ni
  notas internas desde el payload — se fijan en el servidor:
  `status = "confirmed_demo"`, `source = "demo"`), y crea la inscripción
  con `attendance_status = "confirmed"`. Todavía no hay deduplicación
  inteligente de leads: cada registro crea una fila nueva en `leads`,
  aunque el mismo email/teléfono ya exista.

### Panel admin

`/admin/demos` lista las demos **próximas** (programadas, con fecha futura)
y **pasadas** (realizadas, canceladas o con fecha ya vencida), cada una con
su cupo ocupado (`inscripciones activas / capacity`) y su estado.

- **Crear demo** (`/admin/demos/new`): título, modalidad (presencial con
  nombre/dirección del lugar, o virtual con link de videollamada), fecha de
  inicio/fin, cupo máximo, descripción y notas públicas (se muestran en el
  sitio público) y notas internas (solo admin). `created_by` y el `slug`
  (generado a partir del título) salen del servidor, nunca del formulario.
- **Detalle de una demo** (`/admin/demos/[id]`):
  - **Agregar lead a la demo**: selector con los leads que todavía no
    están inscritos en esa demo. La inscripción se rechaza si el cupo
    activo (todas las inscripciones menos las canceladas) ya alcanzó
    `capacity`, y también si el lead ya estaba inscrito.
  - **Asistentes**: cada fila permite cambiar el estado de asistencia
    (`registrado`, `confirmó`, `asistió`, `no asistió`, `canceló`) con un
    guardado inmediato. Al cambiarlo, **se sincroniza `leads.status`**
    automáticamente (`invited_to_demo`, `confirmed_demo`, `attended` o
    `no_show`, según corresponda) para que el resto del CRM — dashboard,
    filtros de leads, Centro de Seguimientos — quede al día sin trabajo
    manual extra. Ese cambio de status también asegura la tarea de
    seguimiento correspondiente, atada a esta demo (ver PR 6). Cancelar una
    inscripción no cambia el status del lead ni crea una tarea.
    Cada fila incluye plantillas de mensaje específicas de demo
    (invitación, recordatorio, después de la demo, reagendar — ver abajo)
    para copiar o abrir en `wa.me`, y un enlace al detalle del lead.
  - **Estado de la demo**: un formulario aparte permite marcarla como
    borrador, programada, con cupo lleno, realizada o cancelada, y guardar
    notas internas, sin tocar título, modalidad, ubicación, fecha ni cupo
    (esos solo se definen al crearla).

`/admin/dashboard` incluye una sección **Próximas demos** con hasta 5 demos
programadas y su cupo, para tener a la vista lo que viene sin entrar al
listado completo.

### Plantillas de mensaje para demos

Las plantillas específicas de demo (`invitacion-demo`, `confirmacion-demo`,
`recordatorio-demo`, `seguimiento-post-demo`, `recuperacion-no-show`)
viven en `message_templates` (PR 6), igual que las genéricas.
`lib/message-templates/render.ts` expone
`buildTemplateContext(lead, demo)` y `renderMessageTemplate(body,
context)`, que rellenan `{{name}}`, `{{demo_title}}`, `{{demo_date}}`,
`{{demo_time}}` y `{{demo_location}}` (fecha/hora con `Intl` en locale
`es-CR`, sin dependencias externas) cuando hay una demo en contexto. No
hay integración con la API de WhatsApp: `DemoTemplateActions` en el
roster de `/admin/demos/[id]` solo copia el mensaje al portapapeles o
abre un link `wa.me`.

## Content hub (PR 4)

El modelo interno es un **content hub genérico**: `content_categories`
(categorías) + `content_posts` (posts de tipo receta, tip o guía), no un
modelo específico de "recetas". La ruta pública principal sigue llamándose
`/recetas` porque comercialmente es más claro para la audiencia del sitio,
pero lista y sirve los tres tipos de contenido.

### Sitio público

- **`/recetas`**: lista los posts **publicados** (`status = 'published'`,
  `published_at` no nulo y ya cumplido — lo mismo que filtra RLS),
  ordenados por `featured` descendente, luego `published_at` descendente y
  luego `created_at` descendente. Admite filtros simples por query param:
  `?type=recipe|tip|guide` y `?category=<slug-de-categoría>` (combinables,
  ej. `/recetas?type=tip&category=ahorro-de-tiempo`), con una barra de
  filtros (`ContentFilterBar`) que arma esos links preservando el filtro
  contrario. Cada card muestra título, extracto, categoría (si tiene),
  tipo de contenido, tiempo total (preparación + cocción) y dificultad si
  se definieron, y un CTA contextual ("Leer receta"/"Leer tip"/"Leer
  guía"). Si no hay contenido para el filtro activo, muestra un mensaje
  invitando a dejar los datos en la landing.
- **`/recetas/[slug]`**: detalle completo (tipo, categoría, fecha de
  publicación, imagen si existe, tiempos de preparación/cocción/total,
  porciones, dificultad, lista de ingredientes e instrucciones si se
  definieron, y el cuerpo del post). Si el post no existe, está en
  borrador o archivado, la página responde 404 — la query de datos exige
  `status = 'published'` además de la fecha de publicación ya cumplida, lo
  mismo que exige RLS. El cuerpo (`body`) se renderiza con
  `SafeTextRenderer` (ver abajo), nunca con `dangerouslySetInnerHTML`. Al
  final hay una sección de **CTAs** con botones hacia `/demos`, hacia el
  formulario de leads de la landing (`/#contacto`) y hacia `/recetas` — y
  hasta 2 posts relacionados para seguir navegando.
- El link "Recetas" del header del sitio apunta a `/recetas`.
- **SEO** (`generateMetadata`): en el detalle, `title` usa `seo_title` si
  existe (si no, `"<título> | La Chef que Sí Sabe"`) y `description` usa
  `seo_description` si existe (si no, `excerpt`; si tampoco, una
  descripción genérica). El listado usa un título y descripción fijos
  orientados a SEO general del content hub.

### `SafeTextRenderer`

`src/components/ui/SafeTextRenderer.tsx` renderiza el `body` (texto plano
editado por el admin) separando párrafos por líneas en blanco dobles y
detectando listas simples (todas las líneas de un bloque empezando con
`- ` o `* `). Nunca interpreta HTML: no usa `dangerouslySetInnerHTML`, así
que cualquier `<script>` o etiqueta que un admin escriba por error se
muestra como texto literal en vez de ejecutarse. Cubierto por tests
(`SafeTextRenderer.test.tsx`) que confirman que una etiqueta en el texto
nunca termina en el DOM como elemento real.

### Panel admin

`/admin/content` lista todo el contenido (cualquier estado), con su tipo,
categoría, fecha de creación y estado. La navegación del panel dice
**"Contenido"**, no "Recetas", porque desde ahí se gestionan recetas,
tips y guías por igual.

- **Crear contenido** (`/admin/content/new`): título, tipo (receta/tip/
  guía), categoría (opcional, del catálogo de `content_categories`),
  estado (borrador/publicado/archivado — se puede publicar directamente
  al crear), extracto, imagen (solo un link — no hay subida de archivos
  todavía), tiempos de preparación/cocción, porciones, dificultad,
  ingredientes e instrucciones (opcionales, una línea por ítem), el cuerpo
  del post, título/descripción SEO opcionales y un checkbox "Destacado".
  `created_by` y el `slug` (generado a partir del título, con sufijo
  `-2`/`-3`... si ya existe uno igual) salen del servidor, nunca del
  formulario. Si se crea directamente en `published` y no hay
  `published_at`, se fija a la hora actual.
- **Editar contenido** (`/admin/content/[id]`): mismo formulario, incluido
  el selector de **Estado** — así se publica, despublica (vuelve a
  borrador) o archiva desde el mismo lugar donde se edita el contenido.
  Al pasar a `published` por primera vez se guarda `published_at`; al
  volver a `draft` se limpia (`published_at = null`, como si nunca se
  hubiera publicado); al archivar no se toca, para conservar cuándo se
  publicó por última vez. El contenido archivado nunca aparece en
  `/recetas` (la condición pública exige `status = 'published'`).

El contenido no tiene sección propia en `/admin/dashboard` (ver "Dashboard
(PR 8)" más abajo, que prioriza seguimientos, leads, demos y campañas para
no saturar la pantalla principal): se gestiona por completo desde
`/admin/content`.

## Seguimientos y plantillas de mensaje (PR 6)

PR 5 dejó una primera versión del Centro de Seguimientos basada
únicamente en `leads.next_follow_up_at`: útil, pero una sola fecha por
lead no alcanza para modelar "a quién escribirle, por qué y con qué
mensaje" de forma confiable. PR 6 completa la arquitectura real, sin
descartar ese campo: lo convierte en un snapshot derivado en vez de la
fuente de verdad.

- **`follow_up_tasks`** es la fuente real. Cada seguimiento programado es
  una fila propia, con su propio ciclo de vida (`open` → `completed` /
  `skipped` / `cancelled`), en vez de un campo suelto en el lead. Un lead
  puede tener varias tareas a lo largo del tiempo (historial completo,
  visible en su detalle) y, en teoría, más de una abierta a la vez (por
  ejemplo, una del estado comercial y otra atada a una demo concreta).
- **`leads.next_follow_up_at` se mantiene como snapshot derivado**, no
  como campo editable: un trigger de base de datos
  (`sync_lead_next_follow_up_at`, en `0006_follow_up_tasks.sql`) lo
  recalcula automáticamente cada vez que cambian las tareas de un lead —
  se crea una, se reprograma, se completa/salta/cancela — a la fecha de
  su tarea `open` más próxima, o `null` si ya no le queda ninguna. Ningún
  formulario ni server action lo escribe directamente (`LeadUpdateForm`
  ya no lo expone); el dashboard, `LeadInfoCard` y cualquier otra vista
  que lo necesite lo siguen leyendo tal cual.
- **Creación automática ante los eventos importantes**
  (`lib/leads/follow-up-suggestions.ts`, `lib/leads/
  follow-up-task-lifecycle.ts` función `ensureFollowUpTaskForStatus`, y
  los dos triggers `security definer` de `0006_follow_up_tasks.sql` para
  los caminos públicos):

  | Evento | `source` | Tarea | Plantilla |
  | --- | --- | --- | --- |
  | Lead nuevo (`status = 'new'`) | `initial_contact` | Enviar primer contacto | `primer-contacto` |
  | Admin agrega un lead a una demo (`attendance_status` nace `registered`, sin confirmar) | `demo_invitation` | Confirmar demo | `invitacion-demo` |
  | Registro público a una demo (`attendance_status` nace `confirmed`) | `demo_confirmation` | Enviar confirmación de demo | `confirmacion-demo` |
  | Recordatorio más cerca de la fecha (`leads.status` pasa a `confirmed_demo`) | `demo_reminder` | Recordar demo | `recordatorio-demo` |
  | Asistencia marcada como asistió (`attendance_status = 'attended'`) | `post_demo_follow_up` | Seguimiento post-demo | `seguimiento-post-demo` |
  | Asistencia marcada como no asistió (`attendance_status = 'no_show'`) | `no_show_recovery` | Reagendar | `recuperacion-no-show` |

  `demo_confirmation` y `demo_reminder` son eventos distintos y no deben
  confundirse: el primero es la confirmación inmediata de que el lead
  quedó inscrito (plantilla `confirmacion-demo`); el segundo es el
  recordatorio posterior, más cerca de la fecha (plantilla
  `recordatorio-demo`).

  Los dos primeros de la tabla (lead nuevo, inscripción a una demo) corren
  en los triggers de base de datos, porque deben funcionar también cuando
  el evento lo dispara el formulario público (rol `anon`, sin permiso de
  escritura sobre `follow_up_tasks`). Los otros tres (`demo_reminder`,
  `post_demo_follow_up`, `no_show_recovery`) llegan por
  `ensureFollowUpTaskForStatus` — `demo_reminder` cuando `leads.status`
  pasa a `confirmed_demo` (por ejemplo, al confirmar manualmente una
  inscripción que había quedado en `registered`); los otros dos vía
  `updateAttendanceStatus`, que sincroniza `leads.status` y en el mismo
  paso llama a `ensureFollowUpTaskForStatus`. Todos corren siempre con
  sesión autenticada, así que no necesitan un trigger.

  Además:
  - Cambiar el `status` de un lead a `contacted`/`interested` (sin un
    evento tan específico) asegura una tarea genérica (`source =
    status_change`, plantilla `recontacto-suave`) — solo si el lead **no
    tiene ya** una tarea abierta, para no acumular duplicados cada vez
    que se guarda el mismo estado.
  - Si el estado pasa a uno final (`purchased` o `lost`), en vez de crear
    una tarea nueva se **cancelan** las abiertas: ya no hay nada que
    hacer.
- **Ciclo de vida manual, desde el Centro de Seguimientos o el detalle del
  lead** (`lib/actions/follow-up-tasks.ts`):
  - **Completar**: se hace registrando un contact log con `task_id` (ver
    `ContactLogForm`) — no hay un botón de "completar" suelto, completar
    significa dejar registro de qué se conversó.
  - **Saltar** (`skipFollowUpTaskAction`): la tarea no se resolvió, pero
    tampoco amerita cancelarla del todo.
  - **Cancelar** (`cancelFollowUpTaskAction`): ya no aplica.
  - **Reprogramar** (`rescheduleFollowUpTaskAction`): mueve `due_at` sin
    tocar el estado de la tarea.
  - **Programar el siguiente seguimiento**: al registrar un contact log
    con `next_follow_up_at`, se crea una tarea nueva (`source =
    contact_log`) para esa fecha; también se puede crear una tarea
    manual libre desde el detalle del lead (`ScheduleFollowUpForm`,
    `createFollowUpTaskAction`, `source = manual`).
- **`/admin/seguimientos`** (Centro de Seguimientos) agrupa las tareas
  **abiertas** en vencidas/hoy/próximas según `due_at` (no según una
  fecha en el lead), usando `groupFollowUpTasks` sobre `due_at` y
  `listOpenFollowUpTasks` (con el lead y, si aplica, la demo ya
  enlazados). Cada tarjeta de tarea muestra a quién escribirle y por qué,
  una plantilla sugerida lista para copiar/abrir en WhatsApp, y las
  acciones de arriba.
- **`message_templates`**: reemplaza los arreglos estáticos
  `WHATSAPP_TEMPLATES`/`DEMO_WHATSAPP_TEMPLATES` de PR 2/PR 3. Se
  gestionan desde **`/admin/plantillas`**, con las tres rutas habituales
  del admin:
  - **`/admin/plantillas`**: listado (nombre, clave, activa/inactiva).
  - **`/admin/plantillas/new`**: crear una plantilla nueva —única vez que
    se define su `key` (kebab-case, ej. `seguimiento-compra`); no vuelve
    a editarse.
  - **`/admin/plantillas/[id]`**: editar nombre, mensaje y
    activa/inactiva de una plantilla existente.

  `key` es el identificador estable que usa el código (sugerencias por
  estado, triggers de creación automática); las plantillas creadas a mano
  desde `/admin/plantillas/new` con una clave nueva quedan disponibles
  para elegir manualmente, pero no conectadas a ninguna sugerencia
  automática (esa conexión vive en `follow-up-suggestions.ts` y en los
  triggers de la migración).

Todo sigue siendo manual: no hay envío automático de WhatsApp/email, no
hay cron jobs, no hay integraciones externas. Lo único "automático" es
que la tarea correcta ya está ahí, con el mensaje correcto sugerido, y
que `leads.next_follow_up_at` refleja esa tarea sin que nadie lo edite a
mano, cuando la persona administradora entra a hacer el seguimiento.

## Segmentación de leads y campañas manuales (PR 7)

PR 7 agrega dos piezas nuevas para pasar de "tengo leads sueltos" a poder
organizarlos en grupos y preparar un seguimiento manual ordenado:
**segmentos** (`lead_segments`) y **campañas manuales de outreach**
(`outreach_campaigns` + `outreach_campaign_recipients`). Sigue siendo
100% manual — no hay envío automático de WhatsApp/email, sin cron jobs,
sin scoring, sin IA generativa. Lo único que "automatiza" son los dos
pasos explícitos de una campaña, y ninguno de los dos envía nada:
**materializar destinatarios** y **generar tareas de seguimiento**.

### Segmentos y su criterio de filtros

Un segmento es un nombre + una descripción opcional + un **criterio**
(`lead_segments.criteria`, `jsonb`). El shape exacto del criterio lo
define y valida `leadSegmentCriteriaSchema`
(`src/lib/validations/lead-segment.ts`, `.strict()`): solo estas 15 keys
están permitidas, todas opcionales (`{}` es un criterio válido, sin
restricciones), y se combinan siempre con AND:

| Key | Filtra por |
| --- | --- |
| `statuses` | `leads.status` (una de varias) |
| `primary_interests` | `leads.primary_interest` (uno de varios) |
| `sources` | `leads.source` (una de varias, coincidencia exacta) |
| `consent_contact` | `leads.consent_contact` |
| `created_from` / `created_to` | Rango de `leads.created_at` |
| `last_contacted_before` / `last_contacted_after` | Rango de `leads.last_contacted_at` |
| `next_follow_up_before` / `next_follow_up_after` | Rango de `leads.next_follow_up_at` |
| `has_open_follow_up_task` | Tiene o no una `follow_up_tasks` con `status = 'open'` |
| `demo_event_id` | Inscrito en esa demo (`demo_registrations`) |
| `demo_attendance_statuses` | `attendance_status` de esa inscripción (una de varios) |
| `content_post_id` | Ver "Limitación de `content_post_id`" abajo |
| `search` | Nombre, email o teléfono (máximo 120 caracteres) |

`listLeadsMatchingCriteria` (`src/lib/segments/queries.ts`) calcula en
vivo qué leads matchean un criterio — no hay tabla de membresía que se
pueda desincronizar. Ningún filtro se arma con SQL crudo ni con el input
del usuario interpolado en un string: todo pasa por el query builder de
Supabase (columna + operador conocidos). En particular, `search` **no**
arma un `.or()` como string crudo (habría que escapar a mano la sintaxis
de combinadores de PostgREST, con riesgo real de hacerlo mal): corre 3
consultas `.ilike()` separadas (nombre, email, teléfono), cada una
parametrizada, y mezcla los resultados en JS deduplicando por id;
además escapa `%`, `_` y `\` del término antes de armar el patrón, para
que un lead buscando literalmente "50%" no dispare un comodín. El
resultado se acota a `limit` (por defecto 50, pensado para preview); el
fetch interno escala con ese límite para no perder leads que sí
matchean por quedar fuera de una ventana fija — quien necesite la lista
completa (por ejemplo, para materializar una campaña) pasa un límite
mayor explícito.

`/admin/segmentos` lista los segmentos con su criterio resumido en texto
(`summarizeLeadSegmentCriteria`) y cuántos leads matchean hoy;
`/admin/segmentos/new` los crea; `/admin/segmentos/[id]` edita el
criterio y muestra el preview de leads en vivo junto con las campañas de
ese segmento.

**Limitación de `content_post_id`**: hoy no existe ninguna relación real
entre `leads` y `content_posts` (ningún formulario de captura pública
etiqueta el lead con el post que lo originó). El filtro se resuelve por
convención vía `leads.source = 'content:<slug>'`
(`resolveContentPostSourceTag`), lo cual es *forward-compatible* pero no
produce matches reales todavía — un PR futuro que haga que la captura
de leads desde `/recetas/[slug]` escriba ese `source` lo activaría sin
tocar `listLeadsMatchingCriteria`. Se deja documentado acá para que no
se lea como un bug.

### Campañas manuales, en dos pasos explícitos

Una campaña (`outreach_campaigns`) referencia un segmento y una
plantilla (`message_template_id`, por `id` — no por `key` — para no
romper si la plantilla cambia de nombre), más la configuración de la
tarea que se va a generar por cada destinatario: `task_type` (canal
sugerido, reutiliza el enum `contact_channel` de `contact_logs`),
`task_priority` (`low`/`medium`/`high`), `task_title`/`task_notes`
(con fallback a `"Contactar: <nombre de la campaña>"` si `task_title`
queda vacío) y `due_at` (si queda vacío, la tarea se genera con la fecha
de hoy). Crearla no dispara nada: eso son los dos pasos siguientes,
disponibles desde el detalle de la campaña (`/admin/campanas/[id]`).

1. **Materializar destinatarios** (`materializeCampaignRecipients`,
   `src/lib/campaigns/materialize-recipients.ts`): snapshotea qué leads
   matchean el segmento **ahora mismo** como filas de
   `outreach_campaign_recipients` (`status = 'selected'`). No crea
   ninguna `follow_up_tasks` todavía, no envía mensajes ni crea
   `contact_logs`. **Solo incluye leads con `consent_contact = true`**,
   sin importar lo que diga el criterio del segmento — esta es una
   protección fija que no se puede desactivar desde el segmento (aunque
   `consent_contact` también exista como filtro explícito y opcional del
   criterio, para quien quiera acotar el *preview* por consentimiento
   antes de llegar a este paso). Idempotente: la constraint `unique
   (campaign_id, lead_id)` evita duplicar destinatarios, así que correrlo
   de nuevo más adelante solo agrega los leads que entraron al segmento
   después. Cambia `campaign.status` a `'ready'` si hay destinatarios y
   la campaña todavía estaba en `'draft'`.
2. **Generar tareas de seguimiento**
   (`generateFollowUpTasksForCampaign`,
   `src/lib/campaigns/generate-tasks.ts`): crea una `follow_up_tasks`
   (`source = 'campaign'`) por cada destinatario todavía `'selected'` **y
   sin `follow_up_task_id`** — nunca recibe una lista de leads por
   parámetro ni vuelve a calcular el segmento, solo lee
   `outreach_campaign_recipients`: los destinatarios ya quedaron fijados
   en el paso 1. Tampoco envía mensajes ni crea `contact_logs`. Por cada
   tarea creada, actualiza ese recipient a `status = 'task_created'` y
   guarda su `follow_up_task_id`. Idempotente: un recipient con
   `follow_up_task_id` ya asignado nunca se vuelve a tocar ni genera una
   tarea duplicada. Cambia `campaign.status` a `'tasks_created'` (salvo
   que ya estuviera en `'tasks_created'`, `'completed'` o `'cancelled'`).

Las tareas generadas aparecen en `/admin/seguimientos` como cualquier
otra: desde ahí se trabajan una por una (copiar/abrir WhatsApp, registrar
contacto), igual que las automáticas de PR 6.

`campaign.status` (`draft` → `ready` → `tasks_created`, más `completed`
y `cancelled`) es una columna real, no derivada — cada transición ocurre
en el paso correspondiente de arriba. `cancelOutreachCampaign`
(`/admin/campanas/[id]`, botón "Cancelar campaña") la marca `cancelled`
sin importar en qué paso estaba, sin tocar los destinatarios ni las
tareas ya generadas. `completed` queda disponible en el modelo (tipos,
labels, badge) para marcarla a mano más adelante — todavía no tiene un
botón propio en esta versión.

`outreach_campaign_recipients.status` (`selected` → `task_created`, más
`skipped` y `cancelled` para el registro manual de excepciones) documenta
en qué paso está cada destinatario; `skip_reason` queda disponible para
anotar por qué se saltó uno, aunque esta versión todavía no expone un
botón para marcarlo así — es la extensión natural más obvia y se dejó
modelada en la base para no tener que migrar de nuevo.

### Lenguaje manual, no "envío de campaña"

Esta pantalla nunca envía nada — ni WhatsApp, ni email. Por eso la UI y
esta documentación evitan a propósito "enviar campaña", "enviada" o
"delivery": el vocabulario es siempre "campaña manual", "materializar
destinatarios", "generar tareas", "tareas creadas" y "ver seguimientos".
Lo único que existe al final del flujo son tareas de seguimiento
ordinarias en `/admin/seguimientos`, para trabajarlas a mano.

### Consentimiento de contacto

**Las campañas manuales solo generan tareas para leads con
consentimiento de contacto.** `consent_contact` es un filtro explícito y
opcional del criterio de un segmento (como cualquier otro, ver la tabla
de arriba) — un segmento puede, si quiere, no filtrar por consentimiento
en su preview. Pero `materializeCampaignRecipients` vuelve a filtrar por
`consent_contact = true` siempre, sin importar el criterio del segmento:
es una protección de la capa de campañas, no del segmento, y no se puede
desactivar desde la UI.

### Rutas admin

- **`/admin/segmentos`**, **`/admin/segmentos/new`**,
  **`/admin/segmentos/[id]`**: listado, creación y detalle/edición de
  segmentos (criterio + preview de leads en vivo + campañas del
  segmento).
- **`/admin/campanas`**, **`/admin/campanas/new`**,
  **`/admin/campanas/[id]`**: listado, creación y detalle de campañas
  (preview del segmento, materializar destinatarios, generar tareas,
  cancelar).
- `/admin/dashboard` incluye una sección **Campañas recientes** (hasta 5,
  con su estado y cantidad de destinatarios).
- El detalle de un lead (`/admin/leads/[id]`) incluye una sección
  **Campañas** con las últimas 5 campañas donde ese lead fue destinatario
  (`listCampaignsForLead`), para no saturar la vista con historial viejo.

## Dashboard, QA y producción (PR 8)

PR 8 no agrega módulos nuevos: cierra el MVP para producción con hardening,
QA manual, pulido de admin, protección de rutas, estados vacíos/de error,
mobile y documentación.

- **Dashboard priorizado**: `/admin/dashboard` mostraba demasiadas
  secciones (leads por estado, por interés, contenido reciente...). Ahora
  muestra como máximo cinco cosas, en este orden: seguimientos vencidos,
  seguimientos de hoy, leads nuevos, próximas demos y campañas recientes —
  cada una con su estado vacío ("No hay tareas pendientes para hoy.", "No
  hay leads recientes.", etc.). `listDueFollowUpTasks` ahora corta en el
  fin del día de hoy (no en la hora exacta), para no perder tareas de hoy
  que todavía no vencieron.
- **Sidebar responsive**: en mobile (`<md`) se colapsa detrás de un botón
  de menú (antes quedaba fija en 256px y dejaba casi sin espacio útil al
  contenido). También marca la sección activa y reordena los enlaces:
  Dashboard, Leads, Demos, Contenido, Seguimientos, Plantillas, Segmentos,
  Campañas.
- **Header público responsive**: el menú (Recetas, Thermomix, Demos,
  Contacto) estaba oculto por completo en mobile, sin alternativa. Ahora
  hay un botón de menú que despliega los mismos enlaces.
- **Estados de error amigables**: los seis detalles de admin (lead, demo,
  contenido, plantilla, segmento, campaña) ya no usan el 404 genérico de
  Next.js — muestran una tarjeta con el nombre de la entidad y un botón
  para volver al listado (`EntityNotFoundCard`). Se agregaron además
  `not-found.tsx` y `error.tsx` (público y admin) para cualquier otro caso
  no cubierto explícitamente.
- **Sin errores crudos de Supabase**: varias acciones (crear/editar
  contenido, demos, plantillas, segmentos, y los tres pasos de campañas)
  devolvían el `error.message` de Postgres tal cual al formulario. Ahora
  todas devuelven un mensaje en español, consistente con el resto del
  admin (`"No pudimos guardar los cambios. Intenta de nuevo."` y
  variantes específicas por acción).
- **Regresión de rutas protegidas**: `src/lib/supabase/proxy.test.ts`
  cubre `updateSession` (redirige a `/admin/login?redirectTo=...` sin
  sesión, redirige a `/admin/dashboard` si ya hay sesión y visita
  `/admin/login`, no toca rutas públicas). `src/lib/leads/rls-policies.test.ts`
  cubre la RLS de `leads`/`contact_logs` (la única tabla que faltaba tener
  ese test dedicado, ver "Notas de seguridad" abajo).
- **Documentación**: [`docs/admin-guide.md`](./docs/admin-guide.md) (guía
  paso a paso para una persona no técnica) y
  [`docs/qa-checklist.md`](./docs/qa-checklist.md) (checklist manual de QA
  y smoke test) son nuevos.

## Identidad visual

El **PR de Brand Visual Refresh** alinea el look & feel del sitio con la
dirección de marca de la dueña del emprendimiento: cocina natural, gourmet,
premium y cercana, con foco en las demostraciones de Thermomix. Es un PR de
tema visual — no agrega módulos, automatizaciones ni integra la API de
WhatsApp.

### Paleta

Los tokens viven como CSS custom properties en `src/app/globals.css`
(Tailwind v4, `@theme inline`), así que la mayoría de los componentes se
retematizan solo con cambiar los valores del token:

| Token | Uso | Valores |
| --- | --- | --- |
| `emerald-900` / `emerald-800` / `emerald-700` | Fondos premium (hero, sellos, tarjetas oscuras, login admin) | `#002B22` `#003527` `#013C2B` |
| `brand-50…800` | Verde Thermomix — acento principal, nunca como fondo masivo | de `#e7f6ed` a `#006b33` (base `#00A651`) |
| `cream` / `cream-dark` / `white-soft` | Superficies cálidas de lectura | `#FFF8EA` `#EFE6D6` `#FFFDF8` |
| `olive-500` / `olive-600` | Dorado oliva — solo como detalle/acento | `#B7A96A` `#9D9357` |
| `ink` / `ink-soft` | Texto principal / texto atenuado | `#10231B` `#5C6B61` |
| `border` / `border-soft` | Bordes cálidos | `#D8CDBA` `#E5DDCF` |
| `whatsapp` | Acento de éxito / WhatsApp | `#25D366` |

Los botones sólidos usan `brand-700` (no `brand-500`) como fondo para
mantener contraste AA con texto blanco; el verde Thermomix más brillante
(`brand-300`/`brand-500`) se reserva para acentos, íconos y superficies
claras.

### Tono visual

Natural, gourmet, premium, cercano, cálido, ordenado y mobile-first.
Se evita a propósito la estética "SaaS genérico" o "dashboard tech": fondos
verde oscuro se usan solo en secciones puntuales (hero, CTA de WhatsApp,
tarjeta "por qué cocinar conmigo", login admin), nunca como fondo masivo de
toda la UI.

### Componentes principales

- `src/components/ui/Button.tsx` — variantes `primary`, `secondary`,
  `ghost`, `outline` (para fondos oscuros) y `whatsapp`. Botones tipo pill
  (`rounded-full`).
- `src/components/ui/Card.tsx` — tarjetas con esquinas grandes, borde cálido
  y fondo blanco cálido.
- `src/components/icons.tsx` — set de íconos lineales simples en SVG
  (reloj, gorro de chef, hoja, destellos, libro, pantalla, corazón,
  usuarios, WhatsApp, check). No se agregó ninguna librería de íconos.
- `src/components/landing/WhatsAppCtaSection.tsx` — CTA de WhatsApp
  reutilizable (tarjeta verde oscuro + botón pill).

### Nota sobre WhatsApp

El botón de WhatsApp del sitio público usa un link manual `wa.me`
(`src/lib/whatsapp/templates.ts`, ya existente desde PR 2). El número se
configura opcionalmente con `NEXT_PUBLIC_WHATSAPP_NUMBER` (ver
`.env.example`); si no está configurado, el CTA cae de vuelta al
formulario de contacto en vez de abrir un chat con un número inventado.
**No se integró la API de WhatsApp ni envío automático de mensajes.**

### Nota sobre la marca Thermomix

El sitio menciona Thermomix como parte de la propuesta de valor (demos y
acompañamiento), pero no crea logos oficiales ni afirma una relación
oficial con Vorwerk. El footer incluye un disclaimer sutil: "Thermomix® es
una marca registrada de Vorwerk."

## Notas de seguridad

- El formulario de leads incluye un campo honeypot y validación server-side
  con Zod (además de la validación en el cliente).
- Las rutas `/admin/*` (incluido `/admin/leads/[id]`) están protegidas por
  `src/proxy.ts` (la convención `proxy` de Next.js 16, sucesora de
  `middleware.ts`) y verificadas de nuevo en el layout del panel, como
  defensa en profundidad: un usuario anónimo nunca llega a renderizar esas
  páginas.
- El acceso a la base de datos está gobernado por RLS: la app nunca usa la
  `service_role key`. `contact_logs` solo es legible/insertable por
  usuarios autenticados; el rol `anon` no tiene ninguna política sobre esa
  tabla. `lib/leads/rls-policies.test.ts` (PR 8) deja esto como prueba de
  regresión sobre el SQL de `0001_init.sql`/`0002_contact_logs.sql`, igual
  que ya existía para demos, content hub, follow-up tasks y segmentos.
- Las server actions (`lib/actions/leads.ts`) verifican la sesión con
  `supabase.auth.getUser()` antes de escribir, además de la protección de
  ruta — nunca confían solo en que el formulario se haya renderizado tras
  el login. `created_by` en `contact_logs` sale de esa sesión, no del
  payload del formulario.
- `demo_events` y `demo_registrations` (PR 3) son legibles/editables sin
  restricciones por usuarios autenticados, igual que `contact_logs`. Las
  server actions correspondientes (`lib/actions/demos.ts`) también
  verifican la sesión antes de escribir, y `created_by` en `demo_events`
  sale de esa sesión, no del formulario.
- El sitio público solo tiene acceso de **lectura acotada** a
  `demo_events` (`status` en `scheduled`/`full` y `starts_at` futuro, ver
  `0003_demo_events.sql`) y de **inserción acotada** a
  `demo_registrations` (solo `attendance_status = 'confirmed'` y solo
  contra una demo que cumpla esa misma condición). El rol `anon` nunca
  puede leer, actualizar ni borrar `demo_registrations` — ni las que él
  mismo creó — ni insertar/actualizar/borrar `demo_events`. `lib/demos/
  rls-policies.test.ts` deja esto como prueba de regresión sobre el SQL de
  la migración.
- El registro público a una demo (`lib/demos/public-register.ts`) nunca
  encadena `.select()` tras el `insert` en `leads`: como `anon` no tiene
  policy de `SELECT` sobre esa tabla, pedirle a PostgREST la fila
  insertada de vuelta (`RETURNING`) haría fallar el insert completo por
  RLS. El id del lead se genera en la aplicación (`crypto.randomUUID()`)
  para no necesitarlo. Esto se verificó corriendo las migraciones contra
  un Postgres real con los roles `anon`/`authenticated` y probando cada
  policy, no solo por inspección del SQL.
- El endpoint público de registro a demos (`/api/demos/[slug]/register`)
  valida `status`/`starts_at` en la aplicación además de en RLS (defensa
  en profundidad), igual que el resto de las server actions verifican la
  sesión aunque la ruta ya esté protegida.
- `content_categories` y `content_posts` (PR 4) siguen el mismo patrón que
  `demo_events`: el equipo autenticado tiene CRUD completo
  (`lib/actions/content.ts` verifica la sesión con
  `supabase.auth.getUser()` antes de escribir, y `created_by` en
  `content_posts` sale de esa sesión, nunca del formulario o del payload;
  `created_at` tampoco se acepta desde el formulario — la capa de datos
  (`lib/content/create-content-post.ts`, `lib/content/update-content-post.ts`)
  construye el payload con un **allowlist explícito** de campos, nunca
  reenvía el input completo). El rol `anon`:
  - solo puede **leer** categorías con `is_active = true` y posts con
    `status = 'published' and published_at is not null and published_at
    <= now()` (`0005_content_hub.sql`) — nunca ve borradores ni contenido
    archivado, sin importar la fecha.
  - no puede insertar, actualizar ni borrar categorías ni posts. No hay
    comentarios, ratings ni favoritos públicos todavía.

  `lib/content/rls-policies.test.ts` deja esto como prueba de regresión
  sobre el SQL de la migración (incluye una prueba que confirma que la
  condición de `anon` sobre `content_posts` nunca menciona `draft` ni
  `archived`).
- `/admin/content` está protegido por los mismos dos niveles que el resto
  de `/admin/*` (proxy + verificación en el layout).
- `follow_up_tasks` y `message_templates` (PR 6) son de uso exclusivo del
  equipo autenticado: el rol `anon` no tiene **ninguna** policy sobre
  ninguna de las dos tablas (`lib/leads/follow-up-tasks-rls-policies.test.ts`
  lo deja como prueba de regresión). La única escritura que `anon` puede
  disparar es indirecta, a través de tres triggers `security definer` de
  `0006_follow_up_tasks.sql`: dos crean tareas ante un evento puntual
  (creación de un lead, inscripción a una demo) y el tercero
  (`sync_lead_next_follow_up_at`) recalcula `leads.next_follow_up_at`
  cada vez que cambian las tareas de un lead — ninguno le da a `anon`
  acceso directo de lectura o escritura sobre `follow_up_tasks`.
- Las nuevas server actions (`lib/actions/follow-up-tasks.ts`,
  `lib/actions/message-templates.ts`) verifican la sesión con
  `supabase.auth.getUser()` antes de escribir, igual que el resto.
  `createMessageTemplateAction` además captura el error de clave
  duplicada (`23505`) y responde con un mensaje amigable en vez de un
  error genérico de base de datos.
- El cuerpo de los posts (`content_posts.body`) se renderiza en
  `/recetas/[slug]` con `SafeTextRenderer`, que nunca usa
  `dangerouslySetInnerHTML` — cualquier HTML que un admin escriba por
  error en el contenido se muestra como texto literal, nunca se ejecuta ni
  se inserta en el DOM.
- `lead_segments`, `outreach_campaigns` y `outreach_campaign_recipients`
  (PR 7) son de uso exclusivo del equipo autenticado: el rol `anon` no
  tiene **ninguna** policy sobre ninguna de las tres tablas
  (`lib/segments/rls-policies.test.ts` lo deja como prueba de regresión).
  A diferencia de `follow_up_tasks`, acá no hay ningún trigger `security
  definer`: nada de lo que dispara el sitio público toca, ni siquiera
  indirectamente, estas tablas. `outreach_campaign_recipients` permite
  `select`/`insert`/`update` a usuarios autenticados pero nunca `delete`
  — el historial de a quién se seleccionó no se borra, se marca
  `skipped`/`cancelled`.
- El criterio de un segmento (`lead_segments.criteria`) nunca se usa para
  construir SQL crudo: `listLeadsMatchingCriteria`
  (`src/lib/segments/queries.ts`) solo aplica columna + operador
  conocidos vía el query builder de Supabase, y el filtro `search` evita
  por completo armar un `.or()` con el input del usuario interpolado
  (corre 3 consultas `.ilike()` parametrizadas y mezcla en JS), escapando
  además `%`/`_`/`\` del término para que no actúe como comodín
  involuntario.
- `materializeCampaignRecipients` (`src/lib/campaigns/materialize-recipients.ts`)
  filtra siempre por `consent_contact = true` antes de crear un
  destinatario, sin importar el criterio del segmento: ninguna campaña
  manual puede generar una tarea de contacto para un lead que no
  autorizó ser contactado. Las server actions de segmentos y campañas
  (`lib/actions/segments.ts`, `lib/actions/campaigns.ts`) verifican la
  sesión con `supabase.auth.getUser()` antes de escribir, igual que el
  resto del admin.
