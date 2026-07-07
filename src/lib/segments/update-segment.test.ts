import { describe, expect, it, vi } from "vitest";
import { updateLeadSegment } from "./update-segment";
import type { LeadSegmentFormInput } from "@/lib/validations/lead-segment";

function buildInput(overrides: Partial<LeadSegmentFormInput> = {}): LeadSegmentFormInput {
  return {
    name: "Interesados sin contactar",
    description: "",
    statuses: ["new"],
    primary_interests: [],
    sources: "",
    consent_contact: "any",
    created_from: "",
    created_to: "",
    last_contacted_before: "",
    last_contacted_after: "",
    next_follow_up_before: "",
    next_follow_up_after: "",
    has_open_follow_up_task: "any",
    demo_event_id: "",
    demo_attendance_statuses: [],
    content_post_id: "",
    search: "",
    ...overrides,
  };
}

describe("updateLeadSegment", () => {
  it("actualiza el nombre y el criterio del segmento", async () => {
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
      expect.objectContaining({
        name: "Nuevo nombre",
        criteria: { statuses: ["new"] },
      }),
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
