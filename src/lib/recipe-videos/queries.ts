import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RecipeVideoRow } from "@/types/database";
import { PUBLIC_RECIPE_VIDEO_STATUSES } from "@/lib/validations/recipe-video";

export async function listRecipeVideosAdmin(
  supabase: SupabaseClient<Database>,
  limit = 100,
): Promise<RecipeVideoRow[]> {
  const { data, error } = await supabase
    .from("recipe_videos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export interface ListPublicRecipeVideosFilters {
  category?: string;
  limit?: number;
}

/**
 * Videos visibles para el sitio público: status "published" con
 * published_at ya cumplido. Se apoya en RLS (la policy pública ya filtra
 * exactamente por esto) y repite el filtro en la query para que el orden y
 * el límite tengan sentido incluso si RLS cambiara.
 */
export async function listPublicRecipeVideos(
  supabase: SupabaseClient<Database>,
  filters: ListPublicRecipeVideosFilters = {},
): Promise<RecipeVideoRow[]> {
  const { category, limit = 6 } = filters;
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("recipe_videos")
    .select("*")
    .in("status", PUBLIC_RECIPE_VIDEO_STATUSES)
    .not("published_at", "is", null)
    .lte("published_at", nowIso)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getRecipeVideoStats(
  supabase: SupabaseClient<Database>,
): Promise<{ total: number; published: number }> {
  const { data, error } = await supabase.from("recipe_videos").select("status");

  if (error || !data) {
    return { total: 0, published: 0 };
  }

  return {
    total: data.length,
    published: data.filter((row) => row.status === "published").length,
  };
}
