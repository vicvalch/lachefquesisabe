import { describe, expect, it, vi } from "vitest";
import { createOutreachCampaign } from "./create-campaign";
import type { CreateOutreachCampaignInput } from "@/lib/validations/outreach-campaign";

function buildInput(
  overrides: Partial<CreateOutreachCampaignInput> = {},
): CreateOutreachCampaignInput {
  return {
    segment_id: "segment-1",
    message_template_key: "recontacto-suave",
    name: "Recontacto interesados",
    notes: "",
    ...overrides,
  };
}

describe("createOutreachCampaign", () => {
  it("inserta la campaña con created_by y los datos del formulario", async () => {
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
    expect(insert).toHaveBeenCalledWith({
      created_by: "user-1",
      segment_id: "segment-1",
      message_template_key: "recontacto-suave",
      name: "Recontacto interesados",
      notes: null,
    });
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

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
