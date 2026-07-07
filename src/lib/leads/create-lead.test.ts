import { describe, expect, it, vi } from "vitest";
import { createLead } from "./create-lead";
import type { CreateLeadInput } from "@/lib/validations/lead";

const validInput: CreateLeadInput = {
  name: "Ana Pérez",
  email: "ana@example.com",
  phone: "",
  interest: "recetas",
  message: "",
  consent_contact: true,
};

function buildSupabaseMock(insertResult: { error: { message: string } | null }) {
  const insert = vi.fn().mockResolvedValue(insertResult);
  const from = vi.fn().mockReturnValue({ insert });
  return { client: { from } as never, insert, from };
}

describe("createLead", () => {
  it("inserta el lead con los datos normalizados", async () => {
    const { client, from, insert } = buildSupabaseMock({ error: null });

    const result = await createLead(client, validInput);

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("leads");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ana Pérez",
        email: "ana@example.com",
        phone: null,
        interest: "recetas",
        message: null,
        consent_contact: true,
        source: "landing",
      }),
    );
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({ error: { message: "db down" } });

    const result = await createLead(client, validInput);

    expect(result).toEqual({ ok: false, error: "db down" });
  });

  it("ignora campos internos aunque vengan en el input", async () => {
    const { client, insert } = buildSupabaseMock({ error: null });
    const tampered = {
      ...validInput,
      status: "convertido",
      notes: "no debería llegar a la base",
    } as CreateLeadInput;

    await createLead(client, tampered);

    const insertedPayload = insert.mock.calls[0][0];
    expect(insertedPayload).not.toHaveProperty("status");
    expect(insertedPayload).not.toHaveProperty("notes");
  });
});
