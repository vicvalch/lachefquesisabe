import { describe, expect, it } from "vitest";
import {
  WHATSAPP_TEMPLATES,
  buildDemoReminderMessage,
  buildWhatsAppUrl,
  normalizePhoneForWhatsApp,
} from "./templates";
import type { DemoEventRow, LeadRow } from "@/types/database";

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

const baseDemo: DemoEventRow = {
  id: "demo-1",
  created_at: new Date(0).toISOString(),
  created_by: null,
  title: "Demo de recetas rápidas",
  description: null,
  demo_type: "in_person",
  location: "Casa, Heredia",
  scheduled_at: "2026-08-01T18:00:00.000Z",
  capacity: 8,
  status: "scheduled",
  notes: null,
};

describe("buildDemoReminderMessage", () => {
  it("incluye el primer nombre, el título y la ubicación de la demo", () => {
    const message = buildDemoReminderMessage(baseLead, baseDemo);
    expect(message).toContain("Ana");
    expect(message).not.toContain("Ana María Pérez");
    expect(message).toContain("Demo de recetas rápidas");
    expect(message).toContain("Casa, Heredia");
  });

  it("no menciona ubicación cuando la demo no tiene una", () => {
    const message = buildDemoReminderMessage(baseLead, {
      ...baseDemo,
      location: null,
    });
    expect(message).not.toContain(" en .");
    expect(message).toContain("Demo de recetas rápidas");
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
