"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createOutreachCampaign } from "@/lib/campaigns/create-campaign";
import { materializeCampaignRecipients } from "@/lib/campaigns/materialize-recipients";
import { generateFollowUpTasksForCampaign } from "@/lib/campaigns/generate-tasks";
import { cancelOutreachCampaign } from "@/lib/campaigns/cancel-campaign";
import { createOutreachCampaignSchema } from "@/lib/validations/outreach-campaign";

const campaignIdSchema = z.string().uuid();

function revalidateCampaign(campaignId: string) {
  revalidatePath(`/admin/campanas/${campaignId}`);
  revalidatePath("/admin/campanas");
  revalidatePath("/admin/seguimientos");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/leads");
}

export interface CreateOutreachCampaignState {
  error?: string;
}

export async function createOutreachCampaignAction(
  _prevState: CreateOutreachCampaignState,
  formData: FormData,
): Promise<CreateOutreachCampaignState> {
  const parsed = createOutreachCampaignSchema.safeParse({
    segment_id: formData.get("segment_id"),
    message_template_id: formData.get("message_template_id"),
    name: formData.get("name"),
    description: formData.get("description"),
    task_type: formData.get("task_type"),
    task_priority: formData.get("task_priority"),
    task_title: formData.get("task_title"),
    task_notes: formData.get("task_notes"),
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

  const result = await createOutreachCampaign(supabase, user.id, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/campanas");
  redirect(`/admin/campanas/${result.id}`);
}

export interface MaterializeCampaignRecipientsState {
  error?: string;
  message?: string;
}

/**
 * Paso 1 del flujo manual: solo snapshotea destinatarios, no crea tareas.
 */
export async function materializeCampaignRecipientsAction(
  _prevState: MaterializeCampaignRecipientsState,
  formData: FormData,
): Promise<MaterializeCampaignRecipientsState> {
  const campaignIdParsed = campaignIdSchema.safeParse(formData.get("campaignId"));
  if (!campaignIdParsed.success) {
    return { error: "Campaña inválida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await materializeCampaignRecipients(supabase, campaignIdParsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateCampaign(campaignIdParsed.data);

  if (result.createdCount === 0) {
    return {
      message:
        result.skippedCount > 0
          ? `No hay leads nuevos: los ${result.skippedCount} leads del segmento ya estaban materializados.`
          : "Ningún lead con consentimiento de contacto matchea este segmento todavía.",
    };
  }

  return {
    message: `Se agregaron ${result.createdCount} destinatarios${
      result.skippedCount > 0 ? ` (${result.skippedCount} ya estaban)` : ""
    }.`,
  };
}

export interface GenerateCampaignTasksState {
  error?: string;
  message?: string;
}

/**
 * Paso 2 del flujo manual: crea las follow_up_tasks a partir de los
 * destinatarios ya materializados. Idempotente.
 */
export async function generateCampaignTasksAction(
  _prevState: GenerateCampaignTasksState,
  formData: FormData,
): Promise<GenerateCampaignTasksState> {
  const campaignIdParsed = campaignIdSchema.safeParse(formData.get("campaignId"));
  if (!campaignIdParsed.success) {
    return { error: "Campaña inválida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await generateFollowUpTasksForCampaign(
    supabase,
    campaignIdParsed.data,
    user.id,
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateCampaign(campaignIdParsed.data);

  if (result.createdCount === 0) {
    return {
      message:
        result.skippedCount > 0
          ? `No hay destinatarios nuevos: los ${result.skippedCount} ya tenían su tarea creada.`
          : "Todavía no hay destinatarios materializados para esta campaña.",
    };
  }

  return {
    message: `Se crearon ${result.createdCount} tareas de seguimiento${
      result.skippedCount > 0 ? ` (${result.skippedCount} ya las tenían)` : ""
    }.`,
  };
}

export interface CancelOutreachCampaignState {
  error?: string;
}

export async function cancelOutreachCampaignAction(
  _prevState: CancelOutreachCampaignState,
  formData: FormData,
): Promise<CancelOutreachCampaignState> {
  const campaignIdParsed = campaignIdSchema.safeParse(formData.get("campaignId"));
  if (!campaignIdParsed.success) {
    return { error: "Campaña inválida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await cancelOutreachCampaign(supabase, campaignIdParsed.data);

  if (!result.ok) {
    return { error: "No pudimos cancelar la campaña. Intenta de nuevo." };
  }

  revalidateCampaign(campaignIdParsed.data);
  return {};
}
