import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getOutreachCampaignById } from "@/lib/campaigns/queries";
import { getLeadSegmentById, listLeadsMatchingSegment } from "@/lib/segments/queries";

export type GenerateCampaignTasksResult =
  | { ok: true; createdCount: number; skippedCount: number }
  | { ok: false; error: string };

/**
 * Genera una follow_up_task (source = 'campaign') por cada lead del
 * segmento de la campaña que todavía no la tenga. Idempotente: los leads
 * ya registrados en outreach_campaign_recipients se saltan, así que
 * volver a correrlo solo alcanza a los leads que entraron al segmento
 * después de la última vez.
 */
export async function generateCampaignTasks(
  supabase: SupabaseClient<Database>,
  campaignId: string,
  dueAt: string,
  createdBy: string | null,
): Promise<GenerateCampaignTasksResult> {
  const campaign = await getOutreachCampaignById(supabase, campaignId);
  if (!campaign) {
    return { ok: false, error: "No se encontró la campaña." };
  }

  const segment = await getLeadSegmentById(supabase, campaign.segment_id);
  if (!segment) {
    return { ok: false, error: "No se encontró el segmento de esta campaña." };
  }

  const matchingLeads = await listLeadsMatchingSegment(supabase, segment);

  const { data: existingRecipients, error: recipientsError } = await supabase
    .from("outreach_campaign_recipients")
    .select("lead_id")
    .eq("campaign_id", campaignId);

  if (recipientsError) {
    return { ok: false, error: recipientsError.message };
  }

  const existingLeadIds = new Set(
    (existingRecipients ?? []).map((recipient) => recipient.lead_id),
  );
  const newLeads = matchingLeads.filter((lead) => !existingLeadIds.has(lead.id));

  if (newLeads.length === 0) {
    return { ok: true, createdCount: 0, skippedCount: matchingLeads.length };
  }

  const { data: insertedTasks, error: tasksError } = await supabase
    .from("follow_up_tasks")
    .insert(
      newLeads.map((lead) => ({
        lead_id: lead.id,
        campaign_id: campaignId,
        title: `Campaña: ${campaign.name}`,
        message_template_key: campaign.message_template_key,
        due_at: dueAt,
        source: "campaign" as const,
        created_by: createdBy,
      })),
    )
    .select("id, lead_id");

  if (tasksError || !insertedTasks) {
    return {
      ok: false,
      error: tasksError?.message ?? "No se pudieron crear las tareas.",
    };
  }

  const { error: recipientsInsertError } = await supabase
    .from("outreach_campaign_recipients")
    .insert(
      insertedTasks.map((task) => ({
        campaign_id: campaignId,
        lead_id: task.lead_id,
        follow_up_task_id: task.id,
      })),
    );

  if (recipientsInsertError) {
    return { ok: false, error: recipientsInsertError.message };
  }

  return {
    ok: true,
    createdCount: insertedTasks.length,
    skippedCount: matchingLeads.length - insertedTasks.length,
  };
}
