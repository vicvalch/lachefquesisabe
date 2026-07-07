import { describe, expect, it } from "vitest";
import { updateLeadSchema } from "./update-lead";

describe("updateLeadSchema", () => {
  it("acepta un estado válido sin notas ni seguimiento", () => {
    const result = updateLeadSchema.safeParse({ status: "new" });
    expect(result.success).toBe(true);
  });

  it("acepta notas y una fecha de próximo seguimiento", () => {
    const result = updateLeadSchema.safeParse({
      status: "contacted",
      notes: "Quiere agendar demo el sábado",
      next_follow_up_at: "2026-08-01T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un estado que no existe en el enum", () => {
    const result = updateLeadSchema.safeParse({ status: "convertido" });
    expect(result.success).toBe(false);
  });

  it("rechaza una fecha de próximo seguimiento inválida", () => {
    const result = updateLeadSchema.safeParse({
      status: "new",
      next_follow_up_at: "no-es-una-fecha",
    });
    expect(result.success).toBe(false);
  });

  it("ignora campos fuera del allowlist aunque vengan en el input", () => {
    const tampered = {
      status: "new",
      email: "hacker@example.com",
      phone: "000",
      source: "otro",
      consent_contact: false,
      created_at: "2000-01-01T00:00:00.000Z",
    };

    const result = updateLeadSchema.safeParse(tampered);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("email");
      expect(result.data).not.toHaveProperty("phone");
      expect(result.data).not.toHaveProperty("source");
      expect(result.data).not.toHaveProperty("consent_contact");
      expect(result.data).not.toHaveProperty("created_at");
    }
  });
});
