import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ContentPostRow,
  ContentStatus,
  ContentType,
  Database,
} from "@/types/database";
import { PUBLIC_CONTENT_STATUSES } from "@/lib/validations/content-post";
import { getCategoryBySlug } from "@/lib/content/categories";

export async function listContentPostsAdmin(
  supabase: SupabaseClient<Database>,
  limit = 100,
): Promise<ContentPostRow[]> {
  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function listRecentContentPosts(
  supabase: SupabaseClient<Database>,
  limit = 5,
): Promise<ContentPostRow[]> {
  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getContentPostById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ContentPostRow | null> {
  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export interface ListPublicContentPostsFilters {
  type?: ContentType;
  categorySlug?: string;
  limit?: number;
}

/**
 * Posts visibles para el sitio público: status "published" con
 * published_at ya cumplido. Se apoya en RLS (la policy pública ya filtra
 * exactamente por esto) y repite el filtro en la query para que el orden
 * y el límite tengan sentido incluso si RLS cambiara. Soporta filtros
 * simples por tipo de contenido y por categoría (vía su slug).
 */
export async function listPublicContentPosts(
  supabase: SupabaseClient<Database>,
  filters: ListPublicContentPostsFilters = {},
): Promise<ContentPostRow[]> {
  const { type, categorySlug, limit = 20 } = filters;
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("content_posts")
    .select("*")
    .in("status", PUBLIC_CONTENT_STATUSES)
    .not("published_at", "is", null)
    .lte("published_at", nowIso)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type) {
    query = query.eq("content_type", type);
  }

  if (categorySlug) {
    const category = await getCategoryBySlug(supabase, categorySlug);
    if (!category) {
      return [];
    }
    query = query.eq("category_id", category.id);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getPublicContentPostBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<ContentPostRow | null> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("slug", slug)
    .in("status", PUBLIC_CONTENT_STATUSES)
    .not("published_at", "is", null)
    .lte("published_at", nowIso)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Otros posts publicados para el bloque "Seguir aprendiendo" al final de
 * un post, excluyendo el que se está mostrando.
 */
export async function listOtherPublicContentPosts(
  supabase: SupabaseClient<Database>,
  excludeId: string,
  limit = 3,
): Promise<ContentPostRow[]> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .in("status", PUBLIC_CONTENT_STATUSES)
    .not("published_at", "is", null)
    .lte("published_at", nowIso)
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export interface ContentStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export async function getContentStats(
  supabase: SupabaseClient<Database>,
): Promise<ContentStats> {
  const { data, error } = await supabase.from("content_posts").select("status");

  if (error || !data) {
    return { total: 0, published: 0, draft: 0, archived: 0 };
  }

  const stats = { total: 0, published: 0, draft: 0, archived: 0 };
  for (const row of data as { status: ContentStatus }[]) {
    stats.total += 1;
    if (row.status === "published") {
      stats.published += 1;
    } else if (row.status === "archived") {
      stats.archived += 1;
    } else {
      stats.draft += 1;
    }
  }

  return stats;
}
