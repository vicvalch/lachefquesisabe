import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, LeadUpdate } from "@/types/database";
import type { AddContactLogInput } from "@/lib/validations/contact-log";

export type AddContactLogResult = { ok: true } | { ok: false; error: string };

/**
 * Registra un contacto realizado con un lead y, en el mismo flujo,
 * actualiza leads.last_contacted_at y (si vino) leads.next_follow_up_at,
 * para que la lista de seguimientos pendientes quede al día.
 */
export async function addContactLog(
  supabase: SupabaseClient<Database>,
  leadId: string,
  createdBy: string | null,
  input: AddContactLogInput,
): Promise<AddContactLogResult> {
  const { error: insertError } = await supabase.from("contact_logs").insert({
    lead_id: leadId,
    created_by: createdBy,
    channel: input.channel,
    direction: input.direction,
    summary: input.summary,
    outcome: input.outcome || null,
    next_follow_up_at: input.next_follow_up_at || null,
  });

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  const leadUpdate: LeadUpdate = { last_contacted_at: new Date().toISOString() };
  if (input.next_follow_up_at) {
    leadUpdate.next_follow_up_at = input.next_follow_up_at;
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update(leadUpdate)
    .eq("id", leadId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}
