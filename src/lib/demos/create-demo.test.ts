import { describe, expect, it, vi } from "vitest";
import { createDemoEvent } from "./create-demo";
import type { CreateDemoEventInput } from "@/lib/validations/demo-event";

const validInput: CreateDemoEventInput = {
  title: "Demo de recetas rápidas",
  description: "",
  demo_type: "in_person",
  location: "Casa, Heredia",
  scheduled_at: "2026-08-01T18:00",
  capacity: 8,
  notes: "",
};

function buildSupabaseMock(result: {
  data: { id: string } | null;
  error: { message: string } | null;
}) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert });
  return { client: { from } as never, from, insert, select, single };
}

describe("createDemoEvent", () => {
  it("inserta la demo con created_by desde la sesión", async () => {
    const { client, from, insert } = buildSupabaseMock({
      data: { id: "demo-1" },
      error: null,
    });

    const result = await createDemoEvent(client, "user-1", validInput);

    expect(result).toEqual({ ok: true, id: "demo-1" });
    expect(from).toHaveBeenCalledWith("demo_events");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        created_by: "user-1",
        title: "Demo de recetas rápidas",
        demo_type: "in_person",
        location: "Casa, Heredia",
        capacity: 8,
        description: null,
        notes: null,
      }),
    );
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({
      data: null,
      error: { message: "db down" },
    });

    const result = await createDemoEvent(client, "user-1", validInput);

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
