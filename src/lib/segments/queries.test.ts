import { describe, expect, it, vi } from "vitest";
import { listLeadsMatchingSegment } from "./queries";
import type { LeadRow, LeadSegmentRow } from "@/types/database";

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

function buildMock(tables: Record<string, { data: unknown; error: unknown }>) {
  const calls: Record<string, unknown[][]> = {};

  const from = vi.fn((table: string) => {
    const result = tables[table];
    if (!result) throw new Error(`Tabla inesperada: ${table}`);

    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "limit", "gte", "lte", "in"]) {
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

describe("listLeadsMatchingSegment", () => {
  it("siempre exige consent_contact = true, incluso sin otros filtros", async () => {
    const { client, calls } = buildMock({
      leads: { data: [], error: null },
    });

    await listLeadsMatchingSegment(client, buildSegment());

    expect(calls["leads.eq"]).toContainEqual(["consent_contact", true]);
    expect(calls["leads.in"]).toBeUndefined();
  });

  it("aplica in() para statuses e intereses cuando el segmento los define", async () => {
    const { client, calls } = buildMock({
      leads: { data: [], error: null },
    });

    await listLeadsMatchingSegment(
      client,
      buildSegment({
        filter_statuses: ["new", "interested"],
        filter_primary_interests: ["virtual_demo"],
      }),
    );

    expect(calls["leads.in"]).toContainEqual(["status", ["new", "interested"]]);
    expect(calls["leads.in"]).toContainEqual(["primary_interest", ["virtual_demo"]]);
  });

  it("aplica eq de source y gte/lte de fecha cuando el segmento los define", async () => {
    const { client, calls } = buildMock({
      leads: { data: [], error: null },
    });

    await listLeadsMatchingSegment(
      client,
      buildSegment({
        filter_source: "landing",
        filter_created_after: "2026-06-01T00:00:00.000Z",
        filter_created_before: "2026-06-30T23:59:59.999Z",
      }),
    );

    expect(calls["leads.eq"]).toContainEqual(["source", "landing"]);
    expect(calls["leads.gte"]).toContainEqual([
      "created_at",
      "2026-06-01T00:00:00.000Z",
    ]);
    expect(calls["leads.lte"]).toContainEqual([
      "created_at",
      "2026-06-30T23:59:59.999Z",
    ]);
  });

  it("sin filtro de tarea abierta (null), no consulta follow_up_tasks", async () => {
    const lead = buildLead();
    const { client, calls } = buildMock({
      leads: { data: [lead], error: null },
    });

    const result = await listLeadsMatchingSegment(client, buildSegment());

    expect(result).toEqual([lead]);
    expect(calls["follow_up_tasks.eq"]).toBeUndefined();
  });

  it("filter_has_open_task = true: solo devuelve leads con tarea open", async () => {
    const withTask = buildLead({ id: "lead-with-task" });
    const withoutTask = buildLead({ id: "lead-without-task" });
    const { client } = buildMock({
      leads: { data: [withTask, withoutTask], error: null },
      follow_up_tasks: { data: [{ lead_id: "lead-with-task" }], error: null },
    });

    const result = await listLeadsMatchingSegment(
      client,
      buildSegment({ filter_has_open_task: true }),
    );

    expect(result).toEqual([withTask]);
  });

  it("filter_has_open_task = false: solo devuelve leads sin tarea open", async () => {
    const withTask = buildLead({ id: "lead-with-task" });
    const withoutTask = buildLead({ id: "lead-without-task" });
    const { client } = buildMock({
      leads: { data: [withTask, withoutTask], error: null },
      follow_up_tasks: { data: [{ lead_id: "lead-with-task" }], error: null },
    });

    const result = await listLeadsMatchingSegment(
      client,
      buildSegment({ filter_has_open_task: false }),
    );

    expect(result).toEqual([withoutTask]);
  });

  it("devuelve arreglo vacío si la consulta de leads falla", async () => {
    const { client } = buildMock({
      leads: { data: null, error: { message: "db down" } },
    });

    const result = await listLeadsMatchingSegment(client, buildSegment());

    expect(result).toEqual([]);
  });

  it("respeta el límite personalizado", async () => {
    const { client, calls } = buildMock({
      leads: { data: [], error: null },
    });

    await listLeadsMatchingSegment(client, buildSegment(), 25);

    expect(calls["leads.limit"]).toEqual([[25]]);
  });
});
