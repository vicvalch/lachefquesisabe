import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { LeadSegmentFormInput } from "@/lib/validations/lead-segment";
import { buildLeadSegmentFields } from "@/lib/segments/fields";

export type UpdateLeadSegmentResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateLeadSegment(
  supabase: SupabaseClient<Database>,
  id: string,
  input: LeadSegmentFormInput,
): Promise<UpdateLeadSegmentResult> {
  const { error } = await supabase
    .from("lead_segments")
    .update(buildLeadSegmentFields(input))
    .eq("id", id);

  if (error) {
    return { ok: false, error: "No pudimos guardar el segmento. Intenta de nuevo." };
  }

  return { ok: true };
}
