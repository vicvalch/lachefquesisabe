import { describe, expect, it } from "vitest";
import { leadSegmentFormSchema } from "./lead-segment";

describe("leadSegmentFormSchema", () => {
  it("acepta un segmento sin ningún filtro (arreglos vacíos, sin fechas)", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "Todos los leads",
      description: "",
      statuses: [],
      primary_interests: [],
      source: "",
      created_after: "",
      created_before: "",
      has_open_follow_up_task: "any",
    });
    expect(result.success).toBe(true);
  });

  it("acepta filtros combinados de status, interés, fuente y fecha", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "Interesados en demo virtual sin contactar",
      description: "Para la campaña de julio",
      statuses: ["new", "interested"],
      primary_interests: ["virtual_demo"],
      source: "landing",
      created_after: "2026-06-01",
      created_before: "2026-07-01",
      has_open_follow_up_task: "no",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un nombre muy corto", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "A",
      statuses: [],
      primary_interests: [],
      has_open_follow_up_task: "any",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un status inválido", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "Segmento válido",
      statuses: ["no-existe"],
      primary_interests: [],
      has_open_follow_up_task: "any",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando 'desde' es posterior a 'hasta'", () => {
    const result = leadSegmentFormSchema.safeParse({
      name: "Segmento válido",
      statuses: [],
      primary_interests: [],
      created_after: "2026-07-01",
      created_before: "2026-06-01",
      has_open_follow_up_task: "any",
    });
    expect(result.success).toBe(false);
  });
});
