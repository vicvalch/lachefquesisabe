import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentCategoryRow, Database } from "@/types/database";

/**
 * Lista categorías ordenadas para mostrar en selectores y filtros. La RLS
 * ya decide qué filas ve cada rol: el equipo autenticado ve todas, `anon`
 * solo las activas (`is_active = true`) — esta función no necesita
 * duplicar ese filtro.
 */
export async function listCategories(
  supabase: SupabaseClient<Database>,
): Promise<ContentCategoryRow[]> {
  const { data, error } = await supabase
    .from("content_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getCategoryBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<ContentCategoryRow | null> {
  const { data, error } = await supabase
    .from("content_categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getCategoryById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ContentCategoryRow | null> {
  const { data, error } = await supabase
    .from("content_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
