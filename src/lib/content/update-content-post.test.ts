import { describe, expect, it, vi } from "vitest";
import { updateContentPost } from "./update-content-post";
import type { ContentPostInput } from "@/lib/validations/content-post";

const baseInput: ContentPostInput = {
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

  return { client: { from } as never, from, select, update };
}

describe("updateContentPost", () => {
  it("no consulta published_at cuando el estado se queda en draft", async () => {
    const { client, select, update } = buildSupabaseMock({});

    const result = await updateContentPost(client, "post-1", baseInput);

    expect(result).toEqual({ ok: true });
    expect(select).not.toHaveBeenCalled();
    const payload = update.mock.calls[0][0];
    expect(payload.status).toBe("draft");
    expect(payload.published_at).toBeNull();
  });

  it("fija published_at la primera vez que pasa a published", async () => {
    const { client, update } = buildSupabaseMock({
      currentResult: { data: { published_at: null }, error: null },
    });

    const result = await updateContentPost(client, "post-1", {
      ...baseInput,
      status: "published",
    });

    expect(result).toEqual({ ok: true });
    const payload = update.mock.calls[0][0];
    expect(payload.status).toBe("published");
    expect(typeof payload.published_at).toBe("string");
  });

  it("no vuelve a fijar published_at si ya estaba publicado antes", async () => {
    const { client, update } = buildSupabaseMock({
      currentResult: {
        data: { published_at: "2026-01-01T00:00:00.000Z" },
        error: null,
      },
    });

    const result = await updateContentPost(client, "post-1", {
      ...baseInput,
      status: "published",
    });

    expect(result).toEqual({ ok: true });
    const payload = update.mock.calls[0][0];
    expect(payload.published_at).toBeUndefined();
  });

  it("limpia published_at cuando pasa de published a draft", async () => {
    const { client, update, select } = buildSupabaseMock({});

    const result = await updateContentPost(client, "post-1", {
      ...baseInput,
      status: "draft",
    });

    expect(result).toEqual({ ok: true });
    expect(select).not.toHaveBeenCalled();
    const payload = update.mock.calls[0][0];
    expect(payload.published_at).toBeNull();
  });

  it("no toca published_at al archivar", async () => {
    const { client, update, select } = buildSupabaseMock({});

    const result = await updateContentPost(client, "post-1", {
      ...baseInput,
      status: "archived",
    });

    expect(result).toEqual({ ok: true });
    expect(select).not.toHaveBeenCalled();
    const payload = update.mock.calls[0][0];
    expect(payload.published_at).toBeUndefined();
  });

  it("devuelve el error cuando falla la actualización", async () => {
    const { client } = buildSupabaseMock({
      updateError: { message: "db down" },
    });

    const result = await updateContentPost(client, "post-1", baseInput);

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
