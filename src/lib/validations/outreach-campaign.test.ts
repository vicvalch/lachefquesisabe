import { describe, expect, it } from "vitest";
import { createOutreachCampaignSchema } from "./outreach-campaign";

const VALID_UUID = "11111111-1111-4111-8111-111111111111";
const OTHER_UUID = "22222222-2222-4222-8222-222222222222";

describe("createOutreachCampaignSchema", () => {
  it("acepta segmento, plantilla y nombre válidos con defaults", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: VALID_UUID,
      message_template_id: OTHER_UUID,
      name: "Recontacto interesados en demo virtual",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.task_type).toBe("whatsapp");
      expect(result.data.task_priority).toBe("medium");
    }
  });

  it("acepta task_type, task_priority, task_title, task_notes y due_at explícitos", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: VALID_UUID,
      message_template_id: OTHER_UUID,
      name: "Recontacto interesados",
      task_type: "phone",
      task_priority: "high",
      task_title: "Llamar para confirmar interés",
      task_notes: "Prioridad alta: cliente potencial de Thermomix",
      due_at: "2026-08-01T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un segment_id que no es uuid", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: "no-es-un-uuid",
      message_template_id: OTHER_UUID,
      name: "Campaña válida",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un message_template_id que no es uuid", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: VALID_UUID,
      message_template_id: "no-es-un-uuid",
      name: "Campaña válida",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un nombre muy corto", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: VALID_UUID,
      message_template_id: OTHER_UUID,
      name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un task_type inválido", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: VALID_UUID,
      message_template_id: OTHER_UUID,
      name: "Campaña válida",
      task_type: "carrier-pigeon",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un task_priority inválido", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: VALID_UUID,
      message_template_id: OTHER_UUID,
      name: "Campaña válida",
      task_priority: "urgentísima",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un due_at inválido", () => {
    const result = createOutreachCampaignSchema.safeParse({
      segment_id: VALID_UUID,
      message_template_id: OTHER_UUID,
      name: "Campaña válida",
      due_at: "no-es-una-fecha",
    });
    expect(result.success).toBe(false);
  });
});
