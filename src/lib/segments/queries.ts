import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, LeadRow, LeadSegmentRow } from "@/types/database";

export async function listLeadSegments(
  supabase: SupabaseClient<Database>,
): Promise<LeadSegmentRow[]> {
  const { data, error } = await supabase
    .from("lead_segments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getLeadSegmentById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<LeadSegmentRow | null> {
  const { data, error } = await supabase
    .from("lead_segments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Leads que matchean los filtros de un segmento, calculado en vivo: no hay
 * tabla de membresía que se pueda desincronizar, así que "quién entra" se
 * recalcula cada vez que se consulta. Siempre exige consent_contact = true
 * sin importar los filtros del segmento: ningún segmento puede incluir a
 * alguien que no autorizó que lo contacten.
 */
export async function listLeadsMatchingSegment(
  supabase: SupabaseClient<Database>,
  segment: LeadSegmentRow,
  limit = 500,
): Promise<LeadRow[]> {
  let query = supabase
    .from("leads")
    .select("*")
    .eq("consent_contact", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (segment.filter_statuses.length > 0) {
    query = query.in("status", segment.filter_statuses);
  }

  if (segment.filter_primary_interests.length > 0) {
    query = query.in("primary_interest", segment.filter_primary_interests);
  }

  if (segment.filter_source) {
    query = query.eq("source", segment.filter_source);
  }

  if (segment.filter_created_after) {
    query = query.gte("created_at", segment.filter_created_after);
  }

  if (segment.filter_created_before) {
    query = query.lte("created_at", segment.filter_created_before);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  if (segment.filter_has_open_task === null) {
    return data;
  }

  const leadIds = data.map((lead) => lead.id);
  if (leadIds.length === 0) {
    return [];
  }

  const { data: openTasks, error: openTasksError } = await supabase
    .from("follow_up_tasks")
    .select("lead_id")
    .eq("status", "open")
    .in("lead_id", leadIds);

  if (openTasksError) {
    return [];
  }

  const leadIdsWithOpenTask = new Set(
    (openTasks ?? []).map((task) => task.lead_id),
  );

  return data.filter((lead) =>
    segment.filter_has_open_task
      ? leadIdsWithOpenTask.has(lead.id)
      : !leadIdsWithOpenTask.has(lead.id),
  );
}
