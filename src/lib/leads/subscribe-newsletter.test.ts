import { describe, expect, it, vi } from "vitest";
import { subscribeNewsletterLead } from "./subscribe-newsletter";
import type { NewsletterSubscribeInput } from "@/lib/validations/newsletter";

const validInput: NewsletterSubscribeInput = {
  full_name: "Ana Pérez",
  email: "ana@example.com",
  phone: "",
  consent_contact: true,
};

function buildSupabaseMock(insertResult: { error: { message: string } | null }) {
  const insert = vi.fn().mockResolvedValue(insertResult);
  const from = vi.fn().mockReturnValue({ insert });
  return { client: { from } as never, insert, from };
}

describe("subscribeNewsletterLead", () => {
  it("inserta el lead con interest de recetas y tags de newsletter", async () => {
    const { client, from, insert } = buildSupabaseMock({ error: null });

    const result = await subscribeNewsletterLead(client, validInput);

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("leads");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ana Pérez",
        email: "ana@example.com",
        phone: null,
        primary_interest: "easy_recipes",
        consent_contact: true,
        source: "landing",
        tags: ["recipes", "newsletter"],
      }),
    );
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({ error: { message: "db down" } });

    const result = await subscribeNewsletterLead(client, validInput);

    expect(result).toEqual({
      ok: false,
      error: "No pudimos guardar tu suscripción. Intenta de nuevo.",
    });
  });
});
