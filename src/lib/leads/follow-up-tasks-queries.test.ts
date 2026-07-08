import { describe, expect, it, vi } from "vitest";
import {
  listDueFollowUpTasks,
  listFollowUpTasksForLead,
  listOpenFollowUpTasks,
} from "./follow-up-tasks-queries";
import type { FollowUpTaskRow, LeadRow } from "@/types/database";

function buildTask(overrides: Partial<FollowUpTaskRow> = {}): FollowUpTaskRow {
  return {
    id: overrides.id ?? "task-1",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    lead_id: "lead-1",
    demo_event_id: null,
    contact_log_id: null,
    campaign_id: null,
    created_by: null,
    title: "Dar seguimiento",
    message_template_key: "recontacto-suave",
    status: "open",
    due_at: new Date(0).toISOString(),
    source: "manual",
    completed_at: null,
    notes: null,
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

function buildMock(tables: Record<string, { data: unknown; error: unknown }>) {
  const calls: Record<string, unknown[][]> = {};

  const from = vi.fn((table: string) => {
    const result = tables[table];
    if (!result) throw new Error(`Tabla inesperada: ${table}`);

    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "limit", "lte", "in"]) {
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

  return { client: { from } as never, from, calls };
}

describe("listOpenFollowUpTasks", () => {
  it("pide tareas open ordenadas por due_at y las enlaza con su lead", async () => {
    const task = buildTask();
    const lead = buildLead();
    const { client, calls } = buildMock({
      follow_up_tasks: { data: [task], error: null },
      leads: { data: [lead], error: null },
      demo_events: { data: [], error: null },
    });

    const result = await listOpenFollowUpTasks(client);

    expect(calls["follow_up_tasks.eq"]).toEqual([["status", "open"]]);
    expect(calls["follow_up_tasks.order"]).toEqual([["due_at", { ascending: true }]]);
    expect(calls["follow_up_tasks.limit"]).toEqual([[200]]);
    expect(result).toEqual([{ ...task, lead, demo: null }]);
  });

  it("descarta tareas cuyo lead ya no existe", async () => {
    const task = buildTask({ lead_id: "missing-lead" });
    const { client } = buildMock({
      follow_up_tasks: { data: [task], error: null },
      leads: { data: [], error: null },
      demo_events: { data: [], error: null },
    });

    const result = await listOpenFollowUpTasks(client);

    expect(result).toEqual([]);
  });

  it("devuelve arreglo vacío si la consulta de tareas falla", async () => {
    const { client } = buildMock({
      follow_up_tasks: { data: null, error: { message: "db down" } },
      leads: { data: [], error: null },
      demo_events: { data: [], error: null },
    });

    const result = await listOpenFollowUpTasks(client);

    expect(result).toEqual([]);
  });
});

describe("listDueFollowUpTasks", () => {
  it("filtra por due_at <= ahora y respeta el límite", async () => {
    const { client, calls } = buildMock({
      follow_up_tasks: { data: [], error: null },
      leads: { data: [], error: null },
      demo_events: { data: [], error: null },
    });

    await listDueFollowUpTasks(client, 3);

    expect(calls["follow_up_tasks.eq"]).toEqual([["status", "open"]]);
    expect(calls["follow_up_tasks.limit"]).toEqual([[3]]);
    expect(calls["follow_up_tasks.lte"]).toHaveLength(1);
    expect(calls["follow_up_tasks.lte"][0][0]).toBe("due_at");
  });
});

describe("listFollowUpTasksForLead", () => {
  it("devuelve las tareas del lead ordenadas por due_at descendente, con su demo si aplica", async () => {
    const task = buildTask({ demo_event_id: "demo-1" });
    const { client, calls } = buildMock({
      follow_up_tasks: { data: [task], error: null },
      demo_events: {
        data: [{ id: "demo-1", title: "Demo de recetas" }],
        error: null,
      },
    });

    const result = await listFollowUpTasksForLead(client, "lead-1");

    expect(calls["follow_up_tasks.eq"]).toEqual([["lead_id", "lead-1"]]);
    expect(calls["follow_up_tasks.order"]).toEqual([
      ["due_at", { ascending: false }],
    ]);
    expect(result).toEqual([
      { ...task, demo: { id: "demo-1", title: "Demo de recetas" } },
    ]);
  });

  it("no consulta demo_events si ninguna tarea tiene demo_event_id", async () => {
    const task = buildTask();
    const { client, calls } = buildMock({
      follow_up_tasks: { data: [task], error: null },
      demo_events: { data: [], error: null },
    });

    const result = await listFollowUpTasksForLead(client, "lead-1");

    expect(calls["demo_events.in"]).toBeUndefined();
    expect(result).toEqual([{ ...task, demo: null }]);
  });
});
