-- PR4: recetas y tips de cocina (content hub) para atraer tráfico, generar
-- confianza y llevar visitantes hacia las demos y la captura de leads. El
-- equipo admin crea/edita/publica/despublica desde /admin/recetas; el sitio
-- público (/recetas) solo ve las que están en status "published".

do $$ begin
  create type recipe_content_type as enum ('recipe', 'tip');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type recipe_status as enum ('draft', 'published');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  title text not null,
  slug text not null unique,
  content_type recipe_content_type not null default 'recipe',
  status recipe_status not null default 'draft',
  summary text,
  cover_image_url text,
  prep_minutes integer,
  servings integer,
  ingredients text,
  content text not null,
  cta_message text,
  constraint recipes_title_length check (char_length(title) between 2 and 150),
  constraint recipes_slug_length check (char_length(slug) between 2 and 180),
  constraint recipes_summary_length check (
    summary is null or char_length(summary) <= 300
  ),
  constraint recipes_cover_image_url_length check (
    cover_image_url is null or char_length(cover_image_url) <= 500
  ),
  constraint recipes_ingredients_length check (
    ingredients is null or char_length(ingredients) <= 4000
  ),
  constraint recipes_content_length check (
    char_length(content) between 1 and 20000
  ),
  constraint recipes_cta_message_length check (
    cta_message is null or char_length(cta_message) <= 300
  ),
  constraint recipes_prep_minutes_range check (
    prep_minutes is null or prep_minutes between 1 and 600
  ),
  constraint recipes_servings_range check (
    servings is null or servings between 1 and 50
  )
);

create index if not exists recipes_public_visibility_idx
  on public.recipes (status, published_at desc);

create index if not exists recipes_created_at_idx
  on public.recipes (created_at desc);

-- Reutiliza la función public.set_updated_at() creada en 0003_demo_events.sql.
drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
  before update on public.recipes
  for each row
  execute function public.set_updated_at();

alter table public.recipes enable row level security;

-- El equipo admin autenticado gestiona recetas por completo.
drop policy if exists "Authenticated can read recipes" on public.recipes;
create policy "Authenticated can read recipes"
  on public.recipes
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert recipes" on public.recipes;
create policy "Authenticated can insert recipes"
  on public.recipes
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update recipes" on public.recipes;
create policy "Authenticated can update recipes"
  on public.recipes
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete recipes" on public.recipes;
create policy "Authenticated can delete recipes"
  on public.recipes
  for delete
  to authenticated
  using (true);

-- El sitio público solo puede leer recetas publicadas. Nunca puede crear,
-- actualizar ni borrar (no hay comentarios, ratings ni favoritos todavía).
drop policy if exists "Public can read published recipes" on public.recipes;
create policy "Public can read published recipes"
  on public.recipes
  for select
  to anon
  using (status = 'published');
