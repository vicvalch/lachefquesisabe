import { describe, expect, it } from "vitest";
import { getFollowUpSuggestion } from "./follow-up-suggestions";
import { LEAD_STATUS_VALUES } from "@/lib/validations/lead";

describe("getFollowUpSuggestion", () => {
  it("devuelve una sugerencia con taskLabel, templateKey y source para cualquier estado", () => {
    for (const status of LEAD_STATUS_VALUES) {
      const suggestion = getFollowUpSuggestion(status);
      expect(suggestion.taskLabel.length).toBeGreaterThan(0);
      expect(suggestion.templateKey.length).toBeGreaterThan(0);
      expect(suggestion.source.length).toBeGreaterThan(0);
    }
  });

  it("sugiere primer-contacto / initial_contact para leads nuevos", () => {
    const suggestion = getFollowUpSuggestion("new");
    expect(suggestion.templateKey).toBe("primer-contacto");
    expect(suggestion.source).toBe("initial_contact");
  });

  it("sugiere invitacion-demo / demo_invitation para leads invitados a una demo", () => {
    const suggestion = getFollowUpSuggestion("invited_to_demo");
    expect(suggestion.templateKey).toBe("invitacion-demo");
    expect(suggestion.source).toBe("demo_invitation");
  });

  it("sugiere recordatorio-demo / demo_confirmation para leads que confirmaron una demo", () => {
    const suggestion = getFollowUpSuggestion("confirmed_demo");
    expect(suggestion.templateKey).toBe("recordatorio-demo");
    expect(suggestion.source).toBe("demo_confirmation");
  });

  it("sugiere recuperacion-no-show / no_show_recovery para leads que no asistieron", () => {
    const suggestion = getFollowUpSuggestion("no_show");
    expect(suggestion.templateKey).toBe("recuperacion-no-show");
    expect(suggestion.source).toBe("no_show_recovery");
  });

  it("sugiere seguimiento-post-demo / post_demo_follow_up para leads que ya asistieron o están en seguimiento post-demo", () => {
    for (const status of ["attended", "post_demo_follow_up"] as const) {
      const suggestion = getFollowUpSuggestion(status);
      expect(suggestion.templateKey).toBe("seguimiento-post-demo");
      expect(suggestion.source).toBe("post_demo_follow_up");
    }
  });

  it("cae en la sugerencia por defecto para estados finales como purchased o lost", () => {
    expect(getFollowUpSuggestion("purchased")).toEqual({
      taskLabel: "Dar seguimiento",
      templateKey: "recontacto-suave",
      source: "status_change",
    });
    expect(getFollowUpSuggestion("lost")).toEqual({
      taskLabel: "Dar seguimiento",
      templateKey: "recontacto-suave",
      source: "status_change",
    });
  });
});
