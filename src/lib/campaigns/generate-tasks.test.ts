import { describe, expect, it, vi } from "vitest";
import { generateFollowUpTasksForCampaign } from "./generate-tasks";
import type { MessageTemplateRow, OutreachCampaignRow } from "@/types/database";

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
    status: "ready",
    task_type: "whatsapp",
    task_priority: "medium",
    task_title: null,
    task_notes: "Contactar con cuidado",
    due_at: "2026-08-01T10:00:00.000Z",
    ...overrides,
  };
}

function buildTemplate(overrides: Partial<MessageTemplateRow> = {}): MessageTemplateRow {
  return {
    id: "template-1",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    key: "recontacto-suave",
    label: "Recontacto suave",
    body: "Hola {{name}}",
    is_active: true,
    ...overrides,
  };
}

/**
 * Cada tabla puede recibir varias llamadas durante el flujo; `sequences[table]`
 * es un arreglo consumido en orden (el último valor se reutiliza si hay
 * más llamadas que entradas, útil para las N actualizaciones de recipients).
 */
function buildMock(sequences: Record<string, { data: unknown; error: unknown; count?: number }[]>) {
  const callIndex: Record<string, number> = {};
  const calls: Record<string, unknown[][]> = {};

  const from = vi.fn((table: string) => {
    const seq = sequences[table];
    if (!seq) throw new Error(`Tabla inesperada: ${table}`);
    const idx = callIndex[table] ?? 0;
    callIndex[table] = idx + 1;
    const result = seq[Math.min(idx, seq.length - 1)];

    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "is", "order", "limit", "in", "insert", "update"]) {
      builder[method] = vi.fn((...args: unknown[]) => {
        const key = `${table}.${method}`;
        calls[key] = calls[key] ?? [];
        calls[key].push(args);
        return builder;
      });
    }
    builder.maybeSingle = vi.fn(() => Promise.resolve(result));
    (builder as { then: unknown }).then = (
      resolve: (value: typeof result) => void,
    ) => resolve(result);

    return builder;
  });

  return { client: { from } as never, calls };
}

describe("generateFollowUpTasksForCampaign", () => {
  it("crea follow_up_tasks desde los recipients 'selected' y actualiza cada uno a task_created con su follow_up_task_id", async () => {
    const { client, calls } = buildMock({
      outreach_campaigns: [{ data: buildCampaign(), error: null }],
      message_templates: [{ data: buildTemplate(), error: null }],
      outreach_campaign_recipients: [
        {
          data: [
            { id: "recipient-1", lead_id: "lead-1" },
            { id: "recipient-2", lead_id: "lead-2" },
          ],
          error: null,
        },
        { data: null, error: null, count: 0 },
        { data: null, error: null },
      ],
      follow_up_tasks: [
        {
          data: [
            { id: "task-1", lead_id: "lead-1" },
            { id: "task-2", lead_id: "lead-2" },
          ],
          error: null,
        },
      ],
    });

    const result = await generateFollowUpTasksForCampaign(client, "campaign-1", "user-1");

    expect(result).toEqual({ ok: true, createdCount: 2, skippedCount: 0 });

    expect(calls["outreach_campaign_recipients.eq"]).toContainEqual(["status", "selected"]);
    expect(calls["outreach_campaign_recipients.is"]).toContainEqual([
      "follow_up_task_id",
      null,
    ]);

    expect(calls["follow_up_tasks.insert"][0][0]).toEqual([
      {
        lead_id: "lead-1",
        campaign_id: "campaign-1",
        title: "Contactar: Campaña de julio",
        message_template_key: "recontacto-suave",
        due_at: "2026-08-01T10:00:00.000Z",
        source: "campaign",
        notes: "Contactar con cuidado",
        created_by: "user-1",
      },
      {
        lead_id: "lead-2",
        campaign_id: "campaign-1",
        title: "Contactar: Campaña de julio",
        message_template_key: "recontacto-suave",
        due_at: "2026-08-01T10:00:00.000Z",
        source: "campaign",
        notes: "Contactar con cuidado",
        created_by: "user-1",
      },
    ]);

    expect(calls["outreach_campaign_recipients.update"]).toContainEqual([
      { status: "task_created", follow_up_task_id: "task-1" },
    ]);
    expect(calls["outreach_campaign_recipients.update"]).toContainEqual([
      { status: "task_created", follow_up_task_id: "task-2" },
    ]);
  });

  it("cambia campaign.status a tasks_created", async () => {
    const { client, calls } = buildMock({
      outreach_campaigns: [{ data: buildCampaign({ status: "ready" }), error: null }],
      message_templates: [{ data: buildTemplate(), error: null }],
      outreach_campaign_recipients: [
        { data: [{ id: "recipient-1", lead_id: "lead-1" }], error: null },
        { data: null, error: null, count: 0 },
        { data: null, error: null },
      ],
      follow_up_tasks: [
        { data: [{ id: "task-1", lead_id: "lead-1" }], error: null },
      ],
    });

    await generateFollowUpTasksForCampaign(client, "campaign-1", null);

    expect(calls["outreach_campaigns.update"]).toEqual([[{ status: "tasks_created" }]]);
  });

  it("no duplica tareas: si no hay recipients 'selected' sin tarea, no llama a follow_up_tasks.insert", async () => {
    const { client, calls } = buildMock({
      outreach_campaigns: [{ data: buildCampaign(), error: null }],
      message_templates: [{ data: buildTemplate(), error: null }],
      outreach_campaign_recipients: [
        { data: [], error: null },
        { data: null, error: null, count: 3 },
      ],
    });

    const result = await generateFollowUpTasksForCampaign(client, "campaign-1", null);

    expect(result).toEqual({ ok: true, createdCount: 0, skippedCount: 3 });
    expect(calls["follow_up_tasks.insert"]).toBeUndefined();
    expect(calls["outreach_campaigns.update"]).toBeUndefined();
  });

  it("solo lee de outreach_campaign_recipients: nunca recalcula el segmento ni acepta un lead_id por parámetro", async () => {
    // No se provee "lead_segments" ni "leads" en el mock: si la función
    // intentara volver a calcular el segmento (en vez de leer los
    // recipients ya materializados), este test fallaría con "Tabla
    // inesperada". La firma de generateFollowUpTasksForCampaign tampoco
    // acepta ningún lead_id/lista de leads como argumento.
    const { client } = buildMock({
      outreach_campaigns: [{ data: buildCampaign(), error: null }],
      message_templates: [{ data: buildTemplate(), error: null }],
      outreach_campaign_recipients: [
        { data: [{ id: "recipient-1", lead_id: "lead-1" }], error: null },
        { data: null, error: null, count: 0 },
        { data: null, error: null },
      ],
      follow_up_tasks: [
        { data: [{ id: "task-1", lead_id: "lead-1" }], error: null },
      ],
    });

    const result = await generateFollowUpTasksForCampaign(client, "campaign-1", null);

    expect(result.ok).toBe(true);
    expect(generateFollowUpTasksForCampaign.length).toBe(3);
  });

  it("devuelve error si la campaña no existe", async () => {
    const { client } = buildMock({
      outreach_campaigns: [{ data: null, error: null }],
    });

    const result = await generateFollowUpTasksForCampaign(client, "missing", null);

    expect(result).toEqual({ ok: false, error: "No se encontró la campaña." });
  });
});
