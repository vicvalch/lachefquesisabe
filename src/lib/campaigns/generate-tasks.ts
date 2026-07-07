import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getOutreachCampaignById } from "@/lib/campaigns/queries";
import { getMessageTemplateById } from "@/lib/message-templates/queries";

export type GenerateFollowUpTasksForCampaignResult =
  | { ok: true; createdCount: number; skippedCount: number }
  | { ok: false; error: string };

const NON_ADVANCING_STATUSES = new Set(["tasks_created", "completed", "cancelled"]);

/**
 * Paso 2 del flujo manual: crea una follow_up_task (source = 'campaign')
 * por cada destinatario todavía 'selected' de esta campaña. Nunca recibe
 * un lead_id por parámetro ni vuelve a calcular el segmento: los
 * destinatarios ya quedaron fijados en outreach_campaign_recipients por
 * materializeCampaignRecipients (paso 1) — esta función solo lee esa
 * tabla. No envía mensajes ni crea contact_logs.
 *
 * Idempotente: filtra por status = 'selected' AND follow_up_task_id is
 * null, así que un recipient que ya tiene tarea (status 'task_created')
 * nunca se vuelve a tocar ni genera una tarea duplicada.
 */
export async function generateFollowUpTasksForCampaign(
  supabase: SupabaseClient<Database>,
  campaignId: string,
  createdBy: string | null,
): Promise<GenerateFollowUpTasksForCampaignResult> {
  const campaign = await getOutreachCampaignById(supabase, campaignId);
  if (!campaign) {
    return { ok: false, error: "No se encontró la campaña." };
  }

  const messageTemplate = campaign.message_template_id
    ? await getMessageTemplateById(supabase, campaign.message_template_id)
    : null;

  const { data: selectedRecipients, error: recipientsError } = await supabase
    .from("outreach_campaign_recipients")
    .select("id, lead_id")
    .eq("campaign_id", campaignId)
    .eq("status", "selected")
    .is("follow_up_task_id", null);

  if (recipientsError) {
    return { ok: false, error: "No pudimos revisar los destinatarios de la campaña. Intenta de nuevo." };
  }

  const { count: alreadyCreatedCount, error: countError } = await supabase
    .from("outreach_campaign_recipients")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .eq("status", "task_created");

  if (countError) {
    return { ok: false, error: "No pudimos contar las tareas ya creadas. Intenta de nuevo." };
  }

  const recipients = selectedRecipients ?? [];
  const skippedCount = alreadyCreatedCount ?? 0;

  if (recipients.length === 0) {
    return { ok: true, createdCount: 0, skippedCount };
  }

  const taskTitle = campaign.task_title || `Contactar: ${campaign.name}`;
  const dueAt = campaign.due_at ?? new Date().toISOString();

  const { data: insertedTasks, error: tasksError } = await supabase
    .from("follow_up_tasks")
    .insert(
      recipients.map((recipient) => ({
        lead_id: recipient.lead_id,
        campaign_id: campaignId,
        title: taskTitle,
        message_template_key: messageTemplate?.key ?? null,
        due_at: dueAt,
        source: "campaign" as const,
        notes: campaign.task_notes,
        created_by: createdBy,
      })),
    )
    .select("id, lead_id");

  if (tasksError || !insertedTasks) {
    return { ok: false, error: "No se pudieron crear las tareas de seguimiento. Intenta de nuevo." };
  }

  const taskIdByLeadId = new Map(insertedTasks.map((task) => [task.lead_id, task.id]));

  const updateResults = await Promise.all(
    recipients.map((recipient) => {
      const taskId = taskIdByLeadId.get(recipient.lead_id);
      if (!taskId) {
        return Promise.resolve({ error: null });
      }
      return supabase
        .from("outreach_campaign_recipients")
        .update({ status: "task_created", follow_up_task_id: taskId })
        .eq("id", recipient.id);
    }),
  );

  const updateError = updateResults.find((result) => result.error)?.error;
  if (updateError) {
    return { ok: false, error: "No pudimos actualizar los destinatarios con su tarea. Intenta de nuevo." };
  }

  if (!NON_ADVANCING_STATUSES.has(campaign.status)) {
    const { error: statusError } = await supabase
      .from("outreach_campaigns")
      .update({ status: "tasks_created" })
      .eq("id", campaignId);

    if (statusError) {
      return { ok: false, error: "No pudimos actualizar el estado de la campaña. Intenta de nuevo." };
    }
  }

  return {
    ok: true,
    createdCount: insertedTasks.length,
    skippedCount,
  };
}
