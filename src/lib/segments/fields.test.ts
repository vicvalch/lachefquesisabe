import { describe, expect, it } from "vitest";
import { buildLeadSegmentCriteria, buildLeadSegmentFields } from "./fields";
import type { LeadSegmentFormInput } from "@/lib/validations/lead-segment";

const VALID_UUID = "11111111-1111-4111-8111-111111111111";

function buildInput(overrides: Partial<LeadSegmentFormInput> = {}): LeadSegmentFormInput {
  return {
    name: "Interesados sin contactar",
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
    ...overrides,
  };
}

describe("buildLeadSegmentCriteria", () => {
  it("un formulario vacío produce un criterio vacío (sin keys)", () => {
    expect(buildLeadSegmentCriteria(buildInput())).toEqual({});
  });

  it("omite consent_contact/has_open_follow_up_task cuando son 'any'", () => {
    const criteria = buildLeadSegmentCriteria(buildInput());
    expect(criteria).not.toHaveProperty("consent_contact");
    expect(criteria).not.toHaveProperty("has_open_follow_up_task");
  });

  it("convierte 'yes'/'no' en true/false", () => {
    expect(
      buildLeadSegmentCriteria(buildInput({ consent_contact: "yes" }))
        .consent_contact,
    ).toBe(true);
    expect(
      buildLeadSegmentCriteria(buildInput({ consent_contact: "no" }))
        .consent_contact,
    ).toBe(false);
    expect(
      buildLeadSegmentCriteria(buildInput({ has_open_follow_up_task: "yes" }))
        .has_open_follow_up_task,
    ).toBe(true);
  });

  it("parsea sources separadas por coma en un arreglo sin vacíos", () => {
    const criteria = buildLeadSegmentCriteria(
      buildInput({ sources: "landing,  demo , " }),
    );
    expect(criteria.sources).toEqual(["landing", "demo"]);
  });

  it("convierte created_from/created_to a inicio/fin de día en UTC", () => {
    const criteria = buildLeadSegmentCriteria(
      buildInput({ created_from: "2026-06-01", created_to: "2026-06-30" }),
    );
    expect(criteria.created_from).toBe("2026-06-01T00:00:00.000Z");
    expect(criteria.created_to).toBe("2026-06-30T23:59:59.999Z");
  });

  it("convierte los rangos de último contacto y próximo seguimiento", () => {
    const criteria = buildLeadSegmentCriteria(
      buildInput({
        last_contacted_after: "2026-05-01",
        last_contacted_before: "2026-05-31",
        next_follow_up_after: "2026-07-01",
        next_follow_up_before: "2026-07-31",
      }),
    );
    expect(criteria.last_contacted_after).toBe("2026-05-01T00:00:00.000Z");
    expect(criteria.last_contacted_before).toBe("2026-05-31T23:59:59.999Z");
    expect(criteria.next_follow_up_after).toBe("2026-07-01T00:00:00.000Z");
    expect(criteria.next_follow_up_before).toBe("2026-07-31T23:59:59.999Z");
  });

  it("conserva statuses, primary_interests, demo_event_id, demo_attendance_statuses, content_post_id y search", () => {
    const criteria = buildLeadSegmentCriteria(
      buildInput({
        statuses: ["new", "interested"],
        primary_interests: ["virtual_demo"],
        demo_event_id: VALID_UUID,
        demo_attendance_statuses: ["confirmed"],
        content_post_id: VALID_UUID,
        search: "ana",
      }),
    );

    expect(criteria.statuses).toEqual(["new", "interested"]);
    expect(criteria.primary_interests).toEqual(["virtual_demo"]);
    expect(criteria.demo_event_id).toBe(VALID_UUID);
    expect(criteria.demo_attendance_statuses).toEqual(["confirmed"]);
    expect(criteria.content_post_id).toBe(VALID_UUID);
    expect(criteria.search).toBe("ana");
  });
});

describe("buildLeadSegmentFields", () => {
  it("arma name/description/criteria", () => {
    const fields = buildLeadSegmentFields(
      buildInput({ name: "Segmento X", description: "Una descripción" }),
    );

    expect(fields).toEqual({
      name: "Segmento X",
      description: "Una descripción",
      criteria: {},
    });
  });

  it("convierte descripción vacía en null", () => {
    expect(buildLeadSegmentFields(buildInput()).description).toBeNull();
  });
});
