import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  FollowUpTaskRow,
  LeadRow,
  LeadSegmentRow,
  OutreachCampaignRecipientRow,
  OutreachCampaignRow,
} from "@/types/database";

export interface OutreachCampaignWithSegment extends OutreachCampaignRow {
  segment: LeadSegmentRow | null;
  recipientsCount: number;
}

export async function listOutreachCampaigns(
  supabase: SupabaseClient<Database>,
): Promise<OutreachCampaignWithSegment[]> {
  const { data, error } = await supabase
    .from("outreach_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const segmentIds = [...new Set(data.map((campaign) => campaign.segment_id))];
  const campaignIds = data.map((campaign) => campaign.id);

  const [{ data: segments }, { data: recipients }] = await Promise.all([
    segmentIds.length > 0
      ? supabase.from("lead_segments").select("*").in("id", segmentIds)
      : Promise.resolve({ data: [] as LeadSegmentRow[] }),
    campaignIds.length > 0
      ? supabase
          .from("outreach_campaign_recipients")
          .select("campaign_id")
          .in("campaign_id", campaignIds)
      : Promise.resolve({ data: [] as { campaign_id: string }[] }),
  ]);

  const segmentsById = new Map((segments ?? []).map((segment) => [segment.id, segment]));
  const recipientCounts = new Map<string, number>();
  for (const recipient of recipients ?? []) {
    recipientCounts.set(
      recipient.campaign_id,
      (recipientCounts.get(recipient.campaign_id) ?? 0) + 1,
    );
  }

  return data.map((campaign) => ({
    ...campaign,
    segment: segmentsById.get(campaign.segment_id) ?? null,
    recipientsCount: recipientCounts.get(campaign.id) ?? 0,
  }));
}

export async function listOutreachCampaignsForSegment(
  supabase: SupabaseClient<Database>,
  segmentId: string,
): Promise<OutreachCampaignWithSegment[]> {
  const campaigns = await listOutreachCampaigns(supabase);
  return campaigns.filter((campaign) => campaign.segment_id === segmentId);
}

/**
 * Campañas más recientes, para el widget del dashboard. `listOutreachCampaigns`
 * ya ordena por created_at desc; acá solo se acota el tamaño.
 */
export async function listRecentOutreachCampaigns(
  supabase: SupabaseClient<Database>,
  limit = 5,
): Promise<OutreachCampaignWithSegment[]> {
  const campaigns = await listOutreachCampaigns(supabase);
  return campaigns.slice(0, limit);
}

export async function getOutreachCampaignById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<OutreachCampaignRow | null> {
  const { data, error } = await supabase
    .from("outreach_campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export interface CampaignRecipientWithLead extends OutreachCampaignRecipientRow {
  lead: LeadRow;
  task: FollowUpTaskRow | null;
}

/**
 * Historial de a quién ya se le generó tarea desde una campaña, para el
 * detalle de la campaña.
 */
export async function listCampaignRecipients(
  supabase: SupabaseClient<Database>,
  campaignId: string,
): Promise<CampaignRecipientWithLead[]> {
  const { data, error } = await supabase
    .from("outreach_campaign_recipients")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const leadIds = [...new Set(data.map((recipient) => recipient.lead_id))];
  const taskIds = [
    ...new Set(
      data
        .map((recipient) => recipient.follow_up_task_id)
        .filter((id): id is string => id !== null),
    ),
  ];

  const [{ data: leads }, { data: tasks }] = await Promise.all([
    leadIds.length > 0
      ? supabase.from("leads").select("*").in("id", leadIds)
      : Promise.resolve({ data: [] as LeadRow[] }),
    taskIds.length > 0
      ? supabase.from("follow_up_tasks").select("*").in("id", taskIds)
      : Promise.resolve({ data: [] as FollowUpTaskRow[] }),
  ]);

  const leadsById = new Map((leads ?? []).map((lead) => [lead.id, lead]));
  const tasksById = new Map((tasks ?? []).map((task) => [task.id, task]));

  return data
    .map((recipient) => {
      const lead = leadsById.get(recipient.lead_id);
      if (!lead) return null;
      const task = recipient.follow_up_task_id
        ? (tasksById.get(recipient.follow_up_task_id) ?? null)
        : null;
      return { ...recipient, lead, task };
    })
    .filter((recipient): recipient is CampaignRecipientWithLead => recipient !== null);
}

export interface LeadCampaignMembership {
  campaign: OutreachCampaignRow;
  recipientStatus: OutreachCampaignRecipientRow["status"];
  createdAt: string;
}

/**
 * Últimas campañas donde este lead fue destinatario, para su detalle.
 * `limit` (default 5) evita saturar la vista con historial viejo.
 */
export async function listCampaignsForLead(
  supabase: SupabaseClient<Database>,
  leadId: string,
  limit = 5,
): Promise<LeadCampaignMembership[]> {
  const { data, error } = await supabase
    .from("outreach_campaign_recipients")
    .select("campaign_id, status, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    return [];
  }

  const campaignIds = [...new Set(data.map((recipient) => recipient.campaign_id))];

  const { data: campaigns, error: campaignsError } = await supabase
    .from("outreach_campaigns")
    .select("*")
    .in("id", campaignIds);

  if (campaignsError || !campaigns) {
    return [];
  }

  const campaignsById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));

  return data
    .map((recipient) => {
      const campaign = campaignsById.get(recipient.campaign_id);
      if (!campaign) return null;
      return {
        campaign,
        recipientStatus: recipient.status,
        createdAt: recipient.created_at,
      };
    })
    .filter((membership): membership is LeadCampaignMembership => membership !== null);
}
