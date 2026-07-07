import { describe, expect, it, vi } from "vitest";
import { listLeadsMatchingCriteria } from "./queries";
import type { LeadRow } from "@/types/database";

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
 * `tables[table]` puede ser un único resultado (se reutiliza en todas las
 * llamadas a esa tabla) o un arreglo (una entrada por llamada, en orden —
 * necesario para `leads` cuando `search` dispara 3 consultas separadas).
 */
function buildMock(
  tables: Record<string, { data: unknown; error: unknown } | { data: unknown; error: unknown }[]>,
) {
  const callIndex: Record<string, number> = {};
  const calls: Record<string, unknown[][]> = {};

  const from = vi.fn((table: string) => {
    const config = tables[table];
    if (!config) throw new Error(`Tabla inesperada: ${table}`);
    const sequence = Array.isArray(config) ? config : [config];
    const idx = callIndex[table] ?? 0;
    callIndex[table] = idx + 1;
    const result = sequence[Math.min(idx, sequence.length - 1)];

    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "in", "gte", "lte", "ilike", "order", "limit"]) {
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

describe("listLeadsMatchingCriteria", () => {
  it("con criterio vacío, no aplica ningún filtro de columna (consent_contact ya no es implícito)", async () => {
    const { client, calls } = buildMock({ leads: { data: [], error: null } });

    await listLeadsMatchingCriteria(client, {});

    expect(calls["leads.eq"]).toBeUndefined();
    expect(calls["leads.in"]).toBeUndefined();
  });

  it("aplica consent_contact solo cuando el criterio lo especifica", async () => {
    const { client, calls } = buildMock({ leads: { data: [], error: null } });

    await listLeadsMatchingCriteria(client, { consent_contact: true });

    expect(calls["leads.eq"]).toContainEqual(["consent_contact", true]);
  });

  it("aplica in() para statuses, primary_interests y sources", async () => {
    const { client, calls } = buildMock({ leads: { data: [], error: null } });

    await listLeadsMatchingCriteria(client, {
      statuses: ["new", "interested"],
      primary_interests: ["virtual_demo"],
      sources: ["landing", "demo"],
    });

    expect(calls["leads.in"]).toContainEqual(["status", ["new", "interested"]]);
    expect(calls["leads.in"]).toContainEqual(["primary_interest", ["virtual_demo"]]);
    expect(calls["leads.in"]).toContainEqual(["source", ["landing", "demo"]]);
  });

  it("aplica gte/lte para created_from/to, last_contacted y next_follow_up", async () => {
    const { client, calls } = buildMock({ leads: { data: [], error: null } });

    await listLeadsMatchingCriteria(client, {
      created_from: "2026-06-01T00:00:00.000Z",
      created_to: "2026-06-30T23:59:59.999Z",
      last_contacted_after: "2026-05-01T00:00:00.000Z",
      last_contacted_before: "2026-05-31T23:59:59.999Z",
      next_follow_up_after: "2026-07-01T00:00:00.000Z",
      next_follow_up_before: "2026-07-31T23:59:59.999Z",
    });

    expect(calls["leads.gte"]).toContainEqual(["created_at", "2026-06-01T00:00:00.000Z"]);
    expect(calls["leads.lte"]).toContainEqual(["created_at", "2026-06-30T23:59:59.999Z"]);
    expect(calls["leads.gte"]).toContainEqual(["last_contacted_at", "2026-05-01T00:00:00.000Z"]);
    expect(calls["leads.lte"]).toContainEqual(["last_contacted_at", "2026-05-31T23:59:59.999Z"]);
    expect(calls["leads.gte"]).toContainEqual(["next_follow_up_at", "2026-07-01T00:00:00.000Z"]);
    expect(calls["leads.lte"]).toContainEqual(["next_follow_up_at", "2026-07-31T23:59:59.999Z"]);
  });

  it("has_open_follow_up_task = true solo devuelve leads con tarea open", async () => {
    const withTask = buildLead({ id: "lead-with-task" });
    const withoutTask = buildLead({ id: "lead-without-task" });
    const { client } = buildMock({
      leads: { data: [withTask, withoutTask], error: null },
      follow_up_tasks: { data: [{ lead_id: "lead-with-task" }], error: null },
    });

    const result = await listLeadsMatchingCriteria(client, {
      has_open_follow_up_task: true,
    });

    expect(result).toEqual([withTask]);
  });

  it("has_open_follow_up_task = false solo devuelve leads sin tarea open", async () => {
    const withTask = buildLead({ id: "lead-with-task" });
    const withoutTask = buildLead({ id: "lead-without-task" });
    const { client } = buildMock({
      leads: { data: [withTask, withoutTask], error: null },
      follow_up_tasks: { data: [{ lead_id: "lead-with-task" }], error: null },
    });

    const result = await listLeadsMatchingCriteria(client, {
      has_open_follow_up_task: false,
    });

    expect(result).toEqual([withoutTask]);
  });

  it("demo_event_id y demo_attendance_statuses restringen a leads inscritos", async () => {
    const registered = buildLead({ id: "lead-registered" });
    const notRegistered = buildLead({ id: "lead-not-registered" });
    const { client, calls } = buildMock({
      leads: { data: [registered, notRegistered], error: null },
      demo_registrations: { data: [{ lead_id: "lead-registered" }], error: null },
    });

    const result = await listLeadsMatchingCriteria(client, {
      demo_event_id: "demo-1",
      demo_attendance_statuses: ["confirmed", "attended"],
    });

    expect(calls["demo_registrations.eq"]).toContainEqual(["demo_event_id", "demo-1"]);
    expect(calls["demo_registrations.in"]).toContainEqual([
      "attendance_status",
      ["confirmed", "attended"],
    ]);
    expect(result).toEqual([registered]);
  });

  it("content_post_id filtra por source = content:<slug>", async () => {
    const { client, calls } = buildMock({
      leads: { data: [], error: null },
      content_posts: { data: { slug: "receta-de-arroz" }, error: null },
    });

    await listLeadsMatchingCriteria(client, {
      content_post_id: "post-1",
    });

    expect(calls["content_posts.eq"]).toContainEqual(["id", "post-1"]);
    expect(calls["leads.eq"]).toContainEqual(["source", "content:receta-de-arroz"]);
  });

  it("content_post_id de un post inexistente devuelve arreglo vacío sin consultar leads", async () => {
    const { client } = buildMock({
      leads: { data: [buildLead()], error: null },
      content_posts: { data: null, error: null },
    });

    const result = await listLeadsMatchingCriteria(client, {
      content_post_id: "post-missing",
    });

    expect(result).toEqual([]);
  });

  it("search consulta name/email/phone por separado y mezcla sin duplicar", async () => {
    const leadA = buildLead({ id: "lead-a", created_at: "2026-01-01T00:00:00.000Z" });
    const leadB = buildLead({ id: "lead-b", created_at: "2026-02-01T00:00:00.000Z" });
    const { client, calls } = buildMock({
      leads: [
        { data: [leadA], error: null },
        { data: [leadB], error: null },
        { data: [leadA], error: null },
      ],
    });

    const result = await listLeadsMatchingCriteria(client, { search: "ana" });

    expect(calls["leads.ilike"]).toEqual([
      ["name", "%ana%"],
      ["email", "%ana%"],
      ["phone", "%ana%"],
    ]);
    expect(result.map((lead) => lead.id).sort()).toEqual(["lead-a", "lead-b"]);
  });

  it("escapa % y _ en el término de búsqueda antes de armar el patrón ILIKE", async () => {
    const { client, calls } = buildMock({ leads: { data: [], error: null } });

    await listLeadsMatchingCriteria(client, { search: "50%_off" });

    expect(calls["leads.ilike"][0]).toEqual(["name", "%50\\%\\_off%"]);
  });

  it("por defecto acota el preview a 50 y escala el fetch interno con un límite mayor", async () => {
    const { client, calls } = buildMock({ leads: { data: [], error: null } });

    await listLeadsMatchingCriteria(client, {});
    expect(calls["leads.limit"]).toEqual([[500]]);

    await listLeadsMatchingCriteria(client, {}, 2000);
    expect(calls["leads.limit"]).toContainEqual([2000]);
  });

  it("devuelve como mucho `limit` leads", async () => {
    const leads = Array.from({ length: 5 }, (_, i) => buildLead({ id: `lead-${i}` }));
    const { client } = buildMock({ leads: { data: leads, error: null } });

    const result = await listLeadsMatchingCriteria(client, {}, 3);

    expect(result).toHaveLength(3);
  });
});
