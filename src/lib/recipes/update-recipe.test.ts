import { describe, expect, it, vi } from "vitest";
import { updateRecipe } from "./update-recipe";
import type { UpdateRecipeInput } from "@/lib/validations/recipe";

const baseInput: UpdateRecipeInput = {
  title: "Arroz con pollo en 20 minutos",
  content_type: "recipe",
  status: "draft",
  summary: "",
  cover_image_url: "",
  prep_minutes: 20,
  servings: 4,
  ingredients: "",
  content: "1. Sofríe el pollo.\n2. Agrega el arroz.",
  cta_message: "",
};

function buildSupabaseMock(options: {
  currentResult?: {
    data: { published_at: string | null } | null;
    error: { message: string } | null;
  };
  updateError?: { message: string } | null;
}) {
  const currentResult = options.currentResult ?? {
    data: { published_at: null },
    error: null,
  };
  const updateError = options.updateError ?? null;

  const maybeSingle = vi.fn().mockResolvedValue(currentResult);
  const selectEq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq: selectEq });

  const updateEq = vi.fn().mockResolvedValue({ error: updateError });
  const update = vi.fn().mockReturnValue({ eq: updateEq });

  const from = vi.fn().mockReturnValue({ select, update });

  return { client: { from } as never, from, select, update, updateEq };
}

describe("updateRecipe", () => {
  it("no consulta published_at cuando el estado no cambia a published", async () => {
    const { client, select, update } = buildSupabaseMock({});

    const result = await updateRecipe(client, "recipe-1", baseInput);

    expect(result).toEqual({ ok: true });
    expect(select).not.toHaveBeenCalled();
    const payload = update.mock.calls[0][0];
    expect(payload.status).toBe("draft");
    expect(payload.published_at).toBeUndefined();
  });

  it("fija published_at la primera vez que pasa a published", async () => {
    const { client, update } = buildSupabaseMock({
      currentResult: { data: { published_at: null }, error: null },
    });

    const result = await updateRecipe(client, "recipe-1", {
      ...baseInput,
      status: "published",
    });

    expect(result).toEqual({ ok: true });
    const payload = update.mock.calls[0][0];
    expect(payload.status).toBe("published");
    expect(typeof payload.published_at).toBe("string");
  });

  it("no vuelve a fijar published_at si ya estaba publicada antes", async () => {
    const { client, update } = buildSupabaseMock({
      currentResult: {
        data: { published_at: "2026-01-01T00:00:00.000Z" },
        error: null,
      },
    });

    const result = await updateRecipe(client, "recipe-1", {
      ...baseInput,
      status: "published",
    });

    expect(result).toEqual({ ok: true });
    const payload = update.mock.calls[0][0];
    expect(payload.published_at).toBeUndefined();
  });

  it("devuelve el error cuando falla la actualización", async () => {
    const { client } = buildSupabaseMock({
      updateError: { message: "db down" },
    });

    const result = await updateRecipe(client, "recipe-1", baseInput);

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
