"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createContentPost } from "@/lib/content/create-content-post";
import { updateContentPost } from "@/lib/content/update-content-post";
import { contentPostSchema } from "@/lib/validations/content-post";

const idSchema = z.string().uuid();

function contentPostFieldsFromFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    content_type: formData.get("content_type"),
    status: formData.get("status"),
    category_id: formData.get("category_id"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    ingredients: formData.get("ingredients"),
    instructions: formData.get("instructions"),
    prep_time_minutes: formData.get("prep_time_minutes"),
    cook_time_minutes: formData.get("cook_time_minutes"),
    servings: formData.get("servings"),
    difficulty: formData.get("difficulty"),
    image_url: formData.get("image_url"),
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
    featured: formData.get("featured"),
  };
}

function revalidateContent(postId?: string) {
  revalidatePath("/admin/content");
  revalidatePath("/admin/dashboard");
  revalidatePath("/recetas");
  if (postId) {
    revalidatePath(`/admin/content/${postId}`);
  }
}

export interface CreateContentPostState {
  error?: string;
}

export async function createContentPostAction(
  _prevState: CreateContentPostState,
  formData: FormData,
): Promise<CreateContentPostState> {
  const parsed = contentPostSchema.safeParse(
    contentPostFieldsFromFormData(formData),
  );

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

  const result = await createContentPost(supabase, user.id, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateContent();
  redirect(`/admin/content/${result.id}`);
}

export interface UpdateContentPostState {
  error?: string;
}

export async function updateContentPostAction(
  _prevState: UpdateContentPostState,
  formData: FormData,
): Promise<UpdateContentPostState> {
  const postIdParsed = idSchema.safeParse(formData.get("postId"));
  if (!postIdParsed.success) {
    return { error: "Contenido inválido." };
  }

  const parsed = contentPostSchema.safeParse(
    contentPostFieldsFromFormData(formData),
  );

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

  const result = await updateContentPost(supabase, postIdParsed.data, parsed.data);

  if (!result.ok) {
    return { error: "No pudimos guardar los cambios. Intenta de nuevo." };
  }

  revalidateContent(postIdParsed.data);
  return {};
}
