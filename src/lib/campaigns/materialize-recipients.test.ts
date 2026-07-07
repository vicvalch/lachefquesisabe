import { describe, expect, it, vi } from "vitest";
import { materializeCampaignRecipients } from "./materialize-recipients";
import type { LeadRow, LeadSegmentRow, OutreachCampaignRow } from "@/types/database";

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
    ...overrides,
  };
}

function buildMock(sequences: Record<string, { data: unknown; error: unknown }[]>) {
  const callIndex: Record<string, number> = {};
  const calls: Record<string, unknown[][]> = {};

  const from = vi.fn((table: string) => {
    const seq = sequences[table];
    if (!seq) throw new Error(`Tabla inesperada: ${table}`);
    const idx = callIndex[table] ?? 0;
    callIndex[table] = idx + 1;
    const result = seq[Math.min(idx, seq.length - 1)];

    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "limit", "in", "insert", "update", "gte", "lte", "ilike"]) {
      builder[method] = vi.fn((...args: unknown[]) => {
        const key = `${table}.${method}`;
        calls[key] = calls[key] ?? [];
        calls[key].push(args);
        return builder;
      });
    }
    builder.maybeSingle = vi.fn(() => Promise.resolve(result));
    builder.single = vi.fn(() => Promise.resolve(result));
    (builder as { then: unknown }).then = (
      resolve: (value: typeof result) => void,
    ) => resolve(result);

    return builder;
  });

  return { client: { from } as never, calls };
}

describe("materializeCampaignRecipients", () => {
  it("crea recipients 'selected' sin crear follow_up_tasks", async () => {
    const lead1 = buildLead({ id: "lead-1" });
    const { client, calls } = buildMock({
      outreach_campaigns: [{ data: buildCampaign(), error: null }],
      lead_segments: [{ data: buildSegment(), error: null }],
      leads: [{ data: [lead1], error: null }],
      outreach_campaign_recipients: [
        { data: [], error: null },
        { data: null, error: null },
      ],
    });

    const result = await materializeCampaignRecipients(client, "campaign-1");

    expect(result).toEqual({ ok: true, createdCount: 1, skippedCount: 0 });
    expect(calls["outreach_campaign_recipients.insert"]).toEqual([
      [[{ campaign_id: "campaign-1", lead_id: "lead-1", status: "selected" }]],
    ]);
    expect(calls["follow_up_tasks.insert"]).toBeUndefined();
  });

  it("no duplica recipients ya existentes", async () => {
    const lead1 = buildLead({ id: "lead-1" });
    const lead2 = buildLead({ id: "lead-2" });
    const { client, calls } = buildMock({
      outreach_campaigns: [{ data: buildCampaign({ status: "ready" }), error: null }],
      lead_segments: [{ data: buildSegment(), error: null }],
      leads: [{ data: [lead1, lead2], error: null }],
      outreach_campaign_recipients: [
        { data: [{ lead_id: "lead-1" }], error: null },
        { data: null, error: null },
      ],
    });

    const result = await materializeCampaignRecipients(client, "campaign-1");

    expect(result).toEqual({ ok: true, createdCount: 1, skippedCount: 1 });
    expect(calls["outreach_campaign_recipients.insert"]).toEqual([
      [[{ campaign_id: "campaign-1", lead_id: "lead-2", status: "selected" }]],
    ]);
  });

  it("excluye leads sin consentimiento de contacto", async () => {
    const consented = buildLead({ id: "lead-consented", consent_contact: true });
    const notConsented = buildLead({ id: "lead-not-consented", consent_contact: false });
    const { client, calls } = buildMock({
      outreach_campaigns: [{ data: buildCampaign(), error: null }],
      lead_segments: [{ data: buildSegment(), error: null }],
      leads: [{ data: [consented, notConsented], error: null }],
      outreach_campaign_recipients: [
        { data: [], error: null },
        { data: null, error: null },
      ],
    });

    await materializeCampaignRecipients(client, "campaign-1");

    expect(calls["outreach_campaign_recipients.insert"]).toEqual([
      [[{ campaign_id: "campaign-1", lead_id: "lead-consented", status: "selected" }]],
    ]);
  });

  it("cambia campaign.status a ready cuando hay recipients y estaba en draft", async () => {
    const lead1 = buildLead({ id: "lead-1" });
    const { client, calls } = buildMock({
      outreach_campaigns: [{ data: buildCampaign({ status: "draft" }), error: null }],
      lead_segments: [{ data: buildSegment(), error: null }],
      leads: [{ data: [lead1], error: null }],
      outreach_campaign_recipients: [
        { data: [], error: null },
        { data: null, error: null },
      ],
    });

    await materializeCampaignRecipients(client, "campaign-1");

    expect(calls["outreach_campaigns.update"]).toEqual([[{ status: "ready" }]]);
  });

  it("no toca campaign.status si ya no está en draft (ej: tasks_created)", async () => {
    const lead1 = buildLead({ id: "lead-1" });
    const { client, calls } = buildMock({
      outreach_campaigns: [{ data: buildCampaign({ status: "tasks_created" }), error: null }],
      lead_segments: [{ data: buildSegment(), error: null }],
      leads: [{ data: [lead1], error: null }],
      outreach_campaign_recipients: [
        { data: [], error: null },
        { data: null, error: null },
      ],
    });

    await materializeCampaignRecipients(client, "campaign-1");

    expect(calls["outreach_campaigns.update"]).toBeUndefined();
  });

  it("devuelve error si la campaña no existe", async () => {
    const { client } = buildMock({
      outreach_campaigns: [{ data: null, error: null }],
    });

    const result = await materializeCampaignRecipients(client, "missing");

    expect(result).toEqual({ ok: false, error: "No se encontró la campaña." });
  });
});
