import { describe, expect, it, vi } from "vitest";
import {
  getPublicContentPostBySlug,
  listOtherPublicContentPosts,
  listPublicContentPosts,
} from "./queries";

function buildQueryMock(result: { data: unknown[] | null; error: unknown }) {
  const calls: Record<string, unknown[][]> = {
    select: [],
    order: [],
    limit: [],
    eq: [],
    neq: [],
    in: [],
    not: [],
    lte: [],
  };

  const builder: Record<string, unknown> = {};
  for (const method of [
    "select",
    "order",
    "limit",
    "eq",
    "neq",
    "in",
    "not",
    "lte",
  ]) {
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

describe("listPublicContentPosts", () => {
  it("solo pide posts con status published y published_at cumplido", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listPublicContentPosts(client);

    expect(calls.in).toEqual([["status", ["published"]]]);
    expect(calls.not).toEqual([["published_at", "is", null]]);
    expect(calls.lte).toHaveLength(1);
    expect(calls.lte[0][0]).toBe("published_at");
  });

  it("ordena por featured, luego published_at, luego created_at, todo descendente", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listPublicContentPosts(client);

    expect(calls.order).toEqual([
      ["featured", { ascending: false }],
      ["published_at", { ascending: false }],
      ["created_at", { ascending: false }],
    ]);
  });

  it("filtra por content_type cuando se pasa el filtro type", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listPublicContentPosts(client, { type: "tip" });

    expect(calls.eq).toContainEqual(["content_type", "tip"]);
  });

  it("devuelve arreglo vacío si Supabase falla", async () => {
    const { client } = buildQueryMock({
      data: null,
      error: { message: "db down" },
    });

    const result = await listPublicContentPosts(client);

    expect(result).toEqual([]);
  });
});

describe("getPublicContentPostBySlug", () => {
  it("filtra por slug, status published y published_at cumplido", async () => {
    const { client, calls } = buildQueryMock({
      data: [{ id: "post-1" }],
      error: null,
    });

    await getPublicContentPostBySlug(client, "post-slug");

    expect(calls.eq).toEqual([["slug", "post-slug"]]);
    expect(calls.in).toEqual([["status", ["published"]]]);
    expect(calls.not).toEqual([["published_at", "is", null]]);
  });

  it("devuelve null si no encuentra un post publicado", async () => {
    const { client } = buildQueryMock({ data: [], error: null });

    const result = await getPublicContentPostBySlug(client, "post-slug");

    expect(result).toBeNull();
  });
});

describe("listOtherPublicContentPosts", () => {
  it("excluye el post actual y filtra por status published", async () => {
    const { client, calls } = buildQueryMock({ data: [], error: null });

    await listOtherPublicContentPosts(client, "post-1");

    expect(calls.neq).toEqual([["id", "post-1"]]);
    expect(calls.in).toEqual([["status", ["published"]]]);
  });
});
