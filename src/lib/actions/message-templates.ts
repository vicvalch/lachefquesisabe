"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { updateMessageTemplate } from "@/lib/message-templates/update-message-template";
import { createMessageTemplate } from "@/lib/message-templates/create-message-template";
import {
  createMessageTemplateSchema,
  updateMessageTemplateSchema,
} from "@/lib/validations/message-template";

const templateIdSchema = z.string().uuid();

export interface UpdateMessageTemplateState {
  error?: string;
}

export async function updateMessageTemplateAction(
  _prevState: UpdateMessageTemplateState,
  formData: FormData,
): Promise<UpdateMessageTemplateState> {
  const templateIdParsed = templateIdSchema.safeParse(formData.get("templateId"));
  if (!templateIdParsed.success) {
    return { error: "Plantilla inválida." };
  }

  const parsed = updateMessageTemplateSchema.safeParse({
    label: formData.get("label"),
    body: formData.get("body"),
    is_active: formData.get("is_active") === "on",
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

  const result = await updateMessageTemplate(
    supabase,
    templateIdParsed.data,
    parsed.data,
  );

  if (!result.ok) {
    return { error: "No pudimos guardar la plantilla. Intenta de nuevo." };
  }

  revalidatePath("/admin/plantillas");
  revalidatePath(`/admin/plantillas/${templateIdParsed.data}`);
  return {};
}

export interface CreateMessageTemplateState {
  error?: string;
}

export async function createMessageTemplateAction(
  _prevState: CreateMessageTemplateState,
  formData: FormData,
): Promise<CreateMessageTemplateState> {
  const parsed = createMessageTemplateSchema.safeParse({
    key: formData.get("key"),
    label: formData.get("label"),
    body: formData.get("body"),
    is_active: formData.get("is_active") === "on",
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

  const result = await createMessageTemplate(supabase, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/plantillas");
  redirect(`/admin/plantillas/${result.id}`);
}
