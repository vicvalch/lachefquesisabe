import { z } from "zod";
import { CONTACT_CHANNEL_VALUES } from "@/lib/validations/contact-log";
import type {
  CampaignRecipientStatus,
  CampaignStatus,
  CampaignTaskPriority,
} from "@/types/database";

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Borrador",
  ready: "Lista",
  tasks_created: "Tareas creadas",
  completed: "Completada",
  cancelled: "Cancelada",
};

export const CAMPAIGN_RECIPIENT_STATUS_LABELS: Record<CampaignRecipientStatus, string> = {
  selected: "Seleccionado",
  task_created: "Tarea creada",
  skipped: "Saltado",
  cancelled: "Cancelado",
};

export const CAMPAIGN_TASK_PRIORITY_OPTIONS: {
  value: CampaignTaskPriority;
  label: string;
}[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

export const CAMPAIGN_TASK_PRIORITY_LABELS: Record<CampaignTaskPriority, string> =
  Object.fromEntries(
    CAMPAIGN_TASK_PRIORITY_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<CampaignTaskPriority, string>;

const campaignTaskPriorityValues = CAMPAIGN_TASK_PRIORITY_OPTIONS.map(
  (option) => option.value,
) as [CampaignTaskPriority, ...CampaignTaskPriority[]];

const optionalDateTimeSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || !Number.isNaN(new Date(value).getTime()),
    "La fecha no es válida",
  );

/**
 * Una campaña es una configuración: qué segmento, qué plantilla y cómo
 * debería verse la tarea que se genere por cada destinatario (task_type,
 * task_priority, task_title/task_notes, due_at). No dispara nada por sí
 * sola — eso lo hacen, en dos pasos separados, materializeCampaignRecipients
 * y generateFollowUpTasksForCampaign (src/lib/campaigns).
 */
export const createOutreachCampaignSchema = z.object({
  segment_id: z.string().uuid("Selecciona un segmento"),
  message_template_id: z.string().uuid("Selecciona una plantilla"),
  name: z
    .string()
    .trim()
    .min(2, "El nombre es muy corto")
    .max(150, "El nombre no puede superar los 150 caracteres"),
  description: z
    .string()
    .trim()
    .max(1000, "La descripción no puede superar los 1000 caracteres")
    .optional()
    .or(z.literal("")),
  task_type: z.enum(CONTACT_CHANNEL_VALUES).default("whatsapp"),
  task_priority: z.enum(campaignTaskPriorityValues).default("medium"),
  task_title: z
    .string()
    .trim()
    .min(2, "El título de la tarea es muy corto")
    .max(150, "El título de la tarea no puede superar los 150 caracteres")
    .optional()
    .or(z.literal("")),
  task_notes: z
    .string()
    .trim()
    .max(500, "Las notas de la tarea no pueden superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
  due_at: optionalDateTimeSchema,
});

export type CreateOutreachCampaignInput = z.infer<
  typeof createOutreachCampaignSchema
>;
