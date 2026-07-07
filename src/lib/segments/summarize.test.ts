import { describe, expect, it } from "vitest";
import { summarizeLeadSegmentCriteria } from "./summarize";

describe("summarizeLeadSegmentCriteria", () => {
  it("sin filtros, describe 'todos los leads'", () => {
    expect(summarizeLeadSegmentCriteria({})).toBe("Todos los leads (sin filtros)");
  });

  it("incluye status e interés traducidos a su etiqueta", () => {
    const summary = summarizeLeadSegmentCriteria({
      statuses: ["new", "interested"],
      primary_interests: ["virtual_demo"],
    });

    expect(summary).toContain("Estado: Nuevo, Interesado");
    expect(summary).toContain("Interés: Demo virtual");
  });

  it("incluye sources y describe 'con/sin consentimiento' y 'con/sin tarea abierta'", () => {
    expect(summarizeLeadSegmentCriteria({ sources: ["landing", "demo"] })).toContain(
      "Fuente: landing, demo",
    );
    expect(summarizeLeadSegmentCriteria({ consent_contact: true })).toContain(
      "Con consentimiento de contacto",
    );
    expect(summarizeLeadSegmentCriteria({ consent_contact: false })).toContain(
      "Sin consentimiento de contacto",
    );
    expect(
      summarizeLeadSegmentCriteria({ has_open_follow_up_task: true }),
    ).toContain("Con tarea de seguimiento abierta");
    expect(
      summarizeLeadSegmentCriteria({ has_open_follow_up_task: false }),
    ).toContain("Sin tarea de seguimiento abierta");
  });

  it("usa el título de demo/contenido cuando se pasa, o el id si no", () => {
    expect(
      summarizeLeadSegmentCriteria({ demo_event_id: "demo-1" }),
    ).toContain("Demo: demo-1");
    expect(
      summarizeLeadSegmentCriteria(
        { demo_event_id: "demo-1" },
        { demoEventTitle: "Demo de recetas" },
      ),
    ).toContain("Demo: Demo de recetas");
    expect(
      summarizeLeadSegmentCriteria(
        { content_post_id: "post-1" },
        { contentPostTitle: "Receta de arroz" },
      ),
    ).toContain("Contenido: Receta de arroz");
  });

  it("incluye la asistencia a demos y el término de búsqueda", () => {
    expect(
      summarizeLeadSegmentCriteria({ demo_attendance_statuses: ["confirmed"] }),
    ).toContain("Asistencia: Confirmó asistencia");
    expect(summarizeLeadSegmentCriteria({ search: "ana" })).toContain(
      'Búsqueda: "ana"',
    );
  });
});
