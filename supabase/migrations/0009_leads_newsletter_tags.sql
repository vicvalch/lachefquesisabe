-- PR: suscripción de recetas/newsletter. Reutiliza la tabla leads existente
-- (no se crea una tabla aparte): se agrega una columna tags para poder
-- distinguir, sin romper nada existente, los leads que vienen del formulario
-- de suscripción a recetas ("recipes", "newsletter") del resto de leads.
-- Default '{}' no rompe ninguna fila ni insert existente.

alter table public.leads
  add column if not exists tags text[] not null default '{}';

create index if not exists leads_tags_idx on public.leads using gin (tags);
