import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addContactLog } from "./contact-logs";
import type { AddContactLogInput } from "@/lib/validations/contact-log";

function buildSupabaseMock(
  options: {
    insertResult?: { error: { message: string } | null };
    updateResult?: { error: { message: string } | null };
  } = {},
) {
  const insertResult = options.insertResult ?? { error: null };
  const updateResult = options.updateResult ?? { error: null };

  const insert = vi.fn().mockResolvedValue(insertResult);
  const eq = vi.fn().mockResolvedValue(updateResult);
  const update = vi.fn().mockReturnValue({ eq });

  const from = vi.fn((table: string) => {
    if (table === "contact_logs") return { insert };
    if (table === "leads") return { update };
    throw new Error(`Tabla inesperada: ${table}`);
  });

  return { client: { from } as never, from, insert, update, eq };
}

const baseInput: AddContactLogInput = {
  channel: "whatsapp",
  direction: "outbound",
  summary: "Se le explicó el paquete de recetas",
};

describe("addContactLog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("inserta el contact log y actualiza last_contacted_at", async () => {
    const { client, from, insert, update, eq } = buildSupabaseMock();

    const result = await addContactLog(client, "lead-1", "user-1", baseInput);

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("contact_logs");
    expect(insert).toHaveBeenCalledWith({
      lead_id: "lead-1",
      created_by: "user-1",
      channel: "whatsapp",
      direction: "outbound",
      summary: "Se le explicó el paquete de recetas",
      outcome: null,
      next_follow_up_at: null,
    });
    expect(from).toHaveBeenCalledWith("leads");
    expect(update).toHaveBeenCalledWith({
      last_contacted_at: "2026-07-10T12:00:00.000Z",
    });
    expect(eq).toHaveBeenCalledWith("id", "lead-1");
  });

  it("también actualiza leads.next_follow_up_at cuando viene en el input", async () => {
    const { client, update } = buildSupabaseMock();

    await addContactLog(client, "lead-1", "user-1", {
      ...baseInput,
      outcome: "Confirmó que quiere la demo",
      next_follow_up_at: "2026-08-01T10:00:00.000Z",
    });

    expect(update).toHaveBeenCalledWith({
      last_contacted_at: "2026-07-10T12:00:00.000Z",
      next_follow_up_at: "2026-08-01T10:00:00.000Z",
    });
  });

  it("devuelve el error si falla la inserción del contact log", async () => {
    const { client, update } = buildSupabaseMock({
      insertResult: { error: { message: "db down" } },
    });

    const result = await addContactLog(client, "lead-1", "user-1", baseInput);

    expect(result).toEqual({ ok: false, error: "db down" });
    expect(update).not.toHaveBeenCalled();
  });

  it("devuelve el error si falla la actualización del lead", async () => {
    const { client } = buildSupabaseMock({
      updateResult: { error: { message: "update failed" } },
    });

    const result = await addContactLog(client, "lead-1", "user-1", baseInput);

    expect(result).toEqual({ ok: false, error: "update failed" });
  });
});
