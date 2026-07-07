import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  DemoEventRow,
  FollowUpTaskRow,
  LeadRow,
} from "@/types/database";

export interface FollowUpTaskWithLead extends FollowUpTaskRow {
  lead: LeadRow;
  demo: DemoEventRow | null;
}

async function attachLeadsAndDemos(
  supabase: SupabaseClient<Database>,
  tasks: FollowUpTaskRow[],
): Promise<FollowUpTaskWithLead[]> {
  if (tasks.length === 0) {
    return [];
  }

  const leadIds = [...new Set(tasks.map((task) => task.lead_id))];
  const demoEventIds = [
    ...new Set(
      tasks
        .map((task) => task.demo_event_id)
        .filter((id): id is string => id !== null),
    ),
  ];

  const [{ data: leads, error: leadsError }, { data: demos }] =
    await Promise.all([
      supabase.from("leads").select("*").in("id", leadIds),
      demoEventIds.length > 0
        ? supabase.from("demo_events").select("*").in("id", demoEventIds)
        : Promise.resolve({ data: [] as DemoEventRow[], error: null }),
    ]);

  if (leadsError || !leads) {
    return [];
  }

  const leadsById = new Map(leads.map((lead) => [lead.id, lead]));
  const demosById = new Map((demos ?? []).map((demo) => [demo.id, demo]));

  return tasks
    .map((task) => {
      const lead = leadsById.get(task.lead_id);
      if (!lead) return null;
      const demo = task.demo_event_id
        ? (demosById.get(task.demo_event_id) ?? null)
        : null;
      return { ...task, lead, demo };
    })
    .filter((task): task is FollowUpTaskWithLead => task !== null);
}

/**
 * Todas las tareas abiertas, para el Centro de Seguimientos. La
 * agrupación en vencidas/hoy/próximas la hace groupFollowUpTasks sobre
 * due_at.
 */
export async function listOpenFollowUpTasks(
  supabase: SupabaseClient<Database>,
  limit = 200,
): Promise<FollowUpTaskWithLead[]> {
  const { data, error } = await supabase
    .from("follow_up_tasks")
    .select("*")
    .eq("status", "open")
    .order("due_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return attachLeadsAndDemos(supabase, data);
}

/**
 * Tareas abiertas ya vencidas o de hoy, para el widget "Seguimientos
 * pendientes" del dashboard.
 */
export async function listDueFollowUpTasks(
  supabase: SupabaseClient<Database>,
  limit = 5,
): Promise<FollowUpTaskWithLead[]> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("follow_up_tasks")
    .select("*")
    .eq("status", "open")
    .lte("due_at", nowIso)
    .order("due_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return attachLeadsAndDemos(supabase, data);
}

export interface FollowUpTaskWithDemo extends FollowUpTaskRow {
  demo: DemoEventRow | null;
}

/**
 * Todas las tareas (abiertas e historial) de un lead, para su detalle.
 */
export async function listFollowUpTasksForLead(
  supabase: SupabaseClient<Database>,
  leadId: string,
): Promise<FollowUpTaskWithDemo[]> {
  const { data, error } = await supabase
    .from("follow_up_tasks")
    .select("*")
    .eq("lead_id", leadId)
    .order("due_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const demoEventIds = [
    ...new Set(
      data
        .map((task) => task.demo_event_id)
        .filter((id): id is string => id !== null),
    ),
  ];

  if (demoEventIds.length === 0) {
    return data.map((task) => ({ ...task, demo: null }));
  }

  const { data: demos } = await supabase
    .from("demo_events")
    .select("*")
    .in("id", demoEventIds);

  const demosById = new Map((demos ?? []).map((demo) => [demo.id, demo]));

  return data.map((task) => ({
    ...task,
    demo: task.demo_event_id ? (demosById.get(task.demo_event_id) ?? null) : null,
  }));
}
