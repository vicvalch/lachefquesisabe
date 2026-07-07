"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createRecipe } from "@/lib/recipes/create-recipe";
import { updateRecipe } from "@/lib/recipes/update-recipe";
import {
  createRecipeSchema,
  updateRecipeSchema,
} from "@/lib/validations/recipe";

const idSchema = z.string().uuid();

function recipeFieldsFromFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    content_type: formData.get("content_type"),
    summary: formData.get("summary"),
    cover_image_url: formData.get("cover_image_url"),
    prep_minutes: formData.get("prep_minutes"),
    servings: formData.get("servings"),
    ingredients: formData.get("ingredients"),
    content: formData.get("content"),
    cta_message: formData.get("cta_message"),
  };
}

function revalidateRecipes(recipeId?: string) {
  revalidatePath("/admin/recetas");
  revalidatePath("/admin/dashboard");
  revalidatePath("/recetas");
  if (recipeId) {
    revalidatePath(`/admin/recetas/${recipeId}`);
  }
}

export interface CreateRecipeState {
  error?: string;
}

export async function createRecipeAction(
  _prevState: CreateRecipeState,
  formData: FormData,
): Promise<CreateRecipeState> {
  const parsed = createRecipeSchema.safeParse(recipeFieldsFromFormData(formData));

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

  const result = await createRecipe(supabase, user.id, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateRecipes();
  redirect(`/admin/recetas/${result.id}`);
}

export interface UpdateRecipeState {
  error?: string;
}

export async function updateRecipeAction(
  _prevState: UpdateRecipeState,
  formData: FormData,
): Promise<UpdateRecipeState> {
  const recipeIdParsed = idSchema.safeParse(formData.get("recipeId"));
  if (!recipeIdParsed.success) {
    return { error: "Receta inválida." };
  }

  const parsed = updateRecipeSchema.safeParse({
    ...recipeFieldsFromFormData(formData),
    status: formData.get("status"),
  });

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

  const result = await updateRecipe(supabase, recipeIdParsed.data, parsed.data);

  if (!result.ok) {
    return { error: "No pudimos guardar los cambios. Intenta de nuevo." };
  }

  revalidateRecipes(recipeIdParsed.data);
  return {};
}
