import { describe, expect, it, vi } from "vitest";
import { updateLeadSegment } from "./update-segment";
import type { LeadSegmentFormInput } from "@/lib/validations/lead-segment";

function buildInput(overrides: Partial<LeadSegmentFormInput> = {}): LeadSegmentFormInput {
  return {
    name: "Interesados sin contactar",
    description: "",
    statuses: ["new"],
    primary_interests: [],
    source: "",
    created_after: "",
    created_before: "",
    has_open_follow_up_task: "any",
    ...overrides,
  };
}

describe("updateLeadSegment", () => {
  it("actualiza los filtros del segmento", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });

    const result = await updateLeadSegment(
      { from } as never,
      "segment-1",
      buildInput({ name: "Nuevo nombre" }),
    );

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("lead_segments");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Nuevo nombre" }),
    );
    expect(eq).toHaveBeenCalledWith("id", "segment-1");
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: "db down" } });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });

    const result = await updateLeadSegment(
      { from } as never,
      "segment-1",
      buildInput(),
    );

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
