import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  LeadRow,
  LeadSegmentCriteria,
  LeadSegmentRow,
} from "@/types/database";

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

const DEFAULT_PREVIEW_LIMIT = 50;
const MIN_INTERNAL_FETCH_LIMIT = 500;
const SEARCH_FIELDS = ["name", "email", "phone"] as const;

function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Aplica los filtros de columna directa del criterio (todo lo que no
 * requiere una consulta a otra tabla) sobre una query de `leads` recién
 * creada. Se reconstruye desde cero en cada llamada (por eso recibe
 * `supabase`, no una query ya armada): el builder de Supabase no es
 * reutilizable entre llamadas terminales distintas, y `fetchBySearch`
 * necesita esta misma base 3 veces (una por campo).
 */
function buildBaseLeadsQuery(
  supabase: SupabaseClient<Database>,
  criteria: LeadSegmentCriteria,
  contentSourceTag: string | null,
) {
  let query = supabase.from("leads").select("*");

  if (criteria.statuses && criteria.statuses.length > 0) {
    query = query.in("status", criteria.statuses);
  }
  if (criteria.primary_interests && criteria.primary_interests.length > 0) {
    query = query.in("primary_interest", criteria.primary_interests);
  }
  if (criteria.sources && criteria.sources.length > 0) {
    query = query.in("source", criteria.sources);
  }
  if (criteria.consent_contact !== undefined) {
    query = query.eq("consent_contact", criteria.consent_contact);
  }
  if (criteria.created_from) {
    query = query.gte("created_at", criteria.created_from);
  }
  if (criteria.created_to) {
    query = query.lte("created_at", criteria.created_to);
  }
  if (criteria.last_contacted_after) {
    query = query.gte("last_contacted_at", criteria.last_contacted_after);
  }
  if (criteria.last_contacted_before) {
    query = query.lte("last_contacted_at", criteria.last_contacted_before);
  }
  if (criteria.next_follow_up_after) {
    query = query.gte("next_follow_up_at", criteria.next_follow_up_after);
  }
  if (criteria.next_follow_up_before) {
    query = query.lte("next_follow_up_at", criteria.next_follow_up_before);
  }
  if (contentSourceTag) {
    query = query.eq("source", contentSourceTag);
  }

  return query;
}

/**
 * content_post_id no tiene todavía una relación real con leads (ningún
 * flujo de captura pública etiqueta el lead con el post que lo originó):
 * se resuelve por convención vía `leads.source = 'content:<slug>'`. Hoy
 * es forward-compatible pero no produce matches reales hasta que un PR
 * futuro haga que la captura de leads desde `/recetas/[slug]` escriba ese
 * source — se documenta acá y en el README para que no se lea como un bug.
 */
async function resolveContentPostSourceTag(
  supabase: SupabaseClient<Database>,
  contentPostId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("content_posts")
    .select("slug")
    .eq("id", contentPostId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return `content:${data.slug}`;
}

async function fetchByColumns(
  supabase: SupabaseClient<Database>,
  criteria: LeadSegmentCriteria,
  contentSourceTag: string | null,
  internalLimit: number,
): Promise<LeadRow[]> {
  const { data, error } = await buildBaseLeadsQuery(supabase, criteria, contentSourceTag)
    .order("created_at", { ascending: false })
    .limit(internalLimit);

  return error || !data ? [] : data;
}

/**
 * `search` matchea name/email/phone. En vez de armar un filtro `.or()`
 * como string crudo (habría que escapar a mano la sintaxis de
 * combinadores de PostgREST, con riesgo real de hacerlo mal), corre una
 * consulta segura y parametrizada por campo (`.ilike(field, pattern)`,
 * nunca SQL armado con el input) y mezcla los resultados en JS,
 * deduplicando por id.
 */
async function fetchBySearch(
  supabase: SupabaseClient<Database>,
  criteria: LeadSegmentCriteria,
  contentSourceTag: string | null,
  internalLimit: number,
): Promise<LeadRow[]> {
  const pattern = `%${escapeIlikePattern(criteria.search ?? "")}%`;

  const resultsByField = await Promise.all(
    SEARCH_FIELDS.map(async (field) => {
      const { data, error } = await buildBaseLeadsQuery(supabase, criteria, contentSourceTag)
        .ilike(field, pattern)
        .order("created_at", { ascending: false })
        .limit(internalLimit);
      return error || !data ? [] : data;
    }),
  );

  const merged = new Map<string, LeadRow>();
  for (const rows of resultsByField) {
    for (const row of rows) {
      merged.set(row.id, row);
    }
  }

  return [...merged.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

async function fetchDemoRestrictedLeadIds(
  supabase: SupabaseClient<Database>,
  criteria: LeadSegmentCriteria,
): Promise<Set<string>> {
  let query = supabase.from("demo_registrations").select("lead_id");

  if (criteria.demo_event_id) {
    query = query.eq("demo_event_id", criteria.demo_event_id);
  }
  if (criteria.demo_attendance_statuses && criteria.demo_attendance_statuses.length > 0) {
    query = query.in("attendance_status", criteria.demo_attendance_statuses);
  }

  const { data, error } = await query;
  if (error || !data) {
    return new Set();
  }

  return new Set(data.map((row) => row.lead_id));
}

async function fetchOpenFollowUpTaskLeadIds(
  supabase: SupabaseClient<Database>,
  leadIds: string[],
): Promise<Set<string>> {
  if (leadIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("follow_up_tasks")
    .select("lead_id")
    .eq("status", "open")
    .in("lead_id", leadIds);

  if (error || !data) {
    return new Set();
  }

  return new Set(data.map((row) => row.lead_id));
}

/**
 * Leads que matchean el criterio de un segmento, calculado en vivo: no hay
 * tabla de membresía que se pueda desincronizar. Todos los filtros son
 * opcionales y se combinan con AND (ver LeadSegmentCriteria); a
 * diferencia de la v1 de este PR, `consent_contact` ya no es implícito acá
 * — es un filtro más, explícito en el criterio. La protección real de
 * "nunca contactar a quien no dio consentimiento" vive en
 * materializeCampaignRecipients (src/lib/campaigns/materialize-recipients.ts),
 * que filtra por consent_contact = true sin importar el criterio del
 * segmento.
 *
 * `limit` acota el resultado final (por defecto 50, pensado para
 * preview); el fetch interno (antes de aplicar demo_event_id/
 * demo_attendance_statuses/has_open_follow_up_task, que requieren una
 * consulta aparte) escala con ese límite para no perder leads que sí
 * matchean por quedar fuera de una ventana interna fija — quien necesite
 * la lista completa (por ejemplo, para materializar una campaña) debe
 * pasar un límite explícito más alto.
 */
export async function listLeadsMatchingCriteria(
  supabase: SupabaseClient<Database>,
  criteria: LeadSegmentCriteria,
  limit = DEFAULT_PREVIEW_LIMIT,
): Promise<LeadRow[]> {
  const internalLimit = Math.max(limit, MIN_INTERNAL_FETCH_LIMIT);

  const contentSourceTag = criteria.content_post_id
    ? await resolveContentPostSourceTag(supabase, criteria.content_post_id)
    : null;

  if (criteria.content_post_id && !contentSourceTag) {
    return [];
  }

  let leads = criteria.search
    ? await fetchBySearch(supabase, criteria, contentSourceTag, internalLimit)
    : await fetchByColumns(supabase, criteria, contentSourceTag, internalLimit);

  if (
    criteria.demo_event_id ||
    (criteria.demo_attendance_statuses && criteria.demo_attendance_statuses.length > 0)
  ) {
    const allowedLeadIds = await fetchDemoRestrictedLeadIds(supabase, criteria);
    leads = leads.filter((lead) => allowedLeadIds.has(lead.id));
  }

  if (criteria.has_open_follow_up_task !== undefined) {
    const openTaskLeadIds = await fetchOpenFollowUpTaskLeadIds(
      supabase,
      leads.map((lead) => lead.id),
    );
    leads = leads.filter((lead) =>
      criteria.has_open_follow_up_task
        ? openTaskLeadIds.has(lead.id)
        : !openTaskLeadIds.has(lead.id),
    );
  }

  return leads.slice(0, limit);
}
