import { describe, expect, it, vi } from "vitest";
import { updateLeadStatus } from "./update-status";

function buildSupabaseMock(updateResult: { error: { message: string } | null }) {
  const eq = vi.fn().mockResolvedValue(updateResult);
  const update = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ update });
  return { client: { from } as never, from, update, eq };
}

describe("updateLeadStatus", () => {
  it("actualiza el estado del lead indicado", async () => {
    const { client, from, update, eq } = buildSupabaseMock({ error: null });

    const result = await updateLeadStatus(client, "lead-1", "contactado");

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("leads");
    expect(update).toHaveBeenCalledWith({ status: "contactado" });
    expect(eq).toHaveBeenCalledWith("id", "lead-1");
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({ error: { message: "db down" } });

    const result = await updateLeadStatus(client, "lead-1", "convertido");

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
