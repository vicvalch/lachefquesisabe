import { describe, expect, it, vi } from "vitest";
import { createRecipeVideo } from "./create-recipe-video";
import type { RecipeVideoInput } from "@/lib/validations/recipe-video";

const validInput: RecipeVideoInput = {
  title: "Arroz con pollo en Thermomix",
  description: "",
  youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  thumbnail_url: "",
  category: "recetas",
  difficulty: null,
  duration_minutes: 20,
  ingredients: [],
  tags: [],
  status: "draft",
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

describe("createRecipeVideo", () => {
  it("inserta el video con el ID de YouTube y una miniatura por defecto", async () => {
    const { client, from, insert } = buildSupabaseMock({
      insertResult: {
        data: { id: "video-1", slug: "arroz-con-pollo-en-thermomix" },
        error: null,
      },
    });

    const result = await createRecipeVideo(client, "user-1", validInput);

    expect(result).toEqual({
      ok: true,
      id: "video-1",
      slug: "arroz-con-pollo-en-thermomix",
    });
    expect(from).toHaveBeenCalledWith("recipe_videos");
    const payload = insert.mock.calls[0][0];
    expect(payload).toMatchObject({
      created_by: "user-1",
      title: "Arroz con pollo en Thermomix",
      slug: "arroz-con-pollo-en-thermomix",
      youtube_video_id: "dQw4w9WgXcQ",
      thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      status: "draft",
      published_at: null,
    });
  });

  it("respeta una miniatura personalizada cuando se indica", async () => {
    const { client, insert } = buildSupabaseMock({
      insertResult: {
        data: { id: "video-1", slug: "arroz-con-pollo-en-thermomix" },
        error: null,
      },
    });

    await createRecipeVideo(client, "user-1", {
      ...validInput,
      thumbnail_url: "https://example.com/custom.jpg",
    });

    expect(insert.mock.calls[0][0].thumbnail_url).toBe(
      "https://example.com/custom.jpg",
    );
  });

  it("fija published_at al crear directamente en estado published", async () => {
    const { client, insert } = buildSupabaseMock({
      insertResult: {
        data: { id: "video-1", slug: "arroz-con-pollo-en-thermomix" },
        error: null,
      },
    });

    await createRecipeVideo(client, "user-1", {
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

    const result = await createRecipeVideo(client, "user-1", validInput);

    expect(result).toEqual({
      ok: false,
      error: "No se pudo crear el video. Intenta de nuevo.",
    });
  });

  it("devuelve un mensaje amigable ante una colisión de slug en el insert", async () => {
    const { client } = buildSupabaseMock({
      insertResult: {
        data: null,
        error: { message: "duplicate key", code: "23505" },
      },
    });

    const result = await createRecipeVideo(client, "user-1", validInput);

    expect(result).toEqual({
      ok: false,
      error: "Ya existe un video con ese identificador. Intenta de nuevo.",
    });
  });
});
