import { z } from "zod";

export const createContentCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Dale un nombre a la categoría")
    .max(100, "El nombre es demasiado largo"),
  slug: z
    .string()
    .trim()
    .min(2, "El slug es demasiado corto")
    .max(120, "El slug es demasiado largo")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "El slug solo puede tener minúsculas, números y guiones",
    ),
  description: z
    .string()
    .trim()
    .max(300, "La descripción no puede superar los 300 caracteres")
    .optional()
    .or(z.literal("")),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type CreateContentCategoryInput = z.infer<
  typeof createContentCategorySchema
>;
