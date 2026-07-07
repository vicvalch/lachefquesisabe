import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateOutreachCampaignInput } from "@/lib/validations/outreach-campaign";

export type CreateOutreachCampaignResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createOutreachCampaign(
  supabase: SupabaseClient<Database>,
  createdBy: string | null,
  input: CreateOutreachCampaignInput,
): Promise<CreateOutreachCampaignResult> {
  const { data, error } = await supabase
    .from("outreach_campaigns")
    .insert({
      created_by: createdBy,
      segment_id: input.segment_id,
      message_template_key: input.message_template_key,
      name: input.name,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "No se pudo crear la campaña.",
    };
  }

  return { ok: true, id: data.id };
}
