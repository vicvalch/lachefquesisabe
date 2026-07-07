import { describe, expect, it } from "vitest";
import {
  createOutreachCampaignSchema,
  generateCampaignTasksSchema,
} from "./outreach-campaign";

describe("createOutreachCampaignSchema", () => {
  it("acepta segmento, plantilla y nombre válidos", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: "11111111-1111-4111-8111-111111111111",
      message_template_key: "recontacto-suave",
      name: "Recontacto interesados en demo virtual",
      notes: "",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un segment_id que no es uuid", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: "no-es-un-uuid",
      message_template_key: "recontacto-suave",
      name: "Campaña válida",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando falta la plantilla", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: "11111111-1111-4111-8111-111111111111",
      message_template_key: "",
      name: "Campaña válida",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un nombre muy corto", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: "11111111-1111-4111-8111-111111111111",
      message_template_key: "recontacto-suave",
      name: "A",
    });
    expect(result.success).toBe(false);
  });
});

describe("generateCampaignTasksSchema", () => {
  it("acepta una fecha válida", () => {
    const result = generateCampaignTasksSchema.safeParse({
      due_at: "2026-08-01T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza una fecha vacía", () => {
    const result = generateCampaignTasksSchema.safeParse({ due_at: "" });
    expect(result.success).toBe(false);
  });
});
