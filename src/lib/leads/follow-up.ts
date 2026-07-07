import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type ClearFollowUpResult = { ok: true } | { ok: false; error: string };

/**
 * Marca una tarea de seguimiento como completada: limpia
 * leads.next_follow_up_at para que el lead salga del Centro de
 * Seguimientos sin necesidad de registrar un contact_log (por ejemplo,
 * cuando ya se resolvió por otro medio o ya no aplica).
 */
export async function clearFollowUp(
  supabase: SupabaseClient<Database>,
  leadId: string,
): Promise<ClearFollowUpResult> {
  const { error } = await supabase
    .from("leads")
    .update({ next_follow_up_at: null })
    .eq("id", leadId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
