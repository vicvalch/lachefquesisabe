import { z } from "zod";
import { dueAtSchema } from "@/lib/validations/follow-up-task";

export const createOutreachCampaignSchema = z.object({
  segment_id: z.string().uuid("Selecciona un segmento"),
  message_template_key: z.string().min(1, "Selecciona una plantilla"),
  name: z
    .string()
    .trim()
    .min(2, "El nombre es muy corto")
    .max(150, "El nombre no puede superar los 150 caracteres"),
  notes: z
    .string()
    .trim()
    .max(1000, "Las notas no pueden superar los 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type CreateOutreachCampaignInput = z.infer<
  typeof createOutreachCampaignSchema
>;

export const generateCampaignTasksSchema = z.object({
  due_at: dueAtSchema,
});

export type GenerateCampaignTasksInput = z.infer<
  typeof generateCampaignTasksSchema
>;
