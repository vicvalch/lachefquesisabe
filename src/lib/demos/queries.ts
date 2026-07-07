import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AttendanceStatus,
  Database,
  DemoEventRow,
  DemoRegistrationRow,
  LeadRow,
} from "@/types/database";
import { PUBLIC_DEMO_EVENT_STATUSES } from "@/lib/validations/demo-event";

export interface DemoRegistrationWithLead extends DemoRegistrationRow {
  lead: LeadRow;
}

export interface DemoRegistrationCounts {
  active: number;
  attended: number;
  noShow: number;
}

const ACTIVE_ATTENDANCE_STATUSES: AttendanceStatus[] = [
  "registered",
  "confirmed",
  "attended",
  "no_show",
];

function emptyCounts(): DemoRegistrationCounts {
  return { active: 0, attended: 0, noShow: 0 };
}

/**
 * Todas las demos, sin importar estado ni fecha — para selects de filtro
 * (ej: el criterio de un segmento), donde interesa poder elegir cualquier
 * demo, incluidas las pasadas.
 */
export async function listAllDemoEvents(
  supabase: SupabaseClient<Database>,
  limit = 100,
): Promise<DemoEventRow[]> {
  const { data, error } = await supabase
    .from("demo_events")
    .select("*")
    .order("starts_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function listUpcomingDemoEvents(
  supabase: SupabaseClient<Database>,
  limit = 20,
): Promise<DemoEventRow[]> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("demo_events")
    .select("*")
    .eq("status", "scheduled")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function listPastDemoEvents(
  supabase: SupabaseClient<Database>,
  limit = 20,
): Promise<DemoEventRow[]> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("demo_events")
    .select("*")
    .or(`status.neq.scheduled,starts_at.lt.${nowIso}`)
    .order("starts_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getDemoEventById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<DemoEventRow | null> {
  const { data, error } = await supabase
    .from("demo_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Demos visibles para el sitio público: status "scheduled" o "full" y
 * fecha de inicio futura. Se apoya en RLS (la policy pública ya filtra
 * exactamente por esto) y repite el filtro en la query para que el orden
 * y el límite tengan sentido incluso si RLS cambiara.
 */
export async function listPublicUpcomingDemoEvents(
  supabase: SupabaseClient<Database>,
  limit = 20,
): Promise<DemoEventRow[]> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("demo_events")
    .select("*")
    .in("status", PUBLIC_DEMO_EVENT_STATUSES)
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getPublicDemoEventBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<DemoEventRow | null> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("demo_events")
    .select("*")
    .eq("slug", slug)
    .in("status", PUBLIC_DEMO_EVENT_STATUSES)
    .gte("starts_at", nowIso)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function listDemoRegistrations(
  supabase: SupabaseClient<Database>,
  demoEventId: string,
): Promise<DemoRegistrationWithLead[]> {
  const { data: registrations, error } = await supabase
    .from("demo_registrations")
    .select("*")
    .eq("demo_event_id", demoEventId)
    .order("created_at", { ascending: true });

  if (error || !registrations || registrations.length === 0) {
    return [];
  }

  const leadIds = registrations.map((registration) => registration.lead_id);
  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("*")
    .in("id", leadIds);

  if (leadsError || !leads) {
    return [];
  }

  const leadsById = new Map(leads.map((lead) => [lead.id, lead]));

  return registrations
    .map((registration) => {
      const lead = leadsById.get(registration.lead_id);
      return lead ? { ...registration, lead } : null;
    })
    .filter((row): row is DemoRegistrationWithLead => row !== null);
}

export async function getDemoRegistrationCounts(
  supabase: SupabaseClient<Database>,
  demoEventId: string,
): Promise<DemoRegistrationCounts> {
  const { data, error } = await supabase
    .from("demo_registrations")
    .select("attendance_status")
    .eq("demo_event_id", demoEventId);

  if (error || !data) {
    return emptyCounts();
  }

  const counts = emptyCounts();
  for (const row of data) {
    if (ACTIVE_ATTENDANCE_STATUSES.includes(row.attendance_status)) {
      counts.active += 1;
    }
    if (row.attendance_status === "attended") {
      counts.attended += 1;
    }
    if (row.attendance_status === "no_show") {
      counts.noShow += 1;
    }
  }

  return counts;
}

export async function getRegistrationCountsByDemoIds(
  supabase: SupabaseClient<Database>,
  demoEventIds: string[],
): Promise<Record<string, DemoRegistrationCounts>> {
  if (demoEventIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("demo_registrations")
    .select("demo_event_id, attendance_status")
    .in("demo_event_id", demoEventIds);

  const counts: Record<string, DemoRegistrationCounts> = {};
  for (const id of demoEventIds) {
    counts[id] = emptyCounts();
  }

  if (error || !data) {
    return counts;
  }

  for (const row of data) {
    const bucket = counts[row.demo_event_id];
    if (!bucket) continue;
    if (ACTIVE_ATTENDANCE_STATUSES.includes(row.attendance_status)) {
      bucket.active += 1;
    }
    if (row.attendance_status === "attended") {
      bucket.attended += 1;
    }
    if (row.attendance_status === "no_show") {
      bucket.noShow += 1;
    }
  }

  return counts;
}

/**
 * Leads que todavía no están inscritos en esta demo, para el selector de
 * "agregar lead". Se limita a los 200 leads más recientes: suficiente para
 * el volumen de un negocio pequeño sin necesitar búsqueda paginada.
 */
export async function listLeadsAvailableForDemo(
  supabase: SupabaseClient<Database>,
  demoEventId: string,
): Promise<LeadRow[]> {
  const [{ data: leads, error: leadsError }, { data: registrations }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("demo_registrations")
        .select("lead_id")
        .eq("demo_event_id", demoEventId),
    ]);

  if (leadsError || !leads) {
    return [];
  }

  const registeredIds = new Set(
    (registrations ?? []).map((registration) => registration.lead_id),
  );

  return leads.filter((lead) => !registeredIds.has(lead.id));
}
