import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RecipeRow, RecipeStatus } from "@/types/database";
import { PUBLIC_RECIPE_STATUSES } from "@/lib/validations/recipe";

export async function listRecipesAdmin(
  supabase: SupabaseClient<Database>,
  limit = 100,
): Promise<RecipeRow[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getRecipeById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<RecipeRow | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Recetas/tips visibles para el sitio público: status "published". Se
 * apoya en RLS (la policy pública ya filtra exactamente por esto) y repite
 * el filtro en la query para que el orden y el límite tengan sentido
 * incluso si RLS cambiara.
 */
export async function listPublicRecipes(
  supabase: SupabaseClient<Database>,
  limit = 20,
): Promise<RecipeRow[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .in("status", PUBLIC_RECIPE_STATUSES)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getPublicRecipeBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<RecipeRow | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("slug", slug)
    .in("status", PUBLIC_RECIPE_STATUSES)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Otras recetas/tips publicados para el bloque "Seguir aprendiendo" al
 * final de una receta, excluyendo la que se está mostrando.
 */
export async function listOtherPublicRecipes(
  supabase: SupabaseClient<Database>,
  excludeId: string,
  limit = 3,
): Promise<RecipeRow[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .in("status", PUBLIC_RECIPE_STATUSES)
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export interface RecipeStats {
  total: number;
  published: number;
  draft: number;
}

export async function getRecipeStats(
  supabase: SupabaseClient<Database>,
): Promise<RecipeStats> {
  const { data, error } = await supabase.from("recipes").select("status");

  if (error || !data) {
    return { total: 0, published: 0, draft: 0 };
  }

  const stats = { total: 0, published: 0, draft: 0 };
  for (const row of data as { status: RecipeStatus }[]) {
    stats.total += 1;
    if (row.status === "published") {
      stats.published += 1;
    } else {
      stats.draft += 1;
    }
  }

  return stats;
}
