import { describe, expect, it } from "vitest";
import {
  WHATSAPP_TEMPLATES,
  buildWhatsAppLink,
  sanitizePhoneForWhatsApp,
} from "./templates";
import type { LeadRow } from "@/types/database";

const baseLead: LeadRow = {
  id: "lead-1",
  created_at: new Date().toISOString(),
  name: "Ana María Pérez",
  email: "ana@example.com",
  phone: "+52 55 1234 5678",
  interest: "demo_thermomix",
  message: null,
  status: "nuevo",
  source: "landing",
  consent_contact: true,
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

describe("sanitizePhoneForWhatsApp", () => {
  it("elimina caracteres no numéricos", () => {
    expect(sanitizePhoneForWhatsApp("+52 55 1234 5678")).toBe("525512345678");
  });

  it("devuelve null si no hay teléfono", () => {
    expect(sanitizePhoneForWhatsApp(null)).toBeNull();
  });

  it("devuelve null si el teléfono es demasiado corto", () => {
    expect(sanitizePhoneForWhatsApp("12345")).toBeNull();
  });
});

describe("buildWhatsAppLink", () => {
  it("construye un link de wa.me con el mensaje codificado", () => {
    const link = buildWhatsAppLink("+52 55 1234 5678", "Hola!");
    expect(link).toBe("https://wa.me/525512345678?text=Hola!");
  });

  it("devuelve null cuando el teléfono no es válido", () => {
    expect(buildWhatsAppLink(null, "Hola!")).toBeNull();
  });
});
