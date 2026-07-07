import { describe, expect, it, vi } from "vitest";
import { listFollowUpTasks, listLeads } from "./queries";

function buildQueryMock(result: { data: unknown[] | null; error: unknown }) {
  const calls: Record<string, unknown[][]> = {
    select: [],
    order: [],
    limit: [],
    eq: [],
    not: [],
  };

  const builder: Record<string, unknown> = {};
  for (const method of ["select", "order", "limit", "eq", "not"]) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls[method].push(args);
      return builder;
    });
  }
  // El builder real de Supabase es "thenable": awaitarlo resuelve { data, error }.
  (builder as { then: unknown }).then = (
    resolve: (value: typeof result) => void,
  ) => resolve(result);

  const from = vi.fn().mockReturnValue(builder);
  return { client: { from } as never, from, calls };
}

describe("listLeads", () => {
  it("sin filtros: ordena por created_at desc y limita a 50", async () => {
    const { client, from, calls } = buildQueryMock({ data: [], error: null });

    await listLeads(client);

    expect(from).toHaveBeenCalledWith("leads");
    expect(calls.order).toEqual([["created_at", { ascending: false }]]);
    expect(calls.limit).toEqual([[50]]);
    expect(calls.eq).toEqual([]);
  });

  it("filtra por status cuando se indica", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listLeads(client, { status: "new" });

    expect(calls.eq).toContainEqual(["status", "new"]);
  });

  it("filtra por interest (primary_interest) cuando se indica", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listLeads(client, { interest: "buy_thermomix" });

    expect(calls.eq).toContainEqual(["primary_interest", "buy_thermomix"]);
  });

  it("combina status e interest y respeta un límite custom", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listLeads(client, {
      status: "contacted",
      interest: "buy_thermomix",
      limit: 10,
    });

    expect(calls.eq).toContainEqual(["status", "contacted"]);
    expect(calls.eq).toContainEqual(["primary_interest", "buy_thermomix"]);
    expect(calls.limit).toEqual([[10]]);
  });

  it("devuelve arreglo vacío si Supabase falla", async () => {
    const { client } = buildQueryMock({
      data: null,
      error: { message: "db down" },
    });

    const result = await listLeads(client);

    expect(result).toEqual([]);
  });
});

describe("listFollowUpTasks", () => {
  it("pide leads con next_follow_up_at no nulo, ordenados ascendente y limitados a 200", async () => {
    const { client, from, calls } = buildQueryMock({ data: [], error: null });

    await listFollowUpTasks(client);

    expect(from).toHaveBeenCalledWith("leads");
    expect(calls.not).toEqual([["next_follow_up_at", "is", null]]);
    expect(calls.order).toEqual([["next_follow_up_at", { ascending: true }]]);
    expect(calls.limit).toEqual([[200]]);
  });

  it("respeta un límite custom", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listFollowUpTasks(client, 20);

    expect(calls.limit).toEqual([[20]]);
  });

  it("devuelve arreglo vacío si Supabase falla", async () => {
    const { client } = buildQueryMock({
      data: null,
      error: { message: "db down" },
    });

    const result = await listFollowUpTasks(client);

    expect(result).toEqual([]);
  });
});
