import { describe, expect, it } from "vitest";
import { addContactLogSchema } from "./contact-log";

const baseInput = {
  channel: "whatsapp",
  direction: "outbound",
  summary: "Se le explicó el paquete de recetas",
};

describe("addContactLogSchema", () => {
  it("acepta un contacto válido sin resultado ni próximo seguimiento", () => {
    const result = addContactLogSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
  });

  it("acepta un contacto con resultado y próximo seguimiento", () => {
    const result = addContactLogSchema.safeParse({
      ...baseInput,
      outcome: "Quedó de confirmar mañana",
      next_follow_up_at: "2026-08-01T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un canal inválido", () => {
    const result = addContactLogSchema.safeParse({
      ...baseInput,
      channel: "carrier_pigeon",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una dirección inválida", () => {
    const result = addContactLogSchema.safeParse({
      ...baseInput,
      direction: "sideways",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un resumen vacío", () => {
    const result = addContactLogSchema.safeParse({
      ...baseInput,
      summary: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una fecha de próximo seguimiento inválida", () => {
    const result = addContactLogSchema.safeParse({
      ...baseInput,
      next_follow_up_at: "no-es-una-fecha",
    });
    expect(result.success).toBe(false);
  });
});
