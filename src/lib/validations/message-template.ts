import { z } from "zod";

export const updateMessageTemplateSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "El nombre de la plantilla es muy corto")
    .max(100, "El nombre de la plantilla no puede superar los 100 caracteres"),
  body: z
    .string()
    .trim()
    .min(1, "Escribe el contenido del mensaje")
    .max(1000, "El mensaje no puede superar los 1000 caracteres"),
  is_active: z.boolean(),
});

export type UpdateMessageTemplateInput = z.infer<
  typeof updateMessageTemplateSchema
>;
