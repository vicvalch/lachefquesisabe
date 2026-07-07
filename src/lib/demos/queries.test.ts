import { describe, expect, it, vi } from "vitest";
import { getPublicDemoEventBySlug, listPublicUpcomingDemoEvents } from "./queries";

function buildQueryMock(result: { data: unknown[] | null; error: unknown }) {
  const calls: Record<string, unknown[][]> = {
    select: [],
    order: [],
    limit: [],
    eq: [],
    in: [],
    gte: [],
  };

  const builder: Record<string, unknown> = {};
  for (const method of ["select", "order", "limit", "eq", "in", "gte"]) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls[method].push(args);
      return builder;
    });
  }
  builder.maybeSingle = vi.fn().mockResolvedValue(
    result.data ? { data: result.data[0] ?? null, error: result.error } : result,
  );
  // El builder real de Supabase es "thenable": awaitarlo resuelve { data, error }.
  (builder as { then: unknown }).then = (
    resolve: (value: typeof result) => void,
  ) => resolve(result);

  const from = vi.fn().mockReturnValue(builder);
  return { client: { from } as never, from, calls, builder };
}

describe("listPublicUpcomingDemoEvents", () => {
  it("solo pide demos con status scheduled/full", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listPublicUpcomingDemoEvents(client);

    expect(calls.in).toEqual([["status", ["scheduled", "full"]]]);
  });

  it("excluye draft, completed y cancelled del filtro de status", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listPublicUpcomingDemoEvents(client);

    const [, statuses] = calls.in[0];
    expect(statuses as string[]).not.toContain("draft");
    expect(statuses as string[]).not.toContain("completed");
    expect(statuses as string[]).not.toContain("cancelled");
  });

  it("solo pide demos con starts_at futuro y ordena ascendente", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listPublicUpcomingDemoEvents(client);

    expect(calls.gte).toHaveLength(1);
    expect(calls.gte[0][0]).toBe("starts_at");
    expect(calls.order).toEqual([["starts_at", { ascending: true }]]);
  });

  it("devuelve arreglo vacío si Supabase falla", async () => {
    const { client } = buildQueryMock({
      data: null,
      error: { message: "db down" },
    });

    const result = await listPublicUpcomingDemoEvents(client);

    expect(result).toEqual([]);
  });
});

describe("getPublicDemoEventBySlug", () => {
  it("filtra por slug, status público y fecha futura", async () => {
    const { client, calls } = buildQueryMock({
      data: [{ id: "demo-1" }],
      error: null,
    });

    await getPublicDemoEventBySlug(client, "demo-slug");

    expect(calls.eq).toEqual([["slug", "demo-slug"]]);
    expect(calls.in).toEqual([["status", ["scheduled", "full"]]]);
    expect(calls.gte).toHaveLength(1);
  });

  it("devuelve null si no encuentra una demo visible", async () => {
    const { client } = buildQueryMock({ data: [], error: null });

    const result = await getPublicDemoEventBySlug(client, "demo-slug");

    expect(result).toBeNull();
  });
});
