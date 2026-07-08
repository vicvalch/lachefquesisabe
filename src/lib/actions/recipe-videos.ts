"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createRecipeVideo } from "@/lib/recipe-videos/create-recipe-video";
import { recipeVideoSchema } from "@/lib/validations/recipe-video";

function recipeVideoFieldsFromFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    youtube_url: formData.get("youtube_url"),
    thumbnail_url: formData.get("thumbnail_url"),
    category: formData.get("category"),
    difficulty: formData.get("difficulty"),
    duration_minutes: formData.get("duration_minutes"),
    ingredients: formData.get("ingredients"),
    tags: formData.get("tags"),
    status: formData.get("status"),
  };
}

export interface CreateRecipeVideoState {
  error?: string;
}

export async function createRecipeVideoAction(
  _prevState: CreateRecipeVideoState,
  formData: FormData,
): Promise<CreateRecipeVideoState> {
  const parsed = recipeVideoSchema.safeParse(recipeVideoFieldsFromFormData(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await createRecipeVideo(supabase, user.id, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/videos");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  redirect("/admin/videos");
}
