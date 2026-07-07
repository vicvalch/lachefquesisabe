import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ContentPostInput } from "@/lib/validations/content-post";
import { generateUniqueSlug } from "@/lib/content/slug";

export type CreateContentPostResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };

const UNIQUE_VIOLATION_CODE = "23505";

async function slugExists(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("content_posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return Boolean(data);
}

/**
 * Crea un post de contenido (receta, tip o guía). `created_by` sale de la
 * sesión autenticada, nunca del formulario. El slug se genera en el
 * servidor a partir del título, con un sufijo numérico (-2, -3, ...) si ya
 * existe uno igual. Si se crea directamente en estado "published" y no
 * viene `published_at`, se fija a la hora actual.
 */
export async function createContentPost(
  supabase: SupabaseClient<Database>,
  createdBy: string | null,
  input: ContentPostInput,
): Promise<CreateContentPostResult> {
  const slug = await generateUniqueSlug(input.title, (candidate) =>
    slugExists(supabase, candidate),
  );

  const { data, error } = await supabase
    .from("content_posts")
    .insert({
      created_by: createdBy,
      category_id: input.category_id,
      title: input.title,
      slug,
      content_type: input.content_type,
      status: input.status,
      published_at: input.status === "published" ? new Date().toISOString() : null,
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
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    if (error?.code === UNIQUE_VIOLATION_CODE) {
      return {
        ok: false,
        error: "Ya existe contenido con ese identificador. Intenta de nuevo.",
      };
    }
    return {
      ok: false,
      error: error?.message ?? "No se pudo crear el contenido.",
    };
  }

  return { ok: true, id: data.id, slug: data.slug };
}
