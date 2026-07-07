import { describe, expect, it, vi } from "vitest";
import { updateLead } from "./update-lead";
import type { UpdateLeadInput } from "./update-lead";

function buildSupabaseMock(updateResult: { error: { message: string } | null }) {
  const eq = vi.fn().mockResolvedValue(updateResult);
  const update = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ update });
  return { client: { from } as never, from, update, eq };
}

const baseInput: UpdateLeadInput = {
  status: "contacted",
  notes: "Quiere agendar demo el sábado",
  next_follow_up_at: "2026-08-01T10:00:00.000Z",
};

describe("updateLead", () => {
  it("actualiza únicamente estado, notas y próximo seguimiento", async () => {
    const { client, from, update, eq } = buildSupabaseMock({ error: null });

    const result = await updateLead(client, "lead-1", baseInput);

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("leads");
    expect(update).toHaveBeenCalledWith({
      status: "contacted",
      notes: "Quiere agendar demo el sábado",
      next_follow_up_at: "2026-08-01T10:00:00.000Z",
    });
    expect(eq).toHaveBeenCalledWith("id", "lead-1");
  });

  it("ignora campos fuera del allowlist aunque vengan colados en el input", async () => {
    const { client, update } = buildSupabaseMock({ error: null });
    const tampered = {
      ...baseInput,
      email: "hacker@example.com",
      phone: "000",
      source: "otro",
      consent_contact: false,
    } as unknown as UpdateLeadInput;

    await updateLead(client, "lead-1", tampered);

    const payload = update.mock.calls[0]?.[0] ?? {};
    expect(Object.keys(payload).sort()).toEqual(
      ["next_follow_up_at", "notes", "status"].sort(),
    );
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({ error: { message: "db down" } });

    const result = await updateLead(client, "lead-1", baseInput);

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
