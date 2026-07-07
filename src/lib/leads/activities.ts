import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AddLeadActivityInput } from "@/lib/validations/lead-activity";

export type AddLeadActivityResult = { ok: true } | { ok: false; error: string };

/**
 * Registra una nota de seguimiento o un contacto realizado sobre un lead.
 * Recibe el cliente de Supabase por parámetro para poder inyectar un mock
 * en tests sin tocar la red.
 */
export async function addLeadActivity(
  supabase: SupabaseClient<Database>,
  leadId: string,
  createdBy: string | null,
  input: AddLeadActivityInput,
): Promise<AddLeadActivityResult> {
  const { error } = await supabase.from("lead_activities").insert({
    lead_id: leadId,
    created_by: createdBy,
    type: input.type,
    channel: input.type === "contact" ? (input.channel ?? null) : null,
    content: input.content,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
