import { describe, expect, it, vi } from "vitest";
import {
  getPublicRecipeBySlug,
  listOtherPublicRecipes,
  listPublicRecipes,
} from "./queries";

function buildQueryMock(result: { data: unknown[] | null; error: unknown }) {
  const calls: Record<string, unknown[][]> = {
    select: [],
    order: [],
    limit: [],
    eq: [],
    neq: [],
    in: [],
  };

  const builder: Record<string, unknown> = {};
  for (const method of ["select", "order", "limit", "eq", "neq", "in"]) {
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

describe("listPublicRecipes", () => {
  it("solo pide recetas con status published", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listPublicRecipes(client);

    expect(calls.in).toEqual([["status", ["published"]]]);
  });

  it("ordena por published_at descendente", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listPublicRecipes(client);

    expect(calls.order).toEqual([["published_at", { ascending: false }]]);
  });

  it("devuelve arreglo vacío si Supabase falla", async () => {
    const { client } = buildQueryMock({
      data: null,
      error: { message: "db down" },
    });

    const result = await listPublicRecipes(client);

    expect(result).toEqual([]);
  });
});

describe("getPublicRecipeBySlug", () => {
  it("filtra por slug y status published", async () => {
    const { client, calls } = buildQueryMock({
      data: [{ id: "recipe-1" }],
      error: null,
    });

    await getPublicRecipeBySlug(client, "recipe-slug");

    expect(calls.eq).toEqual([["slug", "recipe-slug"]]);
    expect(calls.in).toEqual([["status", ["published"]]]);
  });

  it("devuelve null si no encuentra una receta publicada", async () => {
    const { client } = buildQueryMock({ data: [], error: null });

    const result = await getPublicRecipeBySlug(client, "recipe-slug");

    expect(result).toBeNull();
  });
});

describe("listOtherPublicRecipes", () => {
  it("excluye la receta actual y filtra por status published", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listOtherPublicRecipes(client, "recipe-1");

    expect(calls.neq).toEqual([["id", "recipe-1"]]);
    expect(calls.in).toEqual([["status", ["published"]]]);
  });
});
