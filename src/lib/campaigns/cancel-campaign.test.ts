import { describe, expect, it, vi } from "vitest";
import { cancelOutreachCampaign } from "./cancel-campaign";

describe("cancelOutreachCampaign", () => {
  it("marca la campaña como cancelada", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });

    const result = await cancelOutreachCampaign({ from } as never, "campaign-1");

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("outreach_campaigns");
    expect(update).toHaveBeenCalledWith({ status: "cancelled" });
    expect(eq).toHaveBeenCalledWith("id", "campaign-1");
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: "db down" } });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });

    const result = await cancelOutreachCampaign({ from } as never, "campaign-1");

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
