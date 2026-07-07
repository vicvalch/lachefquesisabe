import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ContactLogRow,
  Database,
  LeadRow,
  LeadStatus,
  PrimaryInterest,
} from "@/types/database";

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "interested",
  "invited_to_demo",
  "confirmed_demo",
  "attended",
  "no_show",
  "post_demo_follow_up",
  "purchased",
  "lost",
];

const PRIMARY_INTERESTS: PrimaryInterest[] = [
  "easy_recipes",
  "save_time",
  "in_person_demo",
  "virtual_demo",
  "buy_thermomix",
  "more_info",
];

export interface LeadStats {
  total: number;
  last7Days: number;
  byStatus: Record<LeadStatus, number>;
  byInterest: Record<PrimaryInterest, number>;
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
      PRIMARY_INTERESTS.map((i) => [i, 0]),
    ) as Record<PrimaryInterest, number>,
  };
}

export async function getLeadStats(
  supabase: SupabaseClient<Database>,
): Promise<LeadStats> {
  const { data, error } = await supabase
    .from("leads")
    .select("status, primary_interest, created_at");

  if (error || !data) {
    return emptyStats();
  }

  const stats = emptyStats();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const row of data) {
    stats.total += 1;
    stats.byStatus[row.status] += 1;
    stats.byInterest[row.primary_interest] += 1;
    if (new Date(row.created_at).getTime() >= sevenDaysAgo) {
      stats.last7Days += 1;
    }
  }

  return stats;
}

export interface ListLeadsFilters {
  status?: LeadStatus;
  interest?: PrimaryInterest;
  limit?: number;
}

export async function listLeads(
  supabase: SupabaseClient<Database>,
  filters: ListLeadsFilters = {},
): Promise<LeadRow[]> {
  const { status, interest, limit = 50 } = filters;

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  if (interest) {
    query = query.eq("primary_interest", interest);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getLeadById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<LeadRow | null> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function listContactLogs(
  supabase: SupabaseClient<Database>,
  leadId: string,
): Promise<ContactLogRow[]> {
  const { data, error } = await supabase
    .from("contact_logs")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

