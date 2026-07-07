"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createOutreachCampaign } from "@/lib/campaigns/create-campaign";
import { generateCampaignTasks } from "@/lib/campaigns/generate-tasks";
import {
  createOutreachCampaignSchema,
  generateCampaignTasksSchema,
} from "@/lib/validations/outreach-campaign";

const campaignIdSchema = z.string().uuid();

export interface CreateOutreachCampaignState {
  error?: string;
}

export async function createOutreachCampaignAction(
  _prevState: CreateOutreachCampaignState,
  formData: FormData,
): Promise<CreateOutreachCampaignState> {
  const parsed = createOutreachCampaignSchema.safeParse({
    segment_id: formData.get("segment_id"),
    message_template_key: formData.get("message_template_key"),
    name: formData.get("name"),
    notes: formData.get("notes"),
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

  const result = await createOutreachCampaign(supabase, user.id, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/campanas");
  redirect(`/admin/campanas/${result.id}`);
}

export interface GenerateCampaignTasksState {
  error?: string;
  message?: string;
}

/**
 * Idempotente: puede llamarse varias veces sobre la misma campaña. Solo
 * genera tareas para los leads del segmento que todavía no las tengan (ver
 * generateCampaignTasks), así que correrlo de nuevo más adelante alcanza a
 * los leads que entraron al segmento después.
 */
export async function generateCampaignTasksAction(
  _prevState: GenerateCampaignTasksState,
  formData: FormData,
): Promise<GenerateCampaignTasksState> {
  const campaignIdParsed = campaignIdSchema.safeParse(formData.get("campaignId"));
  if (!campaignIdParsed.success) {
    return { error: "Campaña inválida." };
  }

  const parsed = generateCampaignTasksSchema.safeParse({
    due_at: formData.get("due_at"),
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

  const result = await generateCampaignTasks(
    supabase,
    campaignIdParsed.data,
    parsed.data.due_at,
    user.id,
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(`/admin/campanas/${campaignIdParsed.data}`);
  revalidatePath("/admin/campanas");
  revalidatePath("/admin/seguimientos");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/leads");

  if (result.createdCount === 0) {
    return {
      message:
        result.skippedCount > 0
          ? `No hay leads nuevos: los ${result.skippedCount} leads del segmento ya tenían una tarea de esta campaña.`
          : "Ningún lead del segmento coincide con estos filtros todavía.",
    };
  }

  return {
    message: `Se crearon ${result.createdCount} tareas de seguimiento${
      result.skippedCount > 0
        ? ` (${result.skippedCount} leads ya las tenían)`
        : ""
    }.`,
  };
}
