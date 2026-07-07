import type { LeadStatus } from "@/types/database";

export interface FollowUpSuggestion {
  taskLabel: string;
  templateKey: string;
}

const DEFAULT_SUGGESTION: FollowUpSuggestion = {
  taskLabel: "Dar seguimiento",
  templateKey: "seguimiento",
};

/**
 * Qué acción conviene hacer y qué plantilla de mensaje sugerir según el
 * estado comercial del lead. Esta misma sugerencia es la que usa
 * `ensureFollowUpTaskForStatus` para crear la tarea automática al cambiar
 * el estado del lead. purchased/lost no aparecen acá: son estados finales,
 * ensureFollowUpTaskForStatus cancela sus tareas pendientes en vez de
 * sugerir una nueva.
 */
const FOLLOW_UP_SUGGESTIONS: Partial<Record<LeadStatus, FollowUpSuggestion>> = {
  new: { taskLabel: "Enviar primer contacto", templateKey: "primer_contacto" },
  contacted: { taskLabel: "Dar seguimiento", templateKey: "seguimiento" },
  interested: { taskLabel: "Dar seguimiento", templateKey: "seguimiento" },
  invited_to_demo: {
    taskLabel: "Confirmar demo",
    templateKey: "invitacion_demo",
  },
  confirmed_demo: {
    taskLabel: "Recordar demo",
    templateKey: "recordatorio_demo",
  },
  no_show: { taskLabel: "Reagendar", templateKey: "reagendar" },
  attended: {
    taskLabel: "Seguimiento post-demo",
    templateKey: "post_demo",
  },
  post_demo_follow_up: {
    taskLabel: "Seguimiento post-demo",
    templateKey: "post_demo",
  },
};

export function getFollowUpSuggestion(status: LeadStatus): FollowUpSuggestion {
  return FOLLOW_UP_SUGGESTIONS[status] ?? DEFAULT_SUGGESTION;
}
