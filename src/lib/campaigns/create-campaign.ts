import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateOutreachCampaignInput } from "@/lib/validations/outreach-campaign";
import { generateCampaignSlug } from "@/lib/campaigns/slug";

export type CreateOutreachCampaignResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const UNIQUE_VIOLATION_CODE = "23505";

/**
 * Crea una campaña en status 'draft': todavía no tiene destinatarios ni
 * tareas (eso son los pasos 1 y 2, ver materializeCampaignRecipients y
 * generateFollowUpTasksForCampaign). El slug se genera en el servidor a
 * partir del nombre.
 */
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
      message_template_id: input.message_template_id,
      name: input.name,
      slug: generateCampaignSlug(input.name),
      description: input.description || null,
      status: "draft",
      task_type: input.task_type,
      task_priority: input.task_priority,
      task_title: input.task_title || null,
      task_notes: input.task_notes || null,
      due_at: input.due_at || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === UNIQUE_VIOLATION_CODE) {
      return {
        ok: false,
        error: "Ya existe una campaña con ese identificador. Intenta de nuevo.",
      };
    }
    return { ok: false, error: "No se pudo crear la campaña. Intenta de nuevo." };
  }

  return { ok: true, id: data.id };
}
