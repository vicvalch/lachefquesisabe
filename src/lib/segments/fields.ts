import type { LeadSegmentFormInput } from "@/lib/validations/lead-segment";

function startOfDayIso(dateOnly: string): string {
  return new Date(`${dateOnly}T00:00:00.000Z`).toISOString();
}

function endOfDayIso(dateOnly: string): string {
  return new Date(`${dateOnly}T23:59:59.999Z`).toISOString();
}

/**
 * Traduce el formulario de segmento (fechas "YYYY-MM-DD", has_open_follow_up_task
 * como "any"/"yes"/"no") a las columnas de lead_segments: rango de día
 * completo para las fechas, y boolean|null para el filtro de tarea abierta.
 * Comparte create y update para que ambos guarden los filtros igual.
 */
export function buildLeadSegmentFields(input: LeadSegmentFormInput) {
  return {
    name: input.name,
    description: input.description || null,
    filter_statuses: input.statuses,
    filter_primary_interests: input.primary_interests,
    filter_source: input.source || null,
    filter_created_after: input.created_after
      ? startOfDayIso(input.created_after)
      : null,
    filter_created_before: input.created_before
      ? endOfDayIso(input.created_before)
      : null,
    filter_has_open_task:
      input.has_open_follow_up_task === "any"
        ? null
        : input.has_open_follow_up_task === "yes",
  };
}
