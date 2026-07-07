import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { LeadSegmentFormInput } from "@/lib/validations/lead-segment";
import { buildLeadSegmentFields } from "@/lib/segments/fields";

export type CreateLeadSegmentResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createLeadSegment(
  supabase: SupabaseClient<Database>,
  createdBy: string | null,
  input: LeadSegmentFormInput,
): Promise<CreateLeadSegmentResult> {
  const { data, error } = await supabase
    .from("lead_segments")
    .insert({ created_by: createdBy, ...buildLeadSegmentFields(input) })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "No se pudo crear el segmento.",
    };
  }

  return { ok: true, id: data.id };
}
