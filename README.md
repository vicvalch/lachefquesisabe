# La Chef que Sí Sabe

**lachefquesisabe.com** — website público + mini CRM/admin privado para
capturar leads interesados en recetas, demos de cocina y demostraciones de
Thermomix.

> Cocina rico, fácil y sin complicarte.

Este repositorio contiene el **PR 1** (landing, captura de leads, Supabase,
admin con login y un dashboard inicial), el **PR 2** (detalle de lead,
estados comerciales ampliados, notas, próximos seguimientos, bitácora de
contactos y plantillas de WhatsApp) y el **PR 3**: módulo de demostraciones
completo, tanto para el equipo admin (`/admin/demos`: crear demos, agregar
leads, controlar asistencia) como para el público (`/demos`: ver próximas
demostraciones y registrarse a una desde el sitio, sin sesión), para que el
tráfico del sitio se convierta en registros reales y el equipo pueda dar
seguimiento manual por WhatsApp sin depender de hojas sueltas. No incluye
automatizaciones, WhatsApp API, email automation, HubSpot, pagos online,
campañas avanzadas, recetas en CMS ni integración con Google Calendar — eso
queda para PRs posteriores.

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
  components/
    landing/                  # Header, Hero, Features, LeadForm, Footer...
    demos/                    # DemoCard, PublicDemoRegistrationForm (sitio público)
    admin/                    # Sidebar, StatCard, LeadsTable, LeadInfoCard,
                               # LeadUpdateForm, ContactLogForm/Timeline,
                               # UpcomingFollowUps, WhatsAppTemplates,
                               # DemoEventForm/InfoCard/StatusForm,
                               # DemoEventsList, DemoRegistrationForm,
                               # DemoRosterTable, DemoTemplateActions,
                               # UpcomingDemos, LoginForm...
    ui/                       # Button, Input, Field, Select, Textarea, Card, Badge
  lib/
    supabase/                 # Clientes de Supabase (server + proxy/sesión)
    validations/               # Schemas Zod compartidos (incluye registro público a demo)
    leads/                     # Capa de acceso a datos de leads (testeable)
    demos/                     # Capa de acceso a datos de demos e inscripciones,
                                # registro público, slugs y formato de fecha/hora
    whatsapp/                  # Plantillas (leads y demos) y utilidades de WhatsApp
    actions/                   # Server actions (auth, leads, contact logs, demos)
  proxy.ts                     # Protege /admin (antes "middleware.ts")
supabase/
  migrations/
    0001_init.sql              # Tabla leads, enums y políticas RLS
    0002_contact_logs.sql      # Estados ampliados, primary_interest, notas,
                                # seguimientos y tabla contact_logs
    0003_demo_events.sql       # demo_events, demo_registrations y políticas RLS
                                # (admin + lectura/registro público)
    0004_leads_email_optional.sql  # leads.email pasa a ser opcional
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
npm run test       # Tests (Vitest)
npm run test:watch # Tests en modo watch
```

## Detalle de lead y seguimiento (PR 2)

Desde `/admin/leads` cada fila enlaza al detalle del lead
(`/admin/leads/[id]`), pensado para el seguimiento manual día a día:

- **Datos completos** del lead (contacto, interés primario, mensaje,
  estado, último contacto y próximo seguimiento).
- **Actualización del lead** (`LeadUpdateForm`): el admin puede cambiar
  `status`, `notes` y `next_follow_up_at` desde un único formulario con
  validación Zod y un allowlist explícito en la capa de datos
  (`lib/leads/update-lead.ts`) — `email`, `phone`, `source`,
  `consent_contact` y `created_at` nunca se aceptan desde este formulario.
- **Registrar contacto** (`ContactLogForm`): guarda un registro en
  `contact_logs` (canal, dirección, resumen, resultado opcional y próximo
  seguimiento opcional). Al guardarlo, automáticamente:
  1. Inserta la fila en `contact_logs` con `created_by` tomado de la sesión
     autenticada (nunca del formulario).
  2. Actualiza `leads.last_contacted_at` a la hora actual.
  3. Si se indicó `next_follow_up_at`, también actualiza ese campo en el
     lead.
  4. Revalida el detalle del lead, el listado y el dashboard.
- **Plantillas de WhatsApp** personalizadas con el nombre del lead, listas
  para copiar o abrir directo en WhatsApp (`wa.me`) si el lead tiene
  teléfono. `lib/whatsapp/templates.ts` expone `normalizePhoneForWhatsApp`
  y `buildWhatsAppUrl`, que limpian espacios/guiones/paréntesis y agregan el
  código `506` a números ticos de 8 dígitos sin código de país. No hay
  integración con la API de WhatsApp: el envío sigue siendo manual.

`/admin/leads` admite filtros simples por query params (`status`,
`interest` — este último filtra internamente contra `primary_interest`),
por ejemplo `/admin/leads?status=contacted&interest=buy_thermomix`. Sigue
limitado a 50 resultados ordenados por `created_at` descendente.

`/admin/dashboard` incluye una sección **Seguimientos pendientes** con
hasta 5 leads cuyo `next_follow_up_at` ya venció, ordenados por fecha de
seguimiento ascendente.

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
    filtros de leads, seguimientos pendientes — quede al día sin trabajo
    manual extra. Cancelar una inscripción no cambia el status del lead.
    Cada fila incluye plantillas de WhatsApp específicas de demo
    (invitación, confirmación, recordatorio, después de la demo — ver
    abajo) para copiar o abrir en `wa.me`, y un enlace al detalle del lead.
  - **Estado de la demo**: un formulario aparte permite marcarla como
    borrador, programada, con cupo lleno, realizada o cancelada, y guardar
    notas internas, sin tocar título, modalidad, ubicación, fecha ni cupo
    (esos solo se definen al crearla).

`/admin/dashboard` incluye una sección **Próximas demos** con hasta 5 demos
programadas y su cupo, para tener a la vista lo que viene sin entrar al
listado completo.

### Plantillas de WhatsApp para demos

`lib/whatsapp/templates.ts` expone `DEMO_WHATSAPP_TEMPLATES` (invitación,
confirmación, recordatorio, después de la demo) y `renderDemoTemplate(id,
lead, demo)`, que rellena `{{name}}`, `{{demo_title}}`, `{{demo_date}}`,
`{{demo_time}}` y `{{demo_location}}` (fecha/hora con `Intl` en locale
`es-CR`, sin dependencias externas). No hay integración con la API de
WhatsApp: `DemoTemplateActions` en el roster de `/admin/demos/[id]` solo
copia el mensaje al portapapeles o abre un link `wa.me`.

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
  tabla.
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
