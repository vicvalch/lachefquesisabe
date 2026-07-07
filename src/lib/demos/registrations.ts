import type { SupabaseClient } from "@supabase/supabase-js";
import type { AttendanceStatus, Database, LeadStatus } from "@/types/database";
import type {
  RegisterLeadForDemoInput,
  UpdateAttendanceInput,
} from "@/lib/validations/demo-registration";
import { ensureFollowUpTaskForStatus } from "@/lib/leads/follow-up-task-lifecycle";

const ACTIVE_ATTENDANCE_STATUSES: AttendanceStatus[] = [
  "registered",
  "confirmed",
  "attended",
  "no_show",
];

const UNIQUE_VIOLATION_CODE = "23505";

export type RegisterLeadForDemoResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Registra un lead en una demo, respetando el cupo disponible. El cupo
 * disponible se calcula sobre las inscripciones activas (todas menos
 * "cancelled").
 */
export async function registerLeadForDemo(
  supabase: SupabaseClient<Database>,
  demoEventId: string,
  input: RegisterLeadForDemoInput,
): Promise<RegisterLeadForDemoResult> {
  const { data: demo, error: demoError } = await supabase
    .from("demo_events")
    .select("capacity")
    .eq("id", demoEventId)
    .maybeSingle();

  if (demoError || !demo) {
    return { ok: false, error: "No se encontró la demo." };
  }

  const { data: existing, error: countError } = await supabase
    .from("demo_registrations")
    .select("attendance_status")
    .eq("demo_event_id", demoEventId);

  if (countError) {
    return { ok: false, error: countError.message };
  }

  const activeCount = (existing ?? []).filter((row) =>
    ACTIVE_ATTENDANCE_STATUSES.includes(row.attendance_status),
  ).length;

  if (activeCount >= demo.capacity) {
    return { ok: false, error: "Ya no hay cupos disponibles para esta demo." };
  }

  const { error: insertError } = await supabase
    .from("demo_registrations")
    .insert({
      demo_event_id: demoEventId,
      lead_id: input.lead_id,
      notes: input.notes || null,
    });

  if (insertError) {
    if (insertError.code === UNIQUE_VIOLATION_CODE) {
      return { ok: false, error: "Este lead ya está registrado en esta demo." };
    }
    return { ok: false, error: insertError.message };
  }

  return { ok: true };
}

const ATTENDANCE_TO_LEAD_STATUS: Partial<Record<AttendanceStatus, LeadStatus>> =
  {
    registered: "invited_to_demo",
    confirmed: "confirmed_demo",
    attended: "attended",
    no_show: "no_show",
  };

export type UpdateAttendanceResult = { ok: true } | { ok: false; error: string };

/**
 * Actualiza la asistencia de una inscripción y, cuando aplica, sincroniza
 * leads.status para reflejar el nuevo estado (invited_to_demo,
 * confirmed_demo, attended, no_show). "cancelled" no sincroniza el status
 * del lead: cancelar una inscripción no dice nada sobre su interés.
 *
 * Al sincronizar el status también asegura la tarea de seguimiento
 * correspondiente (ver ensureFollowUpTaskForStatus), atada a esta demo.
 */
export async function updateAttendanceStatus(
  supabase: SupabaseClient<Database>,
  registrationId: string,
  leadId: string,
  demoEventId: string,
  input: UpdateAttendanceInput,
): Promise<UpdateAttendanceResult> {
  const { error: updateError } = await supabase
    .from("demo_registrations")
    .update({
      attendance_status: input.attendance_status,
      notes: input.notes || null,
    })
    .eq("id", registrationId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const leadStatus = ATTENDANCE_TO_LEAD_STATUS[input.attendance_status];
  if (leadStatus) {
    const { error: leadError } = await supabase
      .from("leads")
      .update({ status: leadStatus })
      .eq("id", leadId);

    if (leadError) {
      return { ok: false, error: leadError.message };
    }

    return ensureFollowUpTaskForStatus(supabase, leadId, leadStatus, demoEventId);
  }

  return { ok: true };
}

export type RemoveRegistrationResult =
  | { ok: true }
  | { ok: false; error: string };

export async function removeRegistration(
  supabase: SupabaseClient<Database>,
  registrationId: string,
): Promise<RemoveRegistrationResult> {
  const { error } = await supabase
    .from("demo_registrations")
    .delete()
    .eq("id", registrationId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
