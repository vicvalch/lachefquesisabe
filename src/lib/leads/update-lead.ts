import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, LeadStatus } from "@/types/database";
import { ensureFollowUpTaskForStatus } from "@/lib/leads/follow-up-task-lifecycle";

export interface UpdateLeadInput {
  status: LeadStatus;
  notes: string | null;
}

export type UpdateLeadResult = { ok: true } | { ok: false; error: string };

/**
 * Actualiza únicamente los campos que el admin puede editar desde el
 * detalle de un lead (estado y notas). Construye el payload explícitamente
 * en vez de reenviar el input completo, como segunda barrera además de la
 * validación Zod en la server action.
 *
 * Después de guardar, asegura que exista una tarea de seguimiento acorde
 * al nuevo estado (o cancela las pendientes si el estado es final): ver
 * `ensureFollowUpTaskForStatus`.
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
    })
    .eq("id", leadId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return ensureFollowUpTaskForStatus(supabase, leadId, input.status);
}
