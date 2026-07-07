import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getOutreachCampaignById } from "@/lib/campaigns/queries";
import { getLeadSegmentById, listLeadsMatchingCriteria } from "@/lib/segments/queries";

export type MaterializeCampaignRecipientsResult =
  | { ok: true; createdCount: number; skippedCount: number }
  | { ok: false; error: string };

const MATERIALIZE_FETCH_LIMIT = 5000;

/**
 * Paso 1 del flujo manual: snapshotea qué leads matchean el segmento de la
 * campaña ahora mismo, como outreach_campaign_recipients (status =
 * 'selected'). No crea ninguna follow_up_task todavía, no envía mensajes
 * ni crea contact_logs — eso es el paso 2 (generateFollowUpTasksForCampaign).
 *
 * Solo incluye leads con consent_contact = true, sin importar el criterio
 * del segmento: protección fija que no se puede desactivar desde acá.
 *
 * Idempotente: los leads ya materializados (con cualquier status) se
 * saltan (constraint unique (campaign_id, lead_id)), así que correrlo de
 * nuevo más adelante solo agrega los que entraron al segmento después.
 */
export async function materializeCampaignRecipients(
  supabase: SupabaseClient<Database>,
  campaignId: string,
): Promise<MaterializeCampaignRecipientsResult> {
  const campaign = await getOutreachCampaignById(supabase, campaignId);
  if (!campaign) {
    return { ok: false, error: "No se encontró la campaña." };
  }

  const segment = await getLeadSegmentById(supabase, campaign.segment_id);
  if (!segment) {
    return { ok: false, error: "No se encontró el segmento de esta campaña." };
  }

  const matchingLeads = await listLeadsMatchingCriteria(
    supabase,
    segment.criteria,
    MATERIALIZE_FETCH_LIMIT,
  );
  const consentedLeads = matchingLeads.filter((lead) => lead.consent_contact === true);

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
  const newLeads = consentedLeads.filter((lead) => !existingLeadIds.has(lead.id));

  if (newLeads.length > 0) {
    const { error: insertError } = await supabase.from("outreach_campaign_recipients").insert(
      newLeads.map((lead) => ({
        campaign_id: campaignId,
        lead_id: lead.id,
        status: "selected" as const,
      })),
    );

    if (insertError) {
      return { ok: false, error: insertError.message };
    }
  }

  const totalRecipients = existingLeadIds.size + newLeads.length;
  if (totalRecipients > 0 && campaign.status === "draft") {
    const { error: statusError } = await supabase
      .from("outreach_campaigns")
      .update({ status: "ready" })
      .eq("id", campaignId);

    if (statusError) {
      return { ok: false, error: statusError.message };
    }
  }

  return {
    ok: true,
    createdCount: newLeads.length,
    skippedCount: consentedLeads.length - newLeads.length,
  };
}
