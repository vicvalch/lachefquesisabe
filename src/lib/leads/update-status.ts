import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, LeadStatus } from "@/types/database";

export type UpdateLeadStatusResult = { ok: true } | { ok: false; error: string };

export async function updateLeadStatus(
  supabase: SupabaseClient<Database>,
  leadId: string,
  status: LeadStatus,
): Promise<UpdateLeadStatusResult> {
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
