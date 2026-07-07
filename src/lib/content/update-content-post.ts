import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ContentPostInput } from "@/lib/validations/content-post";

export type UpdateContentPostResult = { ok: true } | { ok: false; error: string };

/**
 * Actualiza los campos editables de un post de contenido, incluido su
 * estado (publicar/despublicar/archivar). `created_by` y `created_at`
 * nunca se aceptan aquí: el allowlist explícito solo incluye los campos
 * de este formulario.
 *
 * `published_at`:
 * - pasa a "published" y no tenía fecha: se fija a la hora actual.
 * - pasa a "draft": se limpia (vuelve a null), como si nunca se hubiera
 *   publicado.
 * - pasa a "archived": no se toca, para conservar cuándo se publicó por
 *   última vez.
 */
export async function updateContentPost(
  supabase: SupabaseClient<Database>,
  postId: string,
  input: ContentPostInput,
): Promise<UpdateContentPostResult> {
  const update: Database["public"]["Tables"]["content_posts"]["Update"] = {
    category_id: input.category_id,
    title: input.title,
    content_type: input.content_type,
    status: input.status,
    excerpt: input.excerpt || null,
    body: input.body,
    ingredients: input.ingredients || null,
    instructions: input.instructions || null,
    prep_time_minutes: input.prep_time_minutes,
    cook_time_minutes: input.cook_time_minutes,
    servings: input.servings,
    difficulty: input.difficulty,
    image_url: input.image_url || null,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
    featured: input.featured,
  };

  if (input.status === "draft") {
    update.published_at = null;
  } else if (input.status === "published") {
    const { data: current, error: currentError } = await supabase
      .from("content_posts")
      .select("published_at")
      .eq("id", postId)
      .maybeSingle();

    if (currentError) {
      return { ok: false, error: "No pudimos guardar los cambios. Intenta de nuevo." };
    }

    if (!current?.published_at) {
      update.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("content_posts")
    .update(update)
    .eq("id", postId);

  if (error) {
    return { ok: false, error: "No pudimos guardar los cambios. Intenta de nuevo." };
  }

  return { ok: true };
}
