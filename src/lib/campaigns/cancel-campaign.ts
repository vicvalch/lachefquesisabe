import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type CancelOutreachCampaignResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Marca la campaña como cancelada: ya no aplica, sin importar en qué paso
 * del flujo estaba (draft/ready/tasks_created). No toca los recipients ni
 * las follow_up_tasks ya generadas — su historial se conserva tal cual.
 */
export async function cancelOutreachCampaign(
  supabase: SupabaseClient<Database>,
  campaignId: string,
): Promise<CancelOutreachCampaignResult> {
  const { error } = await supabase
    .from("outreach_campaigns")
    .update({ status: "cancelled" })
    .eq("id", campaignId);

  if (error) {
    return { ok: false, error: "No pudimos cancelar la campaña. Intenta de nuevo." };
  }

  return { ok: true };
}
