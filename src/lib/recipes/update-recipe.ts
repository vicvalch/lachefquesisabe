import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { UpdateRecipeInput } from "@/lib/validations/recipe";

export type UpdateRecipeResult = { ok: true } | { ok: false; error: string };

/**
 * Actualiza los campos editables de una receta/tip, incluido su estado
 * (publicar/despublicar). `published_at` solo se fija la primera vez que
 * pasa a "published" (para conservar la fecha original de publicación);
 * despublicarla no la borra, así que si se vuelve a publicar mantiene su
 * lugar en el orden cronológico.
 */
export async function updateRecipe(
  supabase: SupabaseClient<Database>,
  recipeId: string,
  input: UpdateRecipeInput,
): Promise<UpdateRecipeResult> {
  const update: Database["public"]["Tables"]["recipes"]["Update"] = {
    title: input.title,
    content_type: input.content_type,
    status: input.status,
    summary: input.summary || null,
    cover_image_url: input.cover_image_url || null,
    prep_minutes: input.prep_minutes,
    servings: input.servings,
    ingredients: input.ingredients || null,
    content: input.content,
    cta_message: input.cta_message || null,
  };

  if (input.status === "published") {
    const { data: current, error: currentError } = await supabase
      .from("recipes")
      .select("published_at")
      .eq("id", recipeId)
      .maybeSingle();

    if (currentError) {
      return { ok: false, error: currentError.message };
    }

    if (!current?.published_at) {
      update.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("recipes")
    .update(update)
    .eq("id", recipeId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
