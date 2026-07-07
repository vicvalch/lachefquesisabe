import { z } from "zod";

const labelSchema = z
  .string()
  .trim()
  .min(2, "El nombre de la plantilla es muy corto")
  .max(100, "El nombre de la plantilla no puede superar los 100 caracteres");

const bodySchema = z
  .string()
  .trim()
  .min(1, "Escribe el contenido del mensaje")
  .max(1000, "El mensaje no puede superar los 1000 caracteres");

export const updateMessageTemplateSchema = z.object({
  label: labelSchema,
  body: bodySchema,
  is_active: z.boolean(),
});

export type UpdateMessageTemplateInput = z.infer<
  typeof updateMessageTemplateSchema
>;

/**
 * `key` solo se define al crear la plantilla (ver createMessageTemplate):
 * kebab-case, igual que los identificadores estables sembrados por la
 * migración (`primer-contacto`, `invitacion-demo`, etc.), para que se
 * pueda referenciar desde código si hace falta.
 */
export const createMessageTemplateSchema = z.object({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "La clave es muy corta")
    .max(60, "La clave no puede superar los 60 caracteres")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Usa minúsculas, números y guiones (ej: seguimiento-compra)",
    ),
  label: labelSchema,
  body: bodySchema,
  is_active: z.boolean(),
});

export type CreateMessageTemplateInput = z.infer<
  typeof createMessageTemplateSchema
>;
