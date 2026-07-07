import type { LeadSegmentCriteria } from "@/types/database";
import type { LeadSegmentFormInput } from "@/lib/validations/lead-segment";

function startOfDayIso(dateOnly: string): string {
  return new Date(`${dateOnly}T00:00:00.000Z`).toISOString();
}

function endOfDayIso(dateOnly: string): string {
  return new Date(`${dateOnly}T23:59:59.999Z`).toISOString();
}

function parseSources(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined;

  const sources = raw
    .split(",")
    .map((source) => source.trim())
    .filter((source) => source.length > 0);

  return sources.length > 0 ? sources : undefined;
}

/**
 * Traduce el formulario de segmento (checkboxes, tri-estados
 * "any"/"yes"/"no", fechas "YYYY-MM-DD" de solo día) al criterio
 * persistido (LeadSegmentCriteria, ver src/types/database.ts): arreglos
 * vacíos y strings vacíos se omiten (key ausente = sin restricción en esa
 * dimensión), "yes"/"no" pasan a boolean, y las fechas se expanden a
 * inicio/fin de día en UTC.
 */
export function buildLeadSegmentCriteria(
  input: LeadSegmentFormInput,
): LeadSegmentCriteria {
  const criteria: LeadSegmentCriteria = {};

  if (input.statuses.length > 0) {
    criteria.statuses = input.statuses;
  }
  if (input.primary_interests.length > 0) {
    criteria.primary_interests = input.primary_interests;
  }

  const sources = parseSources(input.sources);
  if (sources) {
    criteria.sources = sources;
  }

  if (input.consent_contact !== "any") {
    criteria.consent_contact = input.consent_contact === "yes";
  }
  if (input.has_open_follow_up_task !== "any") {
    criteria.has_open_follow_up_task = input.has_open_follow_up_task === "yes";
  }

  if (input.created_from) {
    criteria.created_from = startOfDayIso(input.created_from);
  }
  if (input.created_to) {
    criteria.created_to = endOfDayIso(input.created_to);
  }
  if (input.last_contacted_after) {
    criteria.last_contacted_after = startOfDayIso(input.last_contacted_after);
  }
  if (input.last_contacted_before) {
    criteria.last_contacted_before = endOfDayIso(input.last_contacted_before);
  }
  if (input.next_follow_up_after) {
    criteria.next_follow_up_after = startOfDayIso(input.next_follow_up_after);
  }
  if (input.next_follow_up_before) {
    criteria.next_follow_up_before = endOfDayIso(input.next_follow_up_before);
  }

  if (input.demo_event_id) {
    criteria.demo_event_id = input.demo_event_id;
  }
  if (input.demo_attendance_statuses.length > 0) {
    criteria.demo_attendance_statuses = input.demo_attendance_statuses;
  }
  if (input.content_post_id) {
    criteria.content_post_id = input.content_post_id;
  }
  if (input.search) {
    criteria.search = input.search;
  }

  return criteria;
}

export function buildLeadSegmentFields(input: LeadSegmentFormInput) {
  return {
    name: input.name,
    description: input.description || null,
    criteria: buildLeadSegmentCriteria(input),
  };
}
