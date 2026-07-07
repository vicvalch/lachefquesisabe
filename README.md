# La Chef que Sí Sabe

**lachefquesisabe.com** — website público + mini CRM/admin privado para
capturar leads interesados en recetas, demos de cocina y demostraciones de
Thermomix.

> Cocina rico, fácil y sin complicarte.

Este repositorio contiene el **PR 1** (landing, captura de leads, Supabase,
admin con login y un dashboard inicial) y el **PR 2**: detalle de lead,
cambio de estado comercial, notas de seguimiento, registro de contactos y
plantillas de WhatsApp personalizadas, para que el seguimiento manual por
WhatsApp se pueda hacer desde el admin sin perder oportunidades. No incluye
automatizaciones, WhatsApp API, email automation, HubSpot, pagos online,
campañas avanzadas, recetas en CMS ni agenda de demos — eso queda para PRs
posteriores.

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
                               # StatusSelect, ActivityForm/Timeline,
                               # WhatsAppTemplates, LoginForm...
    ui/                       # Button, Input, Field, Select, Textarea, Card, Badge
  lib/
    supabase/                 # Clientes de Supabase (server + proxy/sesión)
    validations/               # Schemas Zod compartidos
    leads/                     # Capa de acceso a datos de leads (testeable)
    whatsapp/                  # Plantillas de WhatsApp personalizadas
    actions/                   # Server actions (auth, estado y notas de leads)
  proxy.ts                     # Protege /admin (antes "middleware.ts")
supabase/
  migrations/
    0001_init.sql              # Tabla leads, enums y políticas RLS
    0002_lead_activities.sql   # Notas de seguimiento y registro de contactos
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
apoyándose en las políticas RLS de Postgres.

### 2. Base de datos

Aplica la migración inicial en tu proyecto de Supabase. Puedes pegar el
contenido de `supabase/migrations/0001_init.sql` en el SQL Editor del
dashboard de Supabase, o, si usas la Supabase CLI:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

Esto crea la tabla `leads` (con enums `lead_interest` / `lead_status`),
índices y políticas de Row Level Security:

- El formulario público solo puede **insertar** leads (rol `anon`), y solo
  si `consent_contact = true`.
- Solo usuarios **autenticados** (el equipo admin) pueden leer/actualizar/
  borrar leads.

Aplica también `supabase/migrations/0002_lead_activities.sql`, que agrega la
tabla `lead_activities` (notas de seguimiento y contactos registrados desde
el detalle de cada lead). Esta tabla es de uso exclusivo del equipo admin:
solo usuarios **autenticados** pueden leer/insertar/borrar, el formulario
público no la toca.

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

## Detalle de lead (PR 2)

Desde `/admin/leads` cada fila enlaza al detalle del lead
(`/admin/leads/[id]`), pensado para el seguimiento manual día a día:

- **Datos completos** del lead (contacto, interés, mensaje y estado actual).
- **Cambio de estado comercial** (`nuevo` → `contactado` → `convertido` /
  `descartado`) con un selector que guarda al instante.
- **Notas y contactos registrados**: una bitácora cronológica por lead para
  anotar seguimientos o dejar constancia de cada contacto (llamada,
  WhatsApp, email, otro).
- **Plantillas de WhatsApp** personalizadas con el nombre del lead, listas
  para copiar o abrir directo en WhatsApp (`wa.me`) si el lead tiene
  teléfono. No hay integración con la API de WhatsApp: el envío sigue
  siendo manual.

## Notas de seguridad

- El formulario de leads incluye un campo honeypot y validación server-side
  con Zod (además de la validación en el cliente).
- Las rutas `/admin/*` están protegidas por `src/proxy.ts` (la convención
  `proxy` de Next.js 16, sucesora de `middleware.ts`) y verificadas de nuevo
  en el layout del panel, como defensa en profundidad.
- El acceso a la base de datos está gobernado por RLS: la app nunca usa la
  `service_role key`.
