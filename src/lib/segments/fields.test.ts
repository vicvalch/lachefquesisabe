import { describe, expect, it } from "vitest";
import { buildLeadSegmentFields } from "./fields";
import type { LeadSegmentFormInput } from "@/lib/validations/lead-segment";

function buildInput(overrides: Partial<LeadSegmentFormInput> = {}): LeadSegmentFormInput {
  return {
    name: "Interesados sin contactar",
    description: "",
    statuses: [],
    primary_interests: [],
    source: "",
    created_after: "",
    created_before: "",
    has_open_follow_up_task: "any",
    ...overrides,
  };
}

describe("buildLeadSegmentFields", () => {
  it("convierte campos vacíos en null y 'any' en filter_has_open_task null", () => {
    const fields = buildLeadSegmentFields(buildInput());

    expect(fields).toEqual({
      name: "Interesados sin contactar",
      description: null,
      filter_statuses: [],
      filter_primary_interests: [],
      filter_source: null,
      filter_created_after: null,
      filter_created_before: null,
      filter_has_open_task: null,
    });
  });

  it("convierte 'yes'/'no' en true/false", () => {
    expect(
      buildLeadSegmentFields(buildInput({ has_open_follow_up_task: "yes" }))
        .filter_has_open_task,
    ).toBe(true);
    expect(
      buildLeadSegmentFields(buildInput({ has_open_follow_up_task: "no" }))
        .filter_has_open_task,
    ).toBe(false);
  });

  it("convierte las fechas 'YYYY-MM-DD' a inicio y fin de día en UTC", () => {
    const fields = buildLeadSegmentFields(
      buildInput({ created_after: "2026-06-01", created_before: "2026-06-30" }),
    );

    expect(fields.filter_created_after).toBe("2026-06-01T00:00:00.000Z");
    expect(fields.filter_created_before).toBe("2026-06-30T23:59:59.999Z");
  });

  it("conserva los arreglos de status e interés y la fuente", () => {
    const fields = buildLeadSegmentFields(
      buildInput({
        statuses: ["new", "interested"],
        primary_interests: ["virtual_demo"],
        source: "landing",
      }),
    );

    expect(fields.filter_statuses).toEqual(["new", "interested"]);
    expect(fields.filter_primary_interests).toEqual(["virtual_demo"]);
    expect(fields.filter_source).toBe("landing");
  });
});
