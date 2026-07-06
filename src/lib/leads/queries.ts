import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  LeadInterest,
  LeadRow,
  LeadStatus,
} from "@/types/database";

const LEAD_STATUSES: LeadStatus[] = [
  "nuevo",
  "contactado",
  "convertido",
  "descartado",
];

const LEAD_INTERESTS: LeadInterest[] = [
  "recetas",
  "demo_cocina",
  "demo_thermomix",
  "otro",
];

export interface LeadStats {
  total: number;
  last7Days: number;
  byStatus: Record<LeadStatus, number>;
  byInterest: Record<LeadInterest, number>;
}

function emptyStats(): LeadStats {
  return {
    total: 0,
    last7Days: 0,
    byStatus: Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<
      LeadStatus,
      number
    >,
    byInterest: Object.fromEntries(
      LEAD_INTERESTS.map((i) => [i, 0]),
    ) as Record<LeadInterest, number>,
  };
}

export async function getLeadStats(
  supabase: SupabaseClient<Database>,
): Promise<LeadStats> {
  const { data, error } = await supabase
    .from("leads")
    .select("status, interest, created_at");

  if (error || !data) {
    return emptyStats();
  }

  const stats = emptyStats();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const row of data) {
    stats.total += 1;
    stats.byStatus[row.status] += 1;
    stats.byInterest[row.interest] += 1;
    if (new Date(row.created_at).getTime() >= sevenDaysAgo) {
      stats.last7Days += 1;
    }
  }

  return stats;
}

export async function listLeads(
  supabase: SupabaseClient<Database>,
  limit = 50,
): Promise<LeadRow[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}
