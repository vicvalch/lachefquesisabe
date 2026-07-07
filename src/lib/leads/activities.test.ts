import { describe, expect, it, vi } from "vitest";
import { addLeadActivity } from "./activities";
import type { AddLeadActivityInput } from "@/lib/validations/lead-activity";

function buildSupabaseMock(insertResult: { error: { message: string } | null }) {
  const insert = vi.fn().mockResolvedValue(insertResult);
  const from = vi.fn().mockReturnValue({ insert });
  return { client: { from } as never, from, insert };
}

describe("addLeadActivity", () => {
  it("inserta una nota sin canal", async () => {
    const { client, from, insert } = buildSupabaseMock({ error: null });
    const input: AddLeadActivityInput = {
      type: "note",
      content: "Quiere agendar demo el sábado",
    };

    const result = await addLeadActivity(client, "lead-1", "user-1", input);

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("lead_activities");
    expect(insert).toHaveBeenCalledWith({
      lead_id: "lead-1",
      created_by: "user-1",
      type: "note",
      channel: null,
      content: "Quiere agendar demo el sábado",
    });
  });

  it("inserta un contacto con su canal", async () => {
    const { client, insert } = buildSupabaseMock({ error: null });
    const input: AddLeadActivityInput = {
      type: "contact",
      channel: "whatsapp",
      content: "Confirmó interés en la demo",
    };

    await addLeadActivity(client, "lead-1", "user-1", input);

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "contact", channel: "whatsapp" }),
    );
  });

  it("ignora el canal si el tipo es nota", async () => {
    const { client, insert } = buildSupabaseMock({ error: null });
    const input = {
      type: "note",
      channel: "whatsapp",
      content: "Nota con canal colado",
    } as unknown as AddLeadActivityInput;

    await addLeadActivity(client, "lead-1", null, input);

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ channel: null, created_by: null }),
    );
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({ error: { message: "db down" } });
    const input: AddLeadActivityInput = { type: "note", content: "x" };

    const result = await addLeadActivity(client, "lead-1", "user-1", input);

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
