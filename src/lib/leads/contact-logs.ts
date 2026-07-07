import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AddContactLogInput } from "@/lib/validations/contact-log";
import {
  completeFollowUpTask,
  createFollowUpTask,
} from "@/lib/leads/follow-up-task-lifecycle";

export type AddContactLogResult = { ok: true } | { ok: false; error: string };

/**
 * Registra un contacto realizado con un lead. En el mismo flujo:
 * 1. Actualiza leads.last_contacted_at.
 * 2. Si `task_id` viene (se registró el contacto desde una tarea puntual
 *    del Centro de Seguimientos o del detalle del lead), completa esa
 *    tarea y la enlaza con este contact_log.
 * 3. Si se indicó `next_follow_up_at`, crea una nueva tarea de seguimiento
 *    pendiente para esa fecha (reemplaza el antiguo
 *    leads.next_follow_up_at: ahora cada seguimiento programado es una
 *    tarea propia, no un campo suelto en el lead).
 */
export async function addContactLog(
  supabase: SupabaseClient<Database>,
  leadId: string,
  createdBy: string | null,
  input: AddContactLogInput,
): Promise<AddContactLogResult> {
  const { data: inserted, error: insertError } = await supabase
    .from("contact_logs")
    .insert({
      lead_id: leadId,
      created_by: createdBy,
      channel: input.channel,
      direction: input.direction,
      summary: input.summary,
      outcome: input.outcome || null,
      next_follow_up_at: input.next_follow_up_at || null,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return {
      ok: false,
      error: insertError?.message ?? "No se pudo registrar el contacto.",
    };
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({ last_contacted_at: new Date().toISOString() })
    .eq("id", leadId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  if (input.task_id) {
    const completeResult = await completeFollowUpTask(supabase, input.task_id, {
      contactLogId: inserted.id,
    });
    if (!completeResult.ok) {
      return completeResult;
    }
  }

  if (input.next_follow_up_at) {
    const createResult = await createFollowUpTask(supabase, {
      leadId,
      title: "Dar seguimiento",
      dueAt: input.next_follow_up_at,
      messageTemplateKey: "seguimiento",
      demoEventId: null,
      createdBy,
    });
    if (!createResult.ok) {
      return createResult;
    }
  }

  return { ok: true };
}
