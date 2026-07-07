import { describe, expect, it } from "vitest";
import { leadSegmentCriteriaSchema, leadSegmentFormSchema } from "./lead-segment";

const VALID_UUID = "11111111-1111-4111-8111-111111111111";

describe("leadSegmentCriteriaSchema", () => {
  it("acepta un criterio vacío", () => {
    expect(leadSegmentCriteriaSchema.safeParse({}).success).toBe(true);
  });

  it("acepta statuses", () => {
    const result = leadSegmentCriteriaSchema.safeParse({
      statuses: ["new", "interested"],
    });
    expect(result.success).toBe(true);
  });

  it("acepta primary_interests", () => {
    const result = leadSegmentCriteriaSchema.safeParse({
      primary_interests: ["virtual_demo"],
    });
    expect(result.success).toBe(true);
  });

  it("acepta sources", () => {
    const result = leadSegmentCriteriaSchema.safeParse({
      sources: ["landing", "demo"],
    });
    expect(result.success).toBe(true);
  });

  it("acepta consent_contact", () => {
    expect(
      leadSegmentCriteriaSchema.safeParse({ consent_contact: true }).success,
    ).toBe(true);
    expect(
      leadSegmentCriteriaSchema.safeParse({ consent_contact: false }).success,
    ).toBe(true);
  });

  it("acepta created_from / created_to", () => {
    const result = leadSegmentCriteriaSchema.safeParse({
      created_from: "2026-06-01T00:00:00.000Z",
      created_to: "2026-06-30T23:59:59.999Z",
    });
    expect(result.success).toBe(true);
  });

  it("acepta last_contacted_before / last_contacted_after", () => {
    const result = leadSegmentCriteriaSchema.safeParse({
      last_contacted_before: "2026-06-30T23:59:59.999Z",
      last_contacted_after: "2026-06-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("acepta next_follow_up_before / next_follow_up_after", () => {
    const result = leadSegmentCriteriaSchema.safeParse({
      next_follow_up_before: "2026-06-30T23:59:59.999Z",
      next_follow_up_after: "2026-06-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("acepta has_open_follow_up_task", () => {
    expect(
      leadSegmentCriteriaSchema.safeParse({ has_open_follow_up_task: true })
        .success,
    ).toBe(true);
  });

  it("acepta demo_event_id", () => {
    const result = leadSegmentCriteriaSchema.safeParse({
      demo_event_id: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("acepta demo_attendance_statuses", () => {
    const result = leadSegmentCriteriaSchema.safeParse({
      demo_attendance_statuses: ["confirmed", "attended"],
    });
    expect(result.success).toBe(true);
  });

  it("acepta content_post_id", () => {
    const result = leadSegmentCriteriaSchema.safeParse({
      content_post_id: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("acepta search", () => {
    const result = leadSegmentCriteriaSchema.safeParse({ search: "ana" });
    expect(result.success).toBe(true);
  });

  it("rechaza keys desconocidas", () => {
    const result = leadSegmentCriteriaSchema.safeParse({
      statuses: ["new"],
      unknown_field: "no debería existir",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza valores inválidos", () => {
    expect(
      leadSegmentCriteriaSchema.safeParse({ statuses: ["no-existe"] }).success,
    ).toBe(false);
    expect(
      leadSegmentCriteriaSchema.safeParse({ demo_event_id: "no-es-uuid" })
        .success,
    ).toBe(false);
    expect(
      leadSegmentCriteriaSchema.safeParse({
        search: "a".repeat(121),
      }).success,
    ).toBe(false);
    expect(
      leadSegmentCriteriaSchema.safeParse({ consent_contact: "yes" }).success,
    ).toBe(false);
  });
});

describe("leadSegmentFormSchema", () => {
  it("acepta un segmento sin ningún filtro (arreglos vacíos, sin fechas)", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "Todos los leads",
      description: "",
      statuses: [],
      primary_interests: [],
      sources: "",
      consent_contact: "any",
      created_from: "",
      created_to: "",
      last_contacted_before: "",
      last_contacted_after: "",
      next_follow_up_before: "",
      next_follow_up_after: "",
      has_open_follow_up_task: "any",
      demo_event_id: "",
      demo_attendance_statuses: [],
      content_post_id: "",
      search: "",
    });
    expect(result.success).toBe(true);
  });

  it("acepta filtros combinados", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "Interesados en demo virtual sin contactar",
      statuses: ["new", "interested"],
      primary_interests: ["virtual_demo"],
      sources: "landing, demo",
      consent_contact: "yes",
      created_from: "2026-06-01",
      created_to: "2026-07-01",
      has_open_follow_up_task: "no",
      demo_event_id: VALID_UUID,
      demo_attendance_statuses: ["confirmed"],
      content_post_id: VALID_UUID,
      search: "ana",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un nombre muy corto", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "A",
      statuses: [],
      primary_interests: [],
      demo_attendance_statuses: [],
      has_open_follow_up_task: "any",
      consent_contact: "any",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un status inválido", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "Segmento válido",
      statuses: ["no-existe"],
      primary_interests: [],
      demo_attendance_statuses: [],
      has_open_follow_up_task: "any",
      consent_contact: "any",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando 'recibido desde' es posterior a 'hasta'", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "Segmento válido",
      statuses: [],
      primary_interests: [],
      demo_attendance_statuses: [],
      has_open_follow_up_task: "any",
      consent_contact: "any",
      created_from: "2026-07-01",
      created_to: "2026-06-01",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una búsqueda de más de 120 caracteres", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "Segmento válido",
      statuses: [],
      primary_interests: [],
      demo_attendance_statuses: [],
      has_open_follow_up_task: "any",
      consent_contact: "any",
      search: "a".repeat(121),
    });
    expect(result.success).toBe(false);
  });
});
