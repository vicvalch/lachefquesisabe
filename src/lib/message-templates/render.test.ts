import { describe, expect, it } from "vitest";
import { buildTemplateContext, renderMessageTemplate } from "./render";
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

describe("buildTemplateContext", () => {
  it("solo incluye el nombre cuando no hay demo", () => {
    const context = buildTemplateContext(baseLead);
    expect(context).toEqual({ name: "Ana" });
  });

  it("incluye los campos de demo cuando se pasa una demo", () => {
    const context = buildTemplateContext(baseLead, baseDemo);
    expect(context.name).toBe("Ana");
    expect(context.demoTitle).toBe("Demo de recetas rápidas");
    expect(context.demoLocation).toContain("Casa de la chef");
  });
});

describe("renderMessageTemplate", () => {
  it("reemplaza {{name}}", () => {
    const message = renderMessageTemplate(
      "Hola {{name}}!",
      buildTemplateContext(baseLead),
    );
    expect(message).toBe("Hola Ana!");
  });

  it("reemplaza los placeholders de demo cuando están presentes", () => {
    const message = renderMessageTemplate(
      '{{name}}: "{{demo_title}}" el {{demo_date}} a las {{demo_time}}{{demo_location}}',
      buildTemplateContext(baseLead, baseDemo),
    );
    expect(message).toContain("Demo de recetas rápidas");
    expect(message).toContain("Casa de la chef, Heredia, Costa Rica");
    expect(message).toMatch(/\d{2} de agosto de 2026/);
  });

  it("deja vacíos los placeholders de demo cuando no hay demo (sin lanzar)", () => {
    const message = renderMessageTemplate(
      "Hola {{name}}, sobre {{demo_title}}",
      buildTemplateContext(baseLead),
    );
    expect(message).toBe("Hola Ana, sobre ");
  });

  it("indica modalidad virtual cuando no hay ubicación física", () => {
    const virtualDemo: DemoEventRow = {
      ...baseDemo,
      mode: "virtual",
      location_name: null,
      location_address: null,
      meeting_url: "https://meet.example.com/demo",
    };
    const message = renderMessageTemplate(
      "{{demo_location}}",
      buildTemplateContext(baseLead, virtualDemo),
    );
    expect(message).toBe(" (virtual: https://meet.example.com/demo)");
  });
});
