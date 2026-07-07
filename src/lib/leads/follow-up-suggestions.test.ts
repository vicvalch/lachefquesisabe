import { describe, expect, it } from "vitest";
import { getFollowUpSuggestion } from "./follow-up-suggestions";
import { WHATSAPP_TEMPLATES } from "@/lib/whatsapp/templates";
import { LEAD_STATUS_VALUES } from "@/lib/validations/lead";

const TEMPLATE_IDS = new Set(WHATSAPP_TEMPLATES.map((template) => template.id));

describe("getFollowUpSuggestion", () => {
  it("devuelve una sugerencia con un templateId que existe en WHATSAPP_TEMPLATES para cualquier estado", () => {
    for (const status of LEAD_STATUS_VALUES) {
      const suggestion = getFollowUpSuggestion(status);
      expect(TEMPLATE_IDS.has(suggestion.templateId)).toBe(true);
      expect(suggestion.taskLabel.length).toBeGreaterThan(0);
    }
  });

  it("sugiere primer_contacto para leads nuevos", () => {
    expect(getFollowUpSuggestion("new").templateId).toBe("primer_contacto");
  });

  it("sugiere recordatorio_demo para leads invitados o confirmados a una demo", () => {
    expect(getFollowUpSuggestion("invited_to_demo").templateId).toBe(
      "recordatorio_demo",
    );
    expect(getFollowUpSuggestion("confirmed_demo").templateId).toBe(
      "recordatorio_demo",
    );
  });

  it("sugiere post_demo para leads que ya asistieron o están en seguimiento post-demo", () => {
    expect(getFollowUpSuggestion("attended").templateId).toBe("post_demo");
    expect(getFollowUpSuggestion("post_demo_follow_up").templateId).toBe(
      "post_demo",
    );
  });

  it("cae en la sugerencia por defecto para estados finales como purchased o lost", () => {
    expect(getFollowUpSuggestion("purchased")).toEqual({
      taskLabel: "Dar seguimiento",
      templateId: "seguimiento",
    });
    expect(getFollowUpSuggestion("lost")).toEqual({
      taskLabel: "Dar seguimiento",
      templateId: "seguimiento",
    });
  });
});
