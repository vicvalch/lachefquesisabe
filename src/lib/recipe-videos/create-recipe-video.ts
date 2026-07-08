import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { RecipeVideoInput } from "@/lib/validations/recipe-video";
import { generateUniqueSlug } from "@/lib/content/slug";
import {
  extractYoutubeVideoId,
  youtubeThumbnailUrl,
} from "@/lib/recipe-videos/youtube";

export type CreateRecipeVideoResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };

const UNIQUE_VIOLATION_CODE = "23505";

async function slugExists(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("recipe_videos")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return Boolean(data);
}

/**
 * Crea un video de receta a partir de un link de YouTube. `created_by` sale
 * de la sesión autenticada, nunca del formulario. El video nunca se sube a
 * Supabase: solo se guarda el link/ID de YouTube y sus metadatos. Si no se
 * indica una miniatura, se usa la miniatura pública de YouTube.
 */
export async function createRecipeVideo(
  supabase: SupabaseClient<Database>,
  createdBy: string | null,
  input: RecipeVideoInput,
): Promise<CreateRecipeVideoResult> {
  const youtubeVideoId = extractYoutubeVideoId(input.youtube_url);
  if (!youtubeVideoId) {
    return { ok: false, error: "El link de YouTube no es válido." };
  }

  const slug = await generateUniqueSlug(input.title, (candidate) =>
    slugExists(supabase, candidate),
  );

  const { data, error } = await supabase
    .from("recipe_videos")
    .insert({
      created_by: createdBy,
      title: input.title,
      slug,
      description: input.description || null,
      youtube_url: input.youtube_url,
      youtube_video_id: youtubeVideoId,
      thumbnail_url: input.thumbnail_url || youtubeThumbnailUrl(youtubeVideoId),
      category: input.category,
      difficulty: input.difficulty,
      duration_minutes: input.duration_minutes,
      ingredients: input.ingredients,
      tags: input.tags,
      status: input.status,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    if (error?.code === UNIQUE_VIOLATION_CODE) {
      return {
        ok: false,
        error: "Ya existe un video con ese identificador. Intenta de nuevo.",
      };
    }
    return { ok: false, error: "No se pudo crear el video. Intenta de nuevo." };
  }

  return { ok: true, id: data.id, slug: data.slug };
}
