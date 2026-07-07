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
demos y empiece a atraer tráfico propio. No incluye automatizaciones,
WhatsApp API, email automation, HubSpot, pagos, carrito, inventario,
cursos pagos, membresías, subida avanzada de imágenes, IA generativa,
comentarios públicos, ratings, favoritos, login de usuarios finales ni
newsletter avanzada — eso queda para PRs posteriores.

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
  components/
    landing/                  # Header, Hero, Features, LeadForm, Footer...
    demos/                    # DemoCard, PublicDemoRegistrationForm (sitio público)
    content/                  # ContentPostCard, ContentCtaSection, ContentFilterBar
                               # (sitio público)
    admin/                    # Sidebar, StatCard, LeadsTable, LeadInfoCard,
                               # LeadUpdateForm, ContactLogForm/Timeline,
                               # UpcomingFollowUps, WhatsAppTemplates,
                               # DemoEventForm/InfoCard/StatusForm,
                               # DemoEventsList, DemoRegistrationForm,
                               # DemoRosterTable, DemoTemplateActions,
                               # UpcomingDemos, ContentPostForm, ContentPostsTable,
                               # RecentContentPosts, LoginForm...
    ui/                       # Button, Input, Field, Select, Textarea, Card, Badge,
                               # SafeTextRenderer
  lib/
    supabase/                 # Clientes de Supabase (server + proxy/sesión)
    validations/               # Schemas Zod compartidos (incluye registro público a demo)
    leads/                     # Capa de acceso a datos de leads (testeable)
    demos/                     # Capa de acceso a datos de demos e inscripciones,
                                # registro público, slugs y formato de fecha/hora
    content/                   # Capa de acceso a datos de content_categories y
                                # content_posts, slugs únicos y estadísticas para
                                # el dashboard
    whatsapp/                  # Plantillas (leads y demos) y utilidades de WhatsApp
    actions/                   # Server actions (auth, leads, contact logs, demos, content)
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

`/admin/dashboard` incluye una tarjeta **Contenido publicado** (con lo que
sigue en borrador/archivado como dato secundario) y una sección
**Contenido reciente** con hasta 5 posts (título, estado, tipo, última
actualización y un link para editar), ordenados por `updated_at`
descendente.

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
- El cuerpo de los posts (`content_posts.body`) se renderiza en
  `/recetas/[slug]` con `SafeTextRenderer`, que nunca usa
  `dangerouslySetInnerHTML` — cualquier HTML que un admin escriba por
  error en el contenido se muestra como texto literal, nunca se ejecuta ni
  se inserta en el DOM.
