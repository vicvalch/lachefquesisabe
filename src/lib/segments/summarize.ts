import { LEAD_STATUS_LABELS, PRIMARY_INTEREST_LABELS } from "@/lib/validations/lead";
import { ATTENDANCE_STATUS_LABELS } from "@/lib/validations/demo-registration";
import type { LeadSegmentCriteria } from "@/types/database";

export interface SummarizeLeadSegmentCriteriaOptions {
  demoEventTitle?: string;
  contentPostTitle?: string;
}

function formatRange(from: string | undefined, to: string | undefined): string {
  const fromLabel = from ? new Date(from).toLocaleDateString("es-ES") : "…";
  const toLabel = to ? new Date(to).toLocaleDateString("es-ES") : "…";
  return `${fromLabel} – ${toLabel}`;
}

/**
 * Texto corto y legible del criterio de un segmento, para el listado y el
 * detalle. No repite la lógica de filtrado (ver listLeadsMatchingCriteria),
 * solo describe qué hay guardado. demoEventTitle/contentPostTitle son
 * opcionales: sin ellos, esos dos filtros se describen por su id.
 */
export function summarizeLeadSegmentCriteria(
  criteria: LeadSegmentCriteria,
  options: SummarizeLeadSegmentCriteriaOptions = {},
): string {
  const parts: string[] = [];

  if (criteria.statuses && criteria.statuses.length > 0) {
    parts.push(
      `Estado: ${criteria.statuses.map((status) => LEAD_STATUS_LABELS[status]).join(", ")}`,
    );
  }

  if (criteria.primary_interests && criteria.primary_interests.length > 0) {
    parts.push(
      `Interés: ${criteria.primary_interests
        .map((interest) => PRIMARY_INTEREST_LABELS[interest])
        .join(", ")}`,
    );
  }

  if (criteria.sources && criteria.sources.length > 0) {
    parts.push(`Fuente: ${criteria.sources.join(", ")}`);
  }

  if (criteria.consent_contact !== undefined) {
    parts.push(
      criteria.consent_contact
        ? "Con consentimiento de contacto"
        : "Sin consentimiento de contacto",
    );
  }

  if (criteria.created_from || criteria.created_to) {
    parts.push(`Recibido: ${formatRange(criteria.created_from, criteria.created_to)}`);
  }

  if (criteria.last_contacted_after || criteria.last_contacted_before) {
    parts.push(
      `Último contacto: ${formatRange(criteria.last_contacted_after, criteria.last_contacted_before)}`,
    );
  }

  if (criteria.next_follow_up_after || criteria.next_follow_up_before) {
    parts.push(
      `Próximo seguimiento: ${formatRange(criteria.next_follow_up_after, criteria.next_follow_up_before)}`,
    );
  }

  if (criteria.has_open_follow_up_task !== undefined) {
    parts.push(
      criteria.has_open_follow_up_task
        ? "Con tarea de seguimiento abierta"
        : "Sin tarea de seguimiento abierta",
    );
  }

  if (criteria.demo_event_id) {
    parts.push(`Demo: ${options.demoEventTitle ?? criteria.demo_event_id}`);
  }

  if (criteria.demo_attendance_statuses && criteria.demo_attendance_statuses.length > 0) {
    parts.push(
      `Asistencia: ${criteria.demo_attendance_statuses
        .map((status) => ATTENDANCE_STATUS_LABELS[status])
        .join(", ")}`,
    );
  }

  if (criteria.content_post_id) {
    parts.push(`Contenido: ${options.contentPostTitle ?? criteria.content_post_id}`);
  }

  if (criteria.search) {
    parts.push(`Búsqueda: "${criteria.search}"`);
  }

  return parts.length > 0 ? parts.join(" · ") : "Todos los leads (sin filtros)";
}
