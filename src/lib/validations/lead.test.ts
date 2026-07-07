import { describe, expect, it } from "vitest";
import { leadFormSchema } from "./lead";

const validPayload = {
  name: "Ana Pérez",
  email: "ana@example.com",
  phone: "+34600000000",
  interest: "demo_thermomix" as const,
  message: "Me encantaría ver una demo",
  consent_contact: true,
  website: "",
};

describe("leadFormSchema", () => {
  it("acepta un lead válido", () => {
    const result = leadFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("permite teléfono y mensaje vacíos", () => {
    const result = leadFormSchema.safeParse({
      ...validPayload,
      phone: "",
      message: "",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un email inválido", () => {
    const result = leadFormSchema.safeParse({
      ...validPayload,
      email: "no-es-un-email",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando falta el consentimiento", () => {
    const result = leadFormSchema.safeParse({
      ...validPayload,
      consent_contact: false,
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un interés fuera del enum", () => {
    const result = leadFormSchema.safeParse({
      ...validPayload,
      interest: "no-existe",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un nombre demasiado corto", () => {
    const result = leadFormSchema.safeParse({ ...validPayload, name: "A" });
    expect(result.success).toBe(false);
  });

  it("descarta campos internos que no pertenecen al payload público", () => {
    const result = leadFormSchema.safeParse({
      ...validPayload,
      status: "convertido",
      notes: "no debería poder setear esto",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("status");
      expect(result.data).not.toHaveProperty("notes");
    }
  });
});
