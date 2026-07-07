import { describe, expect, it } from "vitest";
import {
  WHATSAPP_TEMPLATES,
  buildWhatsAppUrl,
  normalizePhoneForWhatsApp,
} from "./templates";
import type { LeadRow } from "@/types/database";

const baseLead: LeadRow = {
  id: "lead-1",
  created_at: new Date(0).toISOString(),
  name: "Ana María Pérez",
  email: "ana@example.com",
  phone: "+52 55 1234 5678",
  primary_interest: "buy_thermomix",
  message: null,
  status: "new",
  source: "landing",
  consent_contact: true,
  notes: null,
  next_follow_up_at: null,
  last_contacted_at: null,
};

describe("WHATSAPP_TEMPLATES", () => {
  it("personaliza cada plantilla con el primer nombre del lead", () => {
    for (const template of WHATSAPP_TEMPLATES) {
      const message = template.build(baseLead);
      expect(message).toContain("Ana");
      expect(message).not.toContain("Ana María Pérez");
    }
  });
});

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
