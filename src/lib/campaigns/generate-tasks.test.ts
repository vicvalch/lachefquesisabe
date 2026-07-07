import { describe, expect, it, vi } from "vitest";
import { generateCampaignTasks } from "./generate-tasks";
import type { LeadRow, LeadSegmentRow, OutreachCampaignRow } from "@/types/database";

function buildCampaign(overrides: Partial<OutreachCampaignRow> = {}): OutreachCampaignRow {
  return {
    id: "campaign-1",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    created_by: null,
    segment_id: "segment-1",
    message_template_key: "recontacto-suave",
    name: "Campaña de julio",
    notes: null,
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
    filter_statuses: [],
    filter_primary_interests: [],
    filter_source: null,
    filter_created_after: null,
    filter_created_before: null,
    filter_has_open_task: null,
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

/**
 * Cada tabla puede recibir varias llamadas a `from` durante el flujo
 * (por ejemplo outreach_campaign_recipients: primero un select, luego un
 * insert); `sequences[table]` es un arreglo consumido en orden de llamada.
 */
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
    for (const method of ["select", "eq", "order", "limit", "in", "insert"]) {
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

describe("generateCampaignTasks", () => {
  it("crea tareas solo para los leads nuevos y las registra como recipients", async () => {
    const lead1 = buildLead({ id: "lead-1" });
    const lead2 = buildLead({ id: "lead-2" });
    const { client, calls } = buildMock({
      outreach_campaigns: [{ data: buildCampaign(), error: null }],
      lead_segments: [{ data: buildSegment(), error: null }],
      leads: [{ data: [lead1, lead2], error: null }],
      outreach_campaign_recipients: [
        { data: [{ lead_id: "lead-1" }], error: null },
        { data: null, error: null },
      ],
      follow_up_tasks: [
        { data: [{ id: "task-2", lead_id: "lead-2" }], error: null },
      ],
    });

    const result = await generateCampaignTasks(
      client,
      "campaign-1",
      "2026-08-01T10:00:00.000Z",
      "user-1",
    );

    expect(result).toEqual({ ok: true, createdCount: 1, skippedCount: 1 });
    expect(calls["follow_up_tasks.insert"]).toEqual([
      [
        [
          {
            lead_id: "lead-2",
            campaign_id: "campaign-1",
            title: "Campaña: Campaña de julio",
            message_template_key: "recontacto-suave",
            due_at: "2026-08-01T10:00:00.000Z",
            source: "campaign",
            created_by: "user-1",
          },
        ],
      ],
    ]);
    expect(calls["outreach_campaign_recipients.insert"]).toEqual([
      [
        [
          {
            campaign_id: "campaign-1",
            lead_id: "lead-2",
            follow_up_task_id: "task-2",
          },
        ],
      ],
    ]);
  });

  it("cuando todos los leads del segmento ya tienen tarea, no inserta nada", async () => {
    const lead1 = buildLead({ id: "lead-1" });
    const { client } = buildMock({
      outreach_campaigns: [{ data: buildCampaign(), error: null }],
      lead_segments: [{ data: buildSegment(), error: null }],
      leads: [{ data: [lead1], error: null }],
      outreach_campaign_recipients: [
        { data: [{ lead_id: "lead-1" }], error: null },
      ],
    });

    const result = await generateCampaignTasks(
      client,
      "campaign-1",
      "2026-08-01T10:00:00.000Z",
      "user-1",
    );

    expect(result).toEqual({ ok: true, createdCount: 0, skippedCount: 1 });
  });

  it("devuelve error si la campaña no existe", async () => {
    const { client } = buildMock({
      outreach_campaigns: [{ data: null, error: null }],
    });

    const result = await generateCampaignTasks(
      client,
      "campaign-missing",
      "2026-08-01T10:00:00.000Z",
      null,
    );

    expect(result).toEqual({ ok: false, error: "No se encontró la campaña." });
  });

  it("devuelve error si el segmento de la campaña ya no existe", async () => {
    const { client } = buildMock({
      outreach_campaigns: [{ data: buildCampaign(), error: null }],
      lead_segments: [{ data: null, error: null }],
    });

    const result = await generateCampaignTasks(
      client,
      "campaign-1",
      "2026-08-01T10:00:00.000Z",
      null,
    );

    expect(result).toEqual({
      ok: false,
      error: "No se encontró el segmento de esta campaña.",
    });
  });

  it("propaga el error si falla la inserción de tareas", async () => {
    const lead1 = buildLead({ id: "lead-1" });
    const { client } = buildMock({
      outreach_campaigns: [{ data: buildCampaign(), error: null }],
      lead_segments: [{ data: buildSegment(), error: null }],
      leads: [{ data: [lead1], error: null }],
      outreach_campaign_recipients: [{ data: [], error: null }],
      follow_up_tasks: [{ data: null, error: { message: "insert failed" } }],
    });

    const result = await generateCampaignTasks(
      client,
      "campaign-1",
      "2026-08-01T10:00:00.000Z",
      null,
    );

    expect(result).toEqual({ ok: false, error: "insert failed" });
  });
});
