import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, normalizePhoneForWhatsApp } from "./templates";

describe("normalizePhoneForWhatsApp", () => {
  it("elimina espacios, guiones y paréntesis", () => {
    expect(normalizePhoneForWhatsApp("+52 (55) 1234-5678")).toBe(
      "525512345678",
    );
  });

  it("agrega 506 a un número tico de 8 dígitos sin código de país", () => {
    expect(normalizePhoneForWhatsApp("8888-8888")).toBe("50688888888");
  });

  it("preserva un número que ya trae código internacional", () => {
    expect(normalizePhoneForWhatsApp("+52 55 1234 5678")).toBe(
      "525512345678",
    );
  });

  it("devuelve null si no hay teléfono", () => {
    expect(normalizePhoneForWhatsApp(null)).toBeNull();
  });

  it("devuelve null si el teléfono es demasiado corto", () => {
    expect(normalizePhoneForWhatsApp("12345")).toBeNull();
  });
});

describe("buildWhatsAppUrl", () => {
  it("construye un link de wa.me con el mensaje codificado", () => {
    const url = buildWhatsAppUrl("+52 55 1234 5678", "Hola!");
    expect(url).toBe("https://wa.me/525512345678?text=Hola!");
  });

  it("agrega el código 506 para números ticos de 8 dígitos", () => {
    const url = buildWhatsAppUrl("8888 8888", "Hola!");
    expect(url).toBe("https://wa.me/50688888888?text=Hola!");
  });

  it("devuelve null cuando el teléfono no es válido", () => {
    expect(buildWhatsAppUrl(null, "Hola!")).toBeNull();
  });
});
