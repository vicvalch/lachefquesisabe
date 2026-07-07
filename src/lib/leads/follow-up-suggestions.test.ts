import { describe, expect, it } from "vitest";
import { getFollowUpSuggestion } from "./follow-up-suggestions";
import { LEAD_STATUS_VALUES } from "@/lib/validations/lead";

describe("getFollowUpSuggestion", () => {
  it("devuelve una sugerencia con taskLabel y templateKey para cualquier estado", () => {
    for (const status of LEAD_STATUS_VALUES) {
      const suggestion = getFollowUpSuggestion(status);
      expect(suggestion.taskLabel.length).toBeGreaterThan(0);
      expect(suggestion.templateKey.length).toBeGreaterThan(0);
    }
  });

  it("sugiere primer_contacto para leads nuevos", () => {
    expect(getFollowUpSuggestion("new").templateKey).toBe("primer_contacto");
  });

  it("sugiere invitacion_demo para leads invitados a una demo", () => {
    expect(getFollowUpSuggestion("invited_to_demo").templateKey).toBe(
      "invitacion_demo",
    );
  });

  it("sugiere recordatorio_demo para leads que confirmaron una demo", () => {
    expect(getFollowUpSuggestion("confirmed_demo").templateKey).toBe(
      "recordatorio_demo",
    );
  });

  it("sugiere reagendar para leads que no asistieron", () => {
    expect(getFollowUpSuggestion("no_show").templateKey).toBe("reagendar");
  });

  it("sugiere post_demo para leads que ya asistieron o están en seguimiento post-demo", () => {
    expect(getFollowUpSuggestion("attended").templateKey).toBe("post_demo");
    expect(getFollowUpSuggestion("post_demo_follow_up").templateKey).toBe(
      "post_demo",
    );
  });

  it("cae en la sugerencia por defecto para estados finales como purchased o lost", () => {
    expect(getFollowUpSuggestion("purchased")).toEqual({
      taskLabel: "Dar seguimiento",
      templateKey: "seguimiento",
    });
    expect(getFollowUpSuggestion("lost")).toEqual({
      taskLabel: "Dar seguimiento",
      templateKey: "seguimiento",
    });
  });
});
