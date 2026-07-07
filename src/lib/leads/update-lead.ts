import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, LeadStatus } from "@/types/database";

export interface UpdateLeadInput {
  status: LeadStatus;
  notes: string | null;
  next_follow_up_at: string | null;
}

export type UpdateLeadResult = { ok: true } | { ok: false; error: string };

/**
 * Actualiza únicamente los campos que el admin puede editar desde el
 * detalle del lead (estado, notas y próximo seguimiento). Construye el
 * payload explícitamente en vez de reenviar el input completo, como
 * segunda barrera además de la validación Zod en la server action.
 */
export async function updateLead(
  supabase: SupabaseClient<Database>,
  leadId: string,
  input: UpdateLeadInput,
): Promise<UpdateLeadResult> {
  const { error } = await supabase
    .from("leads")
    .update({
      status: input.status,
      notes: input.notes,
      next_follow_up_at: input.next_follow_up_at,
    })
    .eq("id", leadId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
