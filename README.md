# La Chef que Sí Sabe

**lachefquesisabe.com** — website público + mini CRM/admin privado para
capturar leads interesados en recetas, demos de cocina y demostraciones de
Thermomix.

> Cocina rico, fácil y sin complicarte.

Este repositorio contiene el **PR 1** (landing, captura de leads, Supabase,
admin con login y un dashboard inicial) y el **PR 2**: detalle de lead,
estados comerciales ampliados, notas, próximos seguimientos, bitácora de
contactos (`contact_logs`) y plantillas de WhatsApp personalizadas, para que
el seguimiento manual por WhatsApp se pueda hacer desde el admin sin perder
oportunidades. No incluye automatizaciones, WhatsApp API, email automation,
HubSpot, pagos online, campañas avanzadas, recetas en CMS ni agenda de
demos — eso queda para PRs posteriores.

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
    api/leads/route.ts        # Endpoint de captura de leads
    admin/
      (auth)/login/           # Login (fuera del layout protegido)
      (protected)/            # Dashboard, listado y detalle de leads (requieren sesión)
        leads/[id]/            # Detalle de un lead: estado, notas, WhatsApp
  components/
    landing/                  # Header, Hero, Features, LeadForm, Footer...
    admin/                    # Sidebar, StatCard, LeadsTable, LeadInfoCard,
                               # LeadUpdateForm, ContactLogForm/Timeline,
                               # UpcomingFollowUps, WhatsAppTemplates, LoginForm...
    ui/                       # Button, Input, Field, Select, Textarea, Card, Badge
  lib/
    supabase/                 # Clientes de Supabase (server + proxy/sesión)
    validations/               # Schemas Zod compartidos
    leads/                     # Capa de acceso a datos de leads (testeable)
    whatsapp/                  # Plantillas y utilidades de WhatsApp
    actions/                   # Server actions (auth, update de leads, contact logs)
  proxy.ts                     # Protege /admin (antes "middleware.ts")
supabase/
  migrations/
    0001_init.sql              # Tabla leads, enums y políticas RLS
    0002_contact_logs.sql      # Estados ampliados, primary_interest, notas,
                                # seguimientos y tabla contact_logs
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
