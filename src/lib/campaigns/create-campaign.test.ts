import { describe, expect, it, vi } from "vitest";
import { createOutreachCampaign } from "./create-campaign";
import type { CreateOutreachCampaignInput } from "@/lib/validations/outreach-campaign";

function buildInput(
  overrides: Partial<CreateOutreachCampaignInput> = {},
): CreateOutreachCampaignInput {
  return {
    segment_id: "segment-1",
    message_template_id: "template-1",
    name: "Recontacto interesados",
    description: "",
    task_type: "whatsapp",
    task_priority: "medium",
    task_title: "",
    task_notes: "",
    due_at: "",
    ...overrides,
  };
}

describe("createOutreachCampaign", () => {
  it("inserta la campaña en status draft con created_by, slug generado y los datos del formulario", async () => {
    const single = vi
      .fn()
      .mockResolvedValue({ data: { id: "campaign-1" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });

    const result = await createOutreachCampaign(
      { from } as never,
      "user-1",
      buildInput(),
    );

    expect(result).toEqual({ ok: true, id: "campaign-1" });
    expect(from).toHaveBeenCalledWith("outreach_campaigns");
    const payload = insert.mock.calls[0][0];
    expect(payload).toMatchObject({
      created_by: "user-1",
      segment_id: "segment-1",
      message_template_id: "template-1",
      name: "Recontacto interesados",
      description: null,
      status: "draft",
      task_type: "whatsapp",
      task_priority: "medium",
      task_title: null,
      task_notes: null,
      due_at: null,
    });
    expect(typeof payload.slug).toBe("string");
    expect(payload.slug.length).toBeGreaterThan(0);
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const single = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "db down" } });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });

    const result = await createOutreachCampaign(
      { from } as never,
      null,
      buildInput(),
    );

    expect(result).toEqual({
      ok: false,
      error: "No se pudo crear la campaña. Intenta de nuevo.",
    });
  });
});
