import { describe, expect, it } from "vitest";
import { summarizeLeadSegmentFilters } from "./summarize";
import type { LeadSegmentRow } from "@/types/database";

function buildSegment(overrides: Partial<LeadSegmentRow> = {}): LeadSegmentRow {
  return {
    id: "segment-1",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    created_by: null,
    name: "Segmento de prueba",
    description: null,
    filter_statuses: [],
    filter_primary_interests: [],
    filter_source: null,
    filter_created_after: null,
    filter_created_before: null,
    filter_has_open_task: null,
    ...overrides,
  };
}

describe("summarizeLeadSegmentFilters", () => {
  it("sin filtros, describe 'todos los leads'", () => {
    expect(summarizeLeadSegmentFilters(buildSegment())).toBe(
      "Todos los leads (sin filtros)",
    );
  });

  it("incluye status e interés traducidos a su etiqueta", () => {
    const summary = summarizeLeadSegmentFilters(
      buildSegment({
        filter_statuses: ["new", "interested"],
        filter_primary_interests: ["virtual_demo"],
      }),
    );

    expect(summary).toContain("Estado: Nuevo, Interesado");
    expect(summary).toContain("Interés: Demo virtual");
  });

  it("incluye la fuente y describe 'con/sin tarea abierta'", () => {
    expect(summarizeLeadSegmentFilters(buildSegment({ filter_source: "landing" }))).toContain(
      "Fuente: landing",
    );
    expect(
      summarizeLeadSegmentFilters(buildSegment({ filter_has_open_task: true })),
    ).toContain("Con tarea de seguimiento abierta");
    expect(
      summarizeLeadSegmentFilters(buildSegment({ filter_has_open_task: false })),
    ).toContain("Sin tarea de seguimiento abierta");
  });
});
