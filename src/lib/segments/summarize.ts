import { LEAD_STATUS_LABELS, PRIMARY_INTEREST_LABELS } from "@/lib/validations/lead";
import type { LeadSegmentRow } from "@/types/database";

/**
 * Texto corto y legible de los filtros de un segmento, para el listado y
 * el detalle. No repite la lógica de filtrado (ver listLeadsMatchingSegment),
 * solo describe qué hay guardado.
 */
export function summarizeLeadSegmentFilters(segment: LeadSegmentRow): string {
  const parts: string[] = [];

  if (segment.filter_statuses.length > 0) {
    parts.push(
      `Estado: ${segment.filter_statuses
        .map((status) => LEAD_STATUS_LABELS[status])
        .join(", ")}`,
    );
  }

  if (segment.filter_primary_interests.length > 0) {
    parts.push(
      `Interés: ${segment.filter_primary_interests
        .map((interest) => PRIMARY_INTEREST_LABELS[interest])
        .join(", ")}`,
    );
  }

  if (segment.filter_source) {
    parts.push(`Fuente: ${segment.filter_source}`);
  }

  if (segment.filter_created_after || segment.filter_created_before) {
    const from = segment.filter_created_after
      ? new Date(segment.filter_created_after).toLocaleDateString("es-ES")
      : "…";
    const to = segment.filter_created_before
      ? new Date(segment.filter_created_before).toLocaleDateString("es-ES")
      : "…";
    parts.push(`Recibido: ${from} – ${to}`);
  }

  if (segment.filter_has_open_task === true) {
    parts.push("Con tarea de seguimiento abierta");
  } else if (segment.filter_has_open_task === false) {
    parts.push("Sin tarea de seguimiento abierta");
  }

  return parts.length > 0 ? parts.join(" · ") : "Todos los leads (sin filtros)";
}
