import type { LeadStatus } from "@/types/database";
import type { WhatsAppTemplateId } from "@/lib/whatsapp/templates";

export interface FollowUpSuggestion {
  taskLabel: string;
  templateId: WhatsAppTemplateId;
}

const DEFAULT_SUGGESTION: FollowUpSuggestion = {
  taskLabel: "Dar seguimiento",
  templateId: "seguimiento",
};

/**
 * Qué acción conviene hacer y qué plantilla de WhatsApp sugerir según el
 * estado comercial del lead. purchased/lost caen en DEFAULT_SUGGESTION: son
 * estados finales, si igual tienen next_follow_up_at es un caso raro que no
 * necesita una plantilla dedicada.
 */
const FOLLOW_UP_SUGGESTIONS: Partial<Record<LeadStatus, FollowUpSuggestion>> = {
  new: { taskLabel: "Enviar primer contacto", templateId: "primer_contacto" },
  contacted: { taskLabel: "Dar seguimiento", templateId: "seguimiento" },
  interested: { taskLabel: "Dar seguimiento", templateId: "seguimiento" },
  invited_to_demo: {
    taskLabel: "Confirmar demo",
    templateId: "recordatorio_demo",
  },
  confirmed_demo: {
    taskLabel: "Recordar demo",
    templateId: "recordatorio_demo",
  },
  no_show: { taskLabel: "Reagendar", templateId: "seguimiento" },
  attended: {
    taskLabel: "Seguimiento post-demo",
    templateId: "post_demo",
  },
  post_demo_follow_up: {
    taskLabel: "Seguimiento post-demo",
    templateId: "post_demo",
  },
};

export function getFollowUpSuggestion(status: LeadStatus): FollowUpSuggestion {
  return FOLLOW_UP_SUGGESTIONS[status] ?? DEFAULT_SUGGESTION;
}
