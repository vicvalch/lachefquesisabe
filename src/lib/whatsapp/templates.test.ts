import { describe, expect, it } from "vitest";
import {
  WHATSAPP_TEMPLATES,
  buildWhatsAppUrl,
  normalizePhoneForWhatsApp,
  renderDemoTemplate,
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
  updated_at: new Date(0).toISOString(),
  created_by: null,
  title: "Demo de recetas rápidas",
  slug: "demo-de-recetas-rapidas-abc123",
  description: null,
  mode: "in_person",
  status: "scheduled",
  starts_at: "2026-08-01T18:00:00.000Z",
  ends_at: null,
  location_name: "Casa de la chef",
  location_address: "Heredia, Costa Rica",
  meeting_url: null,
  capacity: 8,
  public_notes: null,
  internal_notes: null,
};

describe("renderDemoTemplate", () => {
  it("reemplaza {{name}} con el primer nombre del lead", () => {
    const message = renderDemoTemplate("invitation", baseLead, baseDemo);
    expect(message).toContain("Ana");
    expect(message).not.toContain("Ana María Pérez");
  });

  it("reemplaza {{demo_title}}", () => {
    const message = renderDemoTemplate("confirmation", baseLead, baseDemo);
    expect(message).toContain("Demo de recetas rápidas");
  });

  it("reemplaza {{demo_date}} y {{demo_time}} con formato es-CR", () => {
    const message = renderDemoTemplate("reminder", baseLead, baseDemo);
    expect(message).not.toContain("{{demo_date}}");
    expect(message).not.toContain("{{demo_time}}");
    expect(message).toMatch(/\d{2} de agosto de 2026/);
  });

  it("reemplaza {{demo_location}} con el lugar cuando es presencial", () => {
    const message = renderDemoTemplate("invitation", baseLead, baseDemo);
    expect(message).toContain("Casa de la chef, Heredia, Costa Rica");
  });

  it("reemplaza {{demo_location}} indicando modalidad virtual", () => {
    const message = renderDemoTemplate("invitation", baseLead, {
      ...baseDemo,
      mode: "virtual",
      location_name: null,
      location_address: null,
      meeting_url: "https://meet.example.com/demo",
    });
    expect(message).toContain("(virtual: https://meet.example.com/demo)");
  });

  it("maneja datos faltantes sin romper (sin ubicación ni meeting_url)", () => {
    expect(() =>
      renderDemoTemplate("post_demo", baseLead, {
        ...baseDemo,
        mode: "virtual",
        location_name: null,
        location_address: null,
        meeting_url: null,
      }),
    ).not.toThrow();

    const message = renderDemoTemplate("invitation", baseLead, {
      ...baseDemo,
      location_name: null,
      location_address: null,
    });
    expect(message).not.toContain("{{demo_location}}");
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
