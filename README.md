# La Chef que Sí Sabe

**lachefquesisabe.com** — website público + mini CRM/admin privado para
capturar leads interesados en recetas, demos de cocina y demostraciones de
Thermomix.

> Cocina rico, fácil y sin complicarte.

Este repositorio contiene el **PR 1**: la base técnica y funcional mínima del
proyecto (landing, captura de leads, Supabase, admin con login y un
dashboard inicial). No incluye automatizaciones, WhatsApp API, pagos online
ni integraciones de CRM avanzadas — eso queda para PRs posteriores.

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
      (protected)/            # Dashboard y leads (requieren sesión)
  components/
    landing/                  # Header, Hero, Features, LeadForm, Footer...
    admin/                    # Sidebar, StatCard, LeadsTable, LoginForm...
    ui/                       # Button, Input, Field, Select, Card, Badge
  lib/
    supabase/                 # Clientes de Supabase (server + proxy/sesión)
    validations/               # Schemas Zod compartidos
    leads/                     # Capa de acceso a datos de leads (testeable)
    actions/                   # Server actions (auth)
  proxy.ts                     # Protege /admin (antes "middleware.ts")
supabase/
  migrations/0001_init.sql     # Tabla leads, enums y políticas RLS
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
  si `consent = true`.
- Solo usuarios **autenticados** (el equipo admin) pueden leer/actualizar/
  borrar leads.

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

## Notas de seguridad

- El formulario de leads incluye un campo honeypot y validación server-side
  con Zod (además de la validación en el cliente).
- Las rutas `/admin/*` están protegidas por `src/proxy.ts` (la convención
  `proxy` de Next.js 16, sucesora de `middleware.ts`) y verificadas de nuevo
  en el layout del panel, como defensa en profundidad.
- El acceso a la base de datos está gobernado por RLS: la app nunca usa la
  `service_role key`.
