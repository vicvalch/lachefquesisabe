import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateRecipeInput } from "@/lib/validations/recipe";
import { generateRecipeSlug } from "@/lib/recipes/slug";

export type CreateRecipeResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };

const UNIQUE_VIOLATION_CODE = "23505";

/**
 * Crea una receta/tip en borrador. created_by sale de la sesión
 * autenticada, nunca del formulario. El slug se genera en el servidor a
 * partir del título; el sufijo aleatorio hace la colisión extremadamente
 * improbable, pero igual se maneja por si acaso. Se publica después desde
 * el formulario de edición (updateRecipe), nunca al crearla.
 */
export async function createRecipe(
  supabase: SupabaseClient<Database>,
  createdBy: string | null,
  input: CreateRecipeInput,
): Promise<CreateRecipeResult> {
  const { data, error } = await supabase
    .from("recipes")
    .insert({
      created_by: createdBy,
      title: input.title,
      slug: generateRecipeSlug(input.title),
      content_type: input.content_type,
      status: "draft",
      summary: input.summary || null,
      cover_image_url: input.cover_image_url || null,
      prep_minutes: input.prep_minutes,
      servings: input.servings,
      ingredients: input.ingredients || null,
      content: input.content,
      cta_message: input.cta_message || null,
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    if (error?.code === UNIQUE_VIOLATION_CODE) {
      return {
        ok: false,
        error: "Ya existe una receta con ese identificador. Intenta de nuevo.",
      };
    }
    return {
      ok: false,
      error: error?.message ?? "No se pudo crear la receta.",
    };
  }

  return { ok: true, id: data.id, slug: data.slug };
}
