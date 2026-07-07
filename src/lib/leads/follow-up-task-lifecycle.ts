import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, LeadStatus } from "@/types/database";
import { getFollowUpSuggestion } from "@/lib/leads/follow-up-suggestions";

const TERMINAL_LEAD_STATUSES: LeadStatus[] = ["purchased", "lost"];

export type FollowUpTaskLifecycleResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Mantiene la invariante de la tarea automática según el estado del lead:
 * - Si el lead llega a un estado final (purchased/lost), cancela las
 *   tareas abiertas en vez de crear una nueva: ya no hay nada que hacer.
 * - Si no, y el lead no tiene ninguna tarea abierta todavía, crea una
 *   con el título, la plantilla y el source sugeridos para ese estado.
 * - Si ya tiene una tarea abierta, no crea otra (evita acumular tareas
 *   duplicadas cada vez que se guarda el mismo estado).
 *
 * Se llama después de cualquier escritura de leads.status (desde el
 * formulario de detalle del lead o al sincronizar la asistencia a una
 * demo), sin necesidad de saber si el estado realmente cambió.
 *
 * No actualiza leads.next_follow_up_at directamente: eso lo mantiene al
 * día un trigger sobre follow_up_tasks (ver 0006_follow_up_tasks.sql).
 */
export async function ensureFollowUpTaskForStatus(
  supabase: SupabaseClient<Database>,
  leadId: string,
  status: LeadStatus,
  demoEventId: string | null = null,
): Promise<FollowUpTaskLifecycleResult> {
  if (TERMINAL_LEAD_STATUSES.includes(status)) {
    const { error } = await supabase
      .from("follow_up_tasks")
      .update({ status: "cancelled", completed_at: new Date().toISOString() })
      .eq("lead_id", leadId)
      .eq("status", "open");

    if (error) {
      return { ok: false, error: "No pudimos actualizar la tarea de seguimiento. Intenta de nuevo." };
    }
    return { ok: true };
  }

  const { data: openTasks, error: openTasksError } = await supabase
    .from("follow_up_tasks")
    .select("id")
    .eq("lead_id", leadId)
    .eq("status", "open")
    .limit(1);

  if (openTasksError) {
    return { ok: false, error: "No pudimos revisar las tareas abiertas del lead. Intenta de nuevo." };
  }

  if (openTasks && openTasks.length > 0) {
    return { ok: true };
  }

  const suggestion = getFollowUpSuggestion(status);
  const { error: insertError } = await supabase.from("follow_up_tasks").insert({
    lead_id: leadId,
    demo_event_id: demoEventId,
    title: suggestion.taskLabel,
    message_template_key: suggestion.templateKey,
    due_at: new Date().toISOString(),
    source: suggestion.source,
  });

  if (insertError) {
    return { ok: false, error: "No pudimos crear la tarea de seguimiento. Intenta de nuevo." };
  }

  return { ok: true };
}

export interface CompleteFollowUpTaskInput {
  contactLogId: string;
}

/**
 * Completa una tarea creando un contact_log: la marca "completed" y la
 * enlaza con el registro de contacto que la resolvió. Solo afecta tareas
 * todavía "open" (idempotente si se reintenta).
 */
export async function completeFollowUpTask(
  supabase: SupabaseClient<Database>,
  taskId: string,
  input: CompleteFollowUpTaskInput,
): Promise<FollowUpTaskLifecycleResult> {
  const { error } = await supabase
    .from("follow_up_tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      contact_log_id: input.contactLogId,
    })
    .eq("id", taskId)
    .eq("status", "open");

  if (error) {
    return { ok: false, error: "No pudimos completar la tarea de seguimiento. Intenta de nuevo." };
  }

  return { ok: true };
}

/**
 * Salta una tarea abierta sin registrar un contacto (por ejemplo: no se
 * pudo contactar todavía, o ya no aplica pero no amerita cancelarla del
 * todo).
 */
export async function skipFollowUpTask(
  supabase: SupabaseClient<Database>,
  taskId: string,
  notes: string | null = null,
): Promise<FollowUpTaskLifecycleResult> {
  const { error } = await supabase
    .from("follow_up_tasks")
    .update({
      status: "skipped",
      completed_at: new Date().toISOString(),
      notes,
    })
    .eq("id", taskId)
    .eq("status", "open");

  if (error) {
    return { ok: false, error: "No pudimos saltar la tarea de seguimiento. Intenta de nuevo." };
  }

  return { ok: true };
}

/**
 * Cancela una tarea abierta: ya no aplica (por ejemplo, el lead cambió de
 * estado por otro medio, o se agregó por error).
 */
export async function cancelFollowUpTask(
  supabase: SupabaseClient<Database>,
  taskId: string,
  notes: string | null = null,
): Promise<FollowUpTaskLifecycleResult> {
  const { error } = await supabase
    .from("follow_up_tasks")
    .update({
      status: "cancelled",
      completed_at: new Date().toISOString(),
      notes,
    })
    .eq("id", taskId)
    .eq("status", "open");

  if (error) {
    return { ok: false, error: "No pudimos cancelar la tarea de seguimiento. Intenta de nuevo." };
  }

  return { ok: true };
}

/**
 * Reprograma una tarea abierta a una nueva fecha, sin tocar su estado.
 */
export async function rescheduleFollowUpTask(
  supabase: SupabaseClient<Database>,
  taskId: string,
  dueAt: string,
): Promise<FollowUpTaskLifecycleResult> {
  const { error } = await supabase
    .from("follow_up_tasks")
    .update({ due_at: dueAt })
    .eq("id", taskId)
    .eq("status", "open");

  if (error) {
    return { ok: false, error: "No pudimos reprogramar la tarea de seguimiento. Intenta de nuevo." };
  }

  return { ok: true };
}

export interface CreateFollowUpTaskInput {
  leadId: string;
  title: string;
  dueAt: string;
  messageTemplateKey: string | null;
  demoEventId: string | null;
  createdBy: string | null;
}

/**
 * Crea una tarea manual ("programar el siguiente seguimiento"), fuera del
 * ciclo automático basado en el estado del lead.
 */
export async function createFollowUpTask(
  supabase: SupabaseClient<Database>,
  input: CreateFollowUpTaskInput,
): Promise<FollowUpTaskLifecycleResult> {
  const { error } = await supabase.from("follow_up_tasks").insert({
    lead_id: input.leadId,
    demo_event_id: input.demoEventId,
    title: input.title,
    message_template_key: input.messageTemplateKey,
    due_at: input.dueAt,
    source: "manual",
    created_by: input.createdBy,
  });

  if (error) {
    return { ok: false, error: "No pudimos crear la tarea de seguimiento. Intenta de nuevo." };
  }

  return { ok: true };
}
