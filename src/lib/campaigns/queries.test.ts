import { describe, expect, it, vi } from "vitest";
import {
  listCampaignRecipients,
  listCampaignsForLead,
  listOutreachCampaigns,
  listOutreachCampaignsForSegment,
  listRecentOutreachCampaigns,
} from "./queries";
import type {
  FollowUpTaskRow,
  LeadRow,
  LeadSegmentRow,
  OutreachCampaignRecipientRow,
  OutreachCampaignRow,
} from "@/types/database";

function buildCampaign(overrides: Partial<OutreachCampaignRow> = {}): OutreachCampaignRow {
  return {
    id: "campaign-1",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    created_by: null,
    segment_id: "segment-1",
    message_template_id: "template-1",
    name: "Campaña de julio",
    slug: "campana-de-julio-abc12345",
    description: null,
    status: "draft",
    task_type: "whatsapp",
    task_priority: "medium",
    task_title: null,
    task_notes: null,
    due_at: null,
    ...overrides,
  };
}

function buildSegment(overrides: Partial<LeadSegmentRow> = {}): LeadSegmentRow {
  return {
    id: "segment-1",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    created_by: null,
    name: "Segmento de prueba",
    description: null,
    criteria: {},
    ...overrides,
  };
}

function buildLead(overrides: Partial<LeadRow> = {}): LeadRow {
  return {
    id: overrides.id ?? "lead-1",
    created_at: new Date(0).toISOString(),
    name: "Ana Pérez",
    email: "ana@example.com",
    phone: "88888888",
    primary_interest: "easy_recipes",
    message: null,
    status: "new",
    source: "landing",
    consent_contact: true,
    notes: null,
    next_follow_up_at: null,
    last_contacted_at: null,
    tags: [],
    ...overrides,
  };
}

function buildRecipient(
  overrides: Partial<OutreachCampaignRecipientRow> = {},
): OutreachCampaignRecipientRow {
  return {
    id: "recipient-1",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    campaign_id: "campaign-1",
    lead_id: "lead-1",
    follow_up_task_id: "task-1",
    status: "task_created",
    skip_reason: null,
    ...overrides,
  };
}

function buildTask(overrides: Partial<FollowUpTaskRow> = {}): FollowUpTaskRow {
  return {
    id: "task-1",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    lead_id: "lead-1",
    demo_event_id: null,
    contact_log_id: null,
    campaign_id: "campaign-1",
    created_by: null,
    title: "Contactar: Campaña de julio",
    message_template_key: "recontacto-suave",
    status: "open",
    due_at: new Date(0).toISOString(),
    source: "campaign",
    completed_at: null,
    notes: null,
    ...overrides,
  };
}

function buildMock(tables: Record<string, { data: unknown; error: unknown }>) {
  const calls: Record<string, unknown[][]> = {};

  const from = vi.fn((table: string) => {
    const result = tables[table];
    if (!result) throw new Error(`Tabla inesperada: ${table}`);

    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "limit", "in"]) {
      builder[method] = vi.fn((...args: unknown[]) => {
        const key = `${table}.${method}`;
        calls[key] = calls[key] ?? [];
        calls[key].push(args);
        return builder;
      });
    }
    (builder as { then: unknown }).then = (
      resolve: (value: typeof result) => void,
    ) => resolve(result);

    return builder;
  });

  return { client: { from } as never, calls };
}

describe("listOutreachCampaigns", () => {
  it("enlaza cada campaña con su segmento y cuenta sus destinatarios", async () => {
    const campaign = buildCampaign();
    const segment = buildSegment();
    const { client } = buildMock({
      outreach_campaigns: { data: [campaign], error: null },
      lead_segments: { data: [segment], error: null },
      outreach_campaign_recipients: {
        data: [{ campaign_id: "campaign-1" }, { campaign_id: "campaign-1" }],
        error: null,
      },
    });

    const result = await listOutreachCampaigns(client);

    expect(result).toEqual([{ ...campaign, segment, recipientsCount: 2 }]);
  });

  it("devuelve arreglo vacío si la consulta falla", async () => {
    const { client } = buildMock({
      outreach_campaigns: { data: null, error: { message: "db down" } },
    });

    const result = await listOutreachCampaigns(client);

    expect(result).toEqual([]);
  });
});

describe("listOutreachCampaignsForSegment", () => {
  it("solo devuelve las campañas del segmento indicado", async () => {
    const campaignA = buildCampaign({ id: "campaign-a", segment_id: "segment-a" });
    const campaignB = buildCampaign({ id: "campaign-b", segment_id: "segment-b" });
    const { client } = buildMock({
      outreach_campaigns: { data: [campaignA, campaignB], error: null },
      lead_segments: { data: [], error: null },
      outreach_campaign_recipients: { data: [], error: null },
    });

    const result = await listOutreachCampaignsForSegment(client, "segment-a");

    expect(result.map((c) => c.id)).toEqual(["campaign-a"]);
  });
});

describe("listRecentOutreachCampaigns", () => {
  it("acota al límite indicado", async () => {
    const campaigns = Array.from({ length: 8 }, (_, i) =>
      buildCampaign({ id: `campaign-${i}` }),
    );
    const { client } = buildMock({
      outreach_campaigns: { data: campaigns, error: null },
      lead_segments: { data: [], error: null },
      outreach_campaign_recipients: { data: [], error: null },
    });

    const result = await listRecentOutreachCampaigns(client, 3);

    expect(result).toHaveLength(3);
  });
});

describe("listCampaignRecipients", () => {
  it("enlaza cada recipient con su lead y tarea", async () => {
    const recipient = buildRecipient();
    const lead = buildLead();
    const task = buildTask();
    const { client, calls } = buildMock({
      outreach_campaign_recipients: { data: [recipient], error: null },
      leads: { data: [lead], error: null },
      follow_up_tasks: { data: [task], error: null },
    });

    const result = await listCampaignRecipients(client, "campaign-1");

    expect(calls["outreach_campaign_recipients.eq"]).toEqual([
      ["campaign_id", "campaign-1"],
    ]);
    expect(result).toEqual([{ ...recipient, lead, task }]);
  });

  it("descarta recipients cuyo lead ya no existe", async () => {
    const recipient = buildRecipient({ lead_id: "missing-lead" });
    const { client } = buildMock({
      outreach_campaign_recipients: { data: [recipient], error: null },
      leads: { data: [], error: null },
      follow_up_tasks: { data: [], error: null },
    });

    const result = await listCampaignRecipients(client, "campaign-1");

    expect(result).toEqual([]);
  });
});

describe("listCampaignsForLead", () => {
  it("devuelve las campañas donde el lead fue destinatario, con su status de recipient", async () => {
    const campaign = buildCampaign();
    const { client, calls } = buildMock({
      outreach_campaign_recipients: {
        data: [
          {
            campaign_id: "campaign-1",
            status: "task_created",
            created_at: "2026-07-01T00:00:00.000Z",
          },
        ],
        error: null,
      },
      outreach_campaigns: { data: [campaign], error: null },
    });

    const result = await listCampaignsForLead(client, "lead-1");

    expect(calls["outreach_campaign_recipients.eq"]).toEqual([["lead_id", "lead-1"]]);
    expect(calls["outreach_campaign_recipients.limit"]).toEqual([[5]]);
    expect(result).toEqual([
      {
        campaign,
        recipientStatus: "task_created",
        createdAt: "2026-07-01T00:00:00.000Z",
      },
    ]);
  });

  it("devuelve arreglo vacío si el lead nunca fue destinatario de ninguna campaña", async () => {
    const { client } = buildMock({
      outreach_campaign_recipients: { data: [], error: null },
    });

    const result = await listCampaignsForLead(client, "lead-1");

    expect(result).toEqual([]);
  });
});
