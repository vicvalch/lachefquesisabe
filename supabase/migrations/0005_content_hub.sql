-- PR4: content hub (categorías + posts de recetas, tips y guías) para
-- atraer tráfico, generar confianza y llevar visitantes hacia las demos y
-- la captura de leads. El equipo admin crea/edita/publica/despublica desde
-- /admin/content; el sitio público (/recetas) solo ve los posts en
-- status "published" con published_at ya cumplido.

do $$ begin
  create type content_type as enum ('recipe', 'tip', 'guide');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type content_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type content_difficulty as enum ('easy', 'medium', 'hard');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.content_categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  constraint content_categories_name_length check (char_length(name) between 2 and 100),
  constraint content_categories_slug_length check (char_length(slug) between 2 and 120),
  constraint content_categories_description_length check (
    description is null or char_length(description) <= 300
  )
);

create index if not exists content_categories_active_sort_idx
  on public.content_categories (is_active, sort_order);

-- Reutiliza la función public.set_updated_at() creada en 0003_demo_events.sql.
drop trigger if exists content_categories_set_updated_at on public.content_categories;
create trigger content_categories_set_updated_at
  before update on public.content_categories
  for each row
  execute function public.set_updated_at();

alter table public.content_categories enable row level security;

-- El equipo admin autenticado gestiona categorías por completo.
drop policy if exists "Authenticated can read content categories" on public.content_categories;
create policy "Authenticated can read content categories"
  on public.content_categories
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert content categories" on public.content_categories;
create policy "Authenticated can insert content categories"
  on public.content_categories
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update content categories" on public.content_categories;
create policy "Authenticated can update content categories"
  on public.content_categories
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete content categories" on public.content_categories;
create policy "Authenticated can delete content categories"
  on public.content_categories
  for delete
  to authenticated
  using (true);

-- El sitio público solo puede leer categorías activas. Nunca puede crear,
-- actualizar ni borrar.
drop policy if exists "Public can read active content categories" on public.content_categories;
create policy "Public can read active content categories"
  on public.content_categories
  for select
  to anon
  using (is_active = true);

create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  category_id uuid references public.content_categories (id) on delete set null,
  title text not null,
  slug text not null unique,
  content_type content_type not null default 'recipe',
  status content_status not null default 'draft',
  excerpt text,
  body text not null,
  ingredients text,
  instructions text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer,
  difficulty content_difficulty,
  image_url text,
  seo_title text,
  seo_description text,
  featured boolean not null default false,
  constraint content_posts_title_length check (char_length(title) between 2 and 150),
  constraint content_posts_slug_length check (char_length(slug) between 2 and 180),
  constraint content_posts_excerpt_length check (
    excerpt is null or char_length(excerpt) <= 300
  ),
  constraint content_posts_body_length check (char_length(body) between 1 and 20000),
  constraint content_posts_ingredients_length check (
    ingredients is null or char_length(ingredients) <= 4000
  ),
  constraint content_posts_instructions_length check (
    instructions is null or char_length(instructions) <= 8000
  ),
  constraint content_posts_prep_time_range check (
    prep_time_minutes is null or prep_time_minutes between 1 and 600
  ),
  constraint content_posts_cook_time_range check (
    cook_time_minutes is null or cook_time_minutes between 1 and 600
  ),
  constraint content_posts_servings_range check (
    servings is null or servings between 1 and 100
  ),
  constraint content_posts_image_url_length check (
    image_url is null or char_length(image_url) <= 500
  ),
  constraint content_posts_seo_title_length check (
    seo_title is null or char_length(seo_title) <= 150
  ),
  constraint content_posts_seo_description_length check (
    seo_description is null or char_length(seo_description) <= 300
  )
);

create index if not exists content_posts_public_visibility_idx
  on public.content_posts (status, published_at desc);

create index if not exists content_posts_category_idx
  on public.content_posts (category_id);

create index if not exists content_posts_created_at_idx
  on public.content_posts (created_at desc);

drop trigger if exists content_posts_set_updated_at on public.content_posts;
create trigger content_posts_set_updated_at
  before update on public.content_posts
  for each row
  execute function public.set_updated_at();

alter table public.content_posts enable row level security;

-- El equipo admin autenticado gestiona posts por completo.
drop policy if exists "Authenticated can read content posts" on public.content_posts;
create policy "Authenticated can read content posts"
  on public.content_posts
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert content posts" on public.content_posts;
create policy "Authenticated can insert content posts"
  on public.content_posts
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update content posts" on public.content_posts;
create policy "Authenticated can update content posts"
  on public.content_posts
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete content posts" on public.content_posts;
create policy "Authenticated can delete content posts"
  on public.content_posts
  for delete
  to authenticated
  using (true);

-- El sitio público solo puede leer posts publicados cuya fecha de
-- publicación ya se cumplió. Nunca puede crear, actualizar ni borrar (no
-- hay comentarios, ratings ni favoritos públicos todavía).
drop policy if exists "Public can read published content posts" on public.content_posts;
create policy "Public can read published content posts"
  on public.content_posts
  for select
  to anon
  using (status = 'published' and published_at is not null and published_at <= now());

insert into public.content_categories (name, slug, sort_order)
values
  ('Recetas fáciles', 'recetas-faciles', 1),
  ('Ahorro de tiempo', 'ahorro-de-tiempo', 2),
  ('Familia', 'familia', 3),
  ('Postres', 'postres', 4),
  ('Demos Thermomix', 'demos-thermomix', 5)
on conflict (slug) do nothing;
