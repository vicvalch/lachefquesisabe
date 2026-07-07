import { describe, expect, it, vi } from "vitest";
import { createContentPost } from "./create-content-post";
import type { ContentPostInput } from "@/lib/validations/content-post";

const validInput: ContentPostInput = {
  title: "Arroz con pollo en 20 minutos",
  content_type: "recipe",
  status: "draft",
  category_id: null,
  excerpt: "",
  body: "Una receta rápida y fácil para el día a día.",
  ingredients: "",
  instructions: "",
  prep_time_minutes: 20,
  cook_time_minutes: null,
  servings: 4,
  difficulty: "easy",
  image_url: "",
  seo_title: "",
  seo_description: "",
  featured: false,
};

function buildSupabaseMock(options: {
  existingSlugs?: Set<string>;
  insertResult: {
    data: { id: string; slug: string } | null;
    error: { message: string; code?: string } | null;
  };
}) {
  const existingSlugs = options.existingSlugs ?? new Set<string>();

  const select = vi.fn().mockReturnValue({
    eq: vi.fn((_column: string, value: string) => ({
      maybeSingle: vi.fn().mockResolvedValue({
        data: existingSlugs.has(value) ? { id: "existing" } : null,
        error: null,
      }),
    })),
  });

  const insertSelect = vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue(options.insertResult),
  });
  const insert = vi.fn().mockReturnValue({ select: insertSelect });

  const from = vi.fn().mockReturnValue({ select, insert });

  return { client: { from } as never, from, select, insert };
}

describe("createContentPost", () => {
  it("inserta el post con created_by desde la sesión y un slug generado", async () => {
    const { client, from, insert } = buildSupabaseMock({
      insertResult: {
        data: { id: "post-1", slug: "arroz-con-pollo-en-20-minutos" },
        error: null,
      },
    });

    const result = await createContentPost(client, "user-1", validInput);

    expect(result).toEqual({
      ok: true,
      id: "post-1",
      slug: "arroz-con-pollo-en-20-minutos",
    });
    expect(from).toHaveBeenCalledWith("content_posts");
    const payload = insert.mock.calls[0][0];
    expect(payload).toMatchObject({
      created_by: "user-1",
      category_id: null,
      title: "Arroz con pollo en 20 minutos",
      slug: "arroz-con-pollo-en-20-minutos",
      content_type: "recipe",
      status: "draft",
      published_at: null,
      excerpt: null,
      body: "Una receta rápida y fácil para el día a día.",
      prep_time_minutes: 20,
      cook_time_minutes: null,
      servings: 4,
      difficulty: "easy",
      featured: false,
    });
  });

  it("agrega un sufijo -2 cuando el slug base ya existe", async () => {
    const { client, insert } = buildSupabaseMock({
      existingSlugs: new Set(["arroz-con-pollo-en-20-minutos"]),
      insertResult: {
        data: { id: "post-1", slug: "arroz-con-pollo-en-20-minutos-2" },
        error: null,
      },
    });

    const result = await createContentPost(client, "user-1", validInput);

    expect(result).toEqual({
      ok: true,
      id: "post-1",
      slug: "arroz-con-pollo-en-20-minutos-2",
    });
    expect(insert.mock.calls[0][0].slug).toBe(
      "arroz-con-pollo-en-20-minutos-2",
    );
  });

  it("fija published_at al crear directamente en estado published", async () => {
    const { insert, client } = buildSupabaseMock({
      insertResult: {
        data: { id: "post-1", slug: "arroz-con-pollo-en-20-minutos" },
        error: null,
      },
    });

    await createContentPost(client, "user-1", {
      ...validInput,
      status: "published",
    });

    const payload = insert.mock.calls[0][0];
    expect(payload.status).toBe("published");
    expect(typeof payload.published_at).toBe("string");
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({
      insertResult: { data: null, error: { message: "db down" } },
    });

    const result = await createContentPost(client, "user-1", validInput);

    expect(result).toEqual({
      ok: false,
      error: "No se pudo crear el contenido. Intenta de nuevo.",
    });
  });

  it("devuelve un mensaje amigable ante una colisión de slug en el insert", async () => {
    const { client } = buildSupabaseMock({
      insertResult: {
        data: null,
        error: { message: "duplicate key", code: "23505" },
      },
    });

    const result = await createContentPost(client, "user-1", validInput);

    expect(result).toEqual({
      ok: false,
      error: "Ya existe contenido con ese identificador. Intenta de nuevo.",
    });
  });
});
