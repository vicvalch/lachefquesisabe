import { describe, expect, it } from "vitest";
import { newsletterSubscribeSchema } from "./newsletter";

const validPayload = {
  full_name: "Ana Pérez",
  email: "ana@example.com",
  phone: "+34600000000",
  consent_contact: true,
  website: "",
};

describe("newsletterSubscribeSchema", () => {
  it("acepta una suscripción válida", () => {
    const result = newsletterSubscribeSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("permite teléfono vacío (opcional)", () => {
    const result = newsletterSubscribeSchema.safeParse({
      ...validPayload,
      phone: "",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un email inválido", () => {
    const result = newsletterSubscribeSchema.safeParse({
      ...validPayload,
      email: "no-es-un-email",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando falta el consentimiento", () => {
    const result = newsletterSubscribeSchema.safeParse({
      ...validPayload,
      consent_contact: false,
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un nombre demasiado corto", () => {
    const result = newsletterSubscribeSchema.safeParse({
      ...validPayload,
      full_name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza el honeypot no vacío", () => {
    const result = newsletterSubscribeSchema.safeParse({
      ...validPayload,
      website: "http://spam.example",
    });
    expect(result.success).toBe(false);
  });
});
