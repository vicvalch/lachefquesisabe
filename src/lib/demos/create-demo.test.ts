import { describe, expect, it, vi } from "vitest";
import { createDemoEvent } from "./create-demo";
import type { CreateDemoEventInput } from "@/lib/validations/demo-event";

const validInput: CreateDemoEventInput = {
  title: "Demo de recetas rápidas",
  description: "",
  public_notes: "",
  mode: "in_person",
  location_name: "Casa de la chef",
  location_address: "Heredia, Costa Rica",
  meeting_url: "",
  starts_at: "2026-08-01T18:00",
  ends_at: "",
  capacity: 8,
  internal_notes: "",
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

describe("createDemoEvent", () => {
  it("inserta la demo con created_by desde la sesión y un slug generado", async () => {
    const { client, from, insert } = buildSupabaseMock({
      data: { id: "demo-1", slug: "demo-de-recetas-rapidas-abc12345" },
      error: null,
    });

    const result = await createDemoEvent(client, "user-1", validInput);

    expect(result).toEqual({
      ok: true,
      id: "demo-1",
      slug: "demo-de-recetas-rapidas-abc12345",
    });
    expect(from).toHaveBeenCalledWith("demo_events");
    const payload = insert.mock.calls[0][0];
    expect(payload).toMatchObject({
      created_by: "user-1",
      title: "Demo de recetas rápidas",
      mode: "in_person",
      location_name: "Casa de la chef",
      location_address: "Heredia, Costa Rica",
      starts_at: "2026-08-01T18:00",
      capacity: 8,
      description: null,
      public_notes: null,
      internal_notes: null,
    });
    expect(payload.slug).toMatch(/^demo-de-recetas-rapidas-[0-9a-f]{8}$/);
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({
      data: null,
      error: { message: "db down" },
    });

    const result = await createDemoEvent(client, "user-1", validInput);

    expect(result).toEqual({
      ok: false,
      error: "No se pudo crear la demo. Intenta de nuevo.",
    });
  });

  it("devuelve un mensaje amigable ante una colisión de slug", async () => {
    const { client } = buildSupabaseMock({
      data: null,
      error: { message: "duplicate key", code: "23505" },
    });

    const result = await createDemoEvent(client, "user-1", validInput);

    expect(result).toEqual({
      ok: false,
      error: "Ya existe una demo con ese identificador. Intenta de nuevo.",
    });
  });
});
