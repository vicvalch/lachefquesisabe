import { describe, expect, it, vi } from "vitest";
import { createRecipe } from "./create-recipe";
import type { CreateRecipeInput } from "@/lib/validations/recipe";

const validInput: CreateRecipeInput = {
  title: "Arroz con pollo en 20 minutos",
  content_type: "recipe",
  summary: "",
  cover_image_url: "",
  prep_minutes: 20,
  servings: 4,
  ingredients: "",
  content: "1. Sofríe el pollo.\n2. Agrega el arroz.",
  cta_message: "",
};

function buildSupabaseMock(result: {
  data: { id: string; slug: string } | null;
  error: { message: string; code?: string } | null;
}) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert });
  return { client: { from } as never, from, insert, select, single };
}

describe("createRecipe", () => {
  it("inserta la receta en borrador con created_by desde la sesión y un slug generado", async () => {
    const { client, from, insert } = buildSupabaseMock({
      data: { id: "recipe-1", slug: "arroz-con-pollo-en-20-minutos-abc12345" },
      error: null,
    });

    const result = await createRecipe(client, "user-1", validInput);

    expect(result).toEqual({
      ok: true,
      id: "recipe-1",
      slug: "arroz-con-pollo-en-20-minutos-abc12345",
    });
    expect(from).toHaveBeenCalledWith("recipes");
    const payload = insert.mock.calls[0][0];
    expect(payload).toMatchObject({
      created_by: "user-1",
      title: "Arroz con pollo en 20 minutos",
      content_type: "recipe",
      status: "draft",
      summary: null,
      cover_image_url: null,
      prep_minutes: 20,
      servings: 4,
      ingredients: null,
      content: "1. Sofríe el pollo.\n2. Agrega el arroz.",
      cta_message: null,
    });
    expect(payload.slug).toMatch(/^arroz-con-pollo-en-20-minutos-[0-9a-f]{8}$/);
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({
      data: null,
      error: { message: "db down" },
    });

    const result = await createRecipe(client, "user-1", validInput);

    expect(result).toEqual({ ok: false, error: "db down" });
  });

  it("devuelve un mensaje amigable ante una colisión de slug", async () => {
    const { client } = buildSupabaseMock({
      data: null,
      error: { message: "duplicate key", code: "23505" },
    });

    const result = await createRecipe(client, "user-1", validInput);

    expect(result).toEqual({
      ok: false,
      error: "Ya existe una receta con ese identificador. Intenta de nuevo.",
    });
  });
});
