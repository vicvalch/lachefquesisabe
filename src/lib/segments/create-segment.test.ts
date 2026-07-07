import { describe, expect, it, vi } from "vitest";
import { createLeadSegment } from "./create-segment";
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

describe("createLeadSegment", () => {
  it("inserta el segmento con created_by y el criterio traducido", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "segment-1" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });

    const result = await createLeadSegment(
      { from } as never,
      "user-1",
      buildInput(),
    );

    expect(result).toEqual({ ok: true, id: "segment-1" });
    expect(from).toHaveBeenCalledWith("lead_segments");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        created_by: "user-1",
        name: "Interesados sin contactar",
        criteria: { statuses: ["new"] },
      }),
    );
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const single = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "db down" } });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });

    const result = await createLeadSegment({ from } as never, null, buildInput());

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
