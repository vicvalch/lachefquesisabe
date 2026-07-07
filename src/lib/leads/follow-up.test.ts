import { describe, expect, it, vi } from "vitest";
import { clearFollowUp } from "./follow-up";

function buildSupabaseMock(updateResult: { error: { message: string } | null }) {
  const eq = vi.fn().mockResolvedValue(updateResult);
  const update = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ update });
  return { client: { from } as never, from, update, eq };
}

describe("clearFollowUp", () => {
  it("limpia next_follow_up_at del lead", async () => {
    const { client, from, update, eq } = buildSupabaseMock({ error: null });

    const result = await clearFollowUp(client, "lead-1");

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("leads");
    expect(update).toHaveBeenCalledWith({ next_follow_up_at: null });
    expect(eq).toHaveBeenCalledWith("id", "lead-1");
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({ error: { message: "db down" } });

    const result = await clearFollowUp(client, "lead-1");

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
