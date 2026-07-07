import type { LeadStatus, TaskSource } from "@/types/database";

export interface FollowUpSuggestion {
  taskLabel: string;
  templateKey: string;
  source: TaskSource;
}

const DEFAULT_SUGGESTION: FollowUpSuggestion = {
  taskLabel: "Dar seguimiento",
  templateKey: "recontacto-suave",
  source: "status_change",
};

/**
 * Qué acción conviene hacer, qué plantilla de mensaje sugerir y bajo qué
 * "source" (tipo de evento) registrar la tarea, según el estado comercial
 * del lead. Esta misma sugerencia es la que usa
 * `ensureFollowUpTaskForStatus` para crear la tarea automática al cambiar
 * el estado del lead. purchased/lost no aparecen acá: son estados finales,
 * ensureFollowUpTaskForStatus cancela sus tareas abiertas en vez de
 * sugerir una nueva.
 */
const FOLLOW_UP_SUGGESTIONS: Partial<Record<LeadStatus, FollowUpSuggestion>> = {
  new: {
    taskLabel: "Enviar primer contacto",
    templateKey: "primer-contacto",
    source: "initial_contact",
  },
  contacted: {
    taskLabel: "Dar seguimiento",
    templateKey: "recontacto-suave",
    source: "status_change",
  },
  interested: {
    taskLabel: "Dar seguimiento",
    templateKey: "recontacto-suave",
    source: "status_change",
  },
  invited_to_demo: {
    taskLabel: "Confirmar demo",
    templateKey: "invitacion-demo",
    source: "demo_invitation",
  },
  confirmed_demo: {
    taskLabel: "Recordar demo",
    templateKey: "recordatorio-demo",
    source: "demo_confirmation",
  },
  no_show: {
    taskLabel: "Reagendar",
    templateKey: "recuperacion-no-show",
    source: "no_show_recovery",
  },
  attended: {
    taskLabel: "Seguimiento post-demo",
    templateKey: "seguimiento-post-demo",
    source: "post_demo_follow_up",
  },
  post_demo_follow_up: {
    taskLabel: "Seguimiento post-demo",
    templateKey: "seguimiento-post-demo",
    source: "post_demo_follow_up",
  },
};

export function getFollowUpSuggestion(status: LeadStatus): FollowUpSuggestion {
  return FOLLOW_UP_SUGGESTIONS[status] ?? DEFAULT_SUGGESTION;
}
