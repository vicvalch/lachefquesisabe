import { z } from "zod";
import type { RecipeContentType, RecipeStatus } from "@/types/database";

export const RECIPE_CONTENT_TYPE_OPTIONS: {
  value: RecipeContentType;
  label: string;
}[] = [
  { value: "recipe", label: "Receta" },
  { value: "tip", label: "Tip de cocina" },
];

export const RECIPE_CONTENT_TYPE_LABELS: Record<RecipeContentType, string> =
  Object.fromEntries(
    RECIPE_CONTENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<RecipeContentType, string>;

export const RECIPE_STATUS_OPTIONS: { value: RecipeStatus; label: string }[] =
  [
    { value: "draft", label: "Borrador (no visible)" },
    { value: "published", label: "Publicada" },
  ];

export const RECIPE_STATUS_LABELS: Record<RecipeStatus, string> =
  Object.fromEntries(
    RECIPE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<RecipeStatus, string>;

const recipeContentTypeValues = RECIPE_CONTENT_TYPE_OPTIONS.map(
  (option) => option.value,
) as [RecipeContentType, ...RecipeContentType[]];

const recipeStatusValues = RECIPE_STATUS_OPTIONS.map(
  (option) => option.value,
) as [RecipeStatus, ...RecipeStatus[]];

export const RECIPE_STATUS_VALUES = recipeStatusValues;

/**
 * Únicamente las recetas "published" son visibles en /recetas. "draft"
 * nunca se lista ni se resuelve por slug en el sitio público.
 */
export const PUBLIC_RECIPE_STATUSES: RecipeStatus[] = ["published"];

function optionalInt(min: number, max: number, message: string) {
  return z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : null))
    .refine(
      (value) =>
        value === null ||
        (Number.isInteger(value) && value >= min && value <= max),
      message,
    );
}

const recipeFieldsSchema = {
  title: z
    .string()
    .trim()
    .min(2, "Dale un título a la receta")
    .max(150, "El título es demasiado largo"),
  content_type: z.enum(recipeContentTypeValues, {
    message: "Selecciona el tipo de contenido",
  }),
  summary: z
    .string()
    .trim()
    .max(300, "El resumen no puede superar los 300 caracteres")
    .optional()
    .or(z.literal("")),
  cover_image_url: z
    .string()
    .trim()
    .max(500, "El link de la imagen es demasiado largo")
    .optional()
    .or(z.literal("")),
  prep_minutes: optionalInt(
    1,
    600,
    "El tiempo de preparación debe ser entre 1 y 600 minutos",
  ),
  servings: optionalInt(1, 50, "Las porciones deben ser entre 1 y 50"),
  ingredients: z
    .string()
    .trim()
    .max(4000, "Los ingredientes no pueden superar los 4000 caracteres")
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .trim()
    .min(1, "Escribe el contenido de la receta o tip")
    .max(20000, "El contenido no puede superar los 20000 caracteres"),
  cta_message: z
    .string()
    .trim()
    .max(300, "El mensaje del CTA no puede superar los 300 caracteres")
    .optional()
    .or(z.literal("")),
};

export const createRecipeSchema = z.object(recipeFieldsSchema);

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;

export const updateRecipeSchema = z.object({
  ...recipeFieldsSchema,
  status: z.enum(recipeStatusValues, {
    message: "Selecciona un estado válido",
  }),
});

export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
