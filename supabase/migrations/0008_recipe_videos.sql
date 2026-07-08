-- PR: recipe_videos — recetas en video (YouTube) para el sitio público y el
-- admin. Solo se guardan metadatos y el link/ID de YouTube; el video en sí
-- nunca se sube a Supabase. Sigue el mismo patrón de content_posts
-- (0005_content_hub.sql): equipo autenticado con CRUD completo, sitio
-- público solo lee lo publicado. Este proyecto no tiene funciones
-- is_admin()/can_manage_admin(): "equipo admin" == cualquier usuario
-- autenticado, igual que en el resto de las tablas.

create table if not exists public.recipe_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  youtube_url text not null,
  youtube_video_id text,
  thumbnail_url text,
  category text not null default 'recetas',
  difficulty text check (difficulty in ('facil', 'media', 'avanzada')),
  duration_minutes integer,
  ingredients text[],
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipe_videos_title_length check (char_length(title) between 2 and 150),
  constraint recipe_videos_slug_length check (char_length(slug) between 2 and 180),
  constraint recipe_videos_description_length check (
    description is null or char_length(description) <= 500
  ),
  constraint recipe_videos_youtube_url_length check (char_length(youtube_url) <= 500),
  constraint recipe_videos_duration_range check (
    duration_minutes is null or duration_minutes between 1 and 600
  )
);

create index if not exists recipe_videos_status_published_at_idx
  on public.recipe_videos (status, published_at desc);

create index if not exists recipe_videos_category_idx
  on public.recipe_videos (category);

create index if not exists recipe_videos_tags_idx
  on public.recipe_videos using gin (tags);

-- Reutiliza la función public.set_updated_at() creada en 0003_demo_events.sql.
drop trigger if exists recipe_videos_set_updated_at on public.recipe_videos;
create trigger recipe_videos_set_updated_at
  before update on public.recipe_videos
  for each row
  execute function public.set_updated_at();

alter table public.recipe_videos enable row level security;

-- El equipo admin autenticado gestiona los videos por completo.
drop policy if exists "Authenticated can read recipe videos" on public.recipe_videos;
create policy "Authenticated can read recipe videos"
  on public.recipe_videos
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert recipe videos" on public.recipe_videos;
create policy "Authenticated can insert recipe videos"
  on public.recipe_videos
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update recipe videos" on public.recipe_videos;
create policy "Authenticated can update recipe videos"
  on public.recipe_videos
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete recipe videos" on public.recipe_videos;
create policy "Authenticated can delete recipe videos"
  on public.recipe_videos
  for delete
  to authenticated
  using (true);

-- El sitio público solo puede leer videos publicados cuya fecha de
-- publicación ya se cumplió. Nunca puede crear, actualizar ni borrar.
drop policy if exists "Public can read published recipe videos" on public.recipe_videos;
create policy "Public can read published recipe videos"
  on public.recipe_videos
  for select
  to anon
  using (status = 'published' and published_at is not null and published_at <= now());
