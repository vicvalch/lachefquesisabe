import { z } from "zod";
import type { RecipeVideoDifficulty, RecipeVideoStatus } from "@/types/database";
import { extractYoutubeVideoId } from "@/lib/recipe-videos/youtube";

export const RECIPE_VIDEO_STATUS_OPTIONS: { value: RecipeVideoStatus; label: string }[] =
  [
    { value: "draft", label: "Borrador" },
    { value: "published", label: "Publicado" },
    { value: "archived", label: "Archivado" },
  ];

export const RECIPE_VIDEO_STATUS_LABELS: Record<RecipeVideoStatus, string> =
  Object.fromEntries(
    RECIPE_VIDEO_STATUS_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<RecipeVideoStatus, string>;

export const RECIPE_VIDEO_DIFFICULTY_OPTIONS: {
  value: RecipeVideoDifficulty;
  label: string;
}[] = [
  { value: "facil", label: "Fácil" },
  { value: "media", label: "Media" },
  { value: "avanzada", label: "Avanzada" },
];

export const RECIPE_VIDEO_DIFFICULTY_LABELS: Record<RecipeVideoDifficulty, string> =
  Object.fromEntries(
    RECIPE_VIDEO_DIFFICULTY_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<RecipeVideoDifficulty, string>;

const statusValues = RECIPE_VIDEO_STATUS_OPTIONS.map(
  (option) => option.value,
) as [RecipeVideoStatus, ...RecipeVideoStatus[]];

const difficultyValues = RECIPE_VIDEO_DIFFICULTY_OPTIONS.map(
  (option) => option.value,
) as [RecipeVideoDifficulty, ...RecipeVideoDifficulty[]];

export const RECIPE_VIDEO_STATUS_VALUES = statusValues;

/**
 * Único estado visible para el sitio público. La RLS además exige
 * `published_at is not null and published_at <= now()`; la query pública
 * repite esa condición (ver lib/recipe-videos/queries.ts).
 */
export const PUBLIC_RECIPE_VIDEO_STATUSES: RecipeVideoStatus[] = ["published"];

function optionalInt(min: number, max: number, message: string) {
  return z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : null))
    .refine(
      (value) =>
        value === null || (Number.isInteger(value) && value >= min && value <= max),
      message,
    );
}

function optionalText(max: number, message: string) {
  return z.string().trim().max(max, message).optional().or(z.literal(""));
}

function linesToArray(value: string | undefined) {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export const recipeVideoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Dale un título al video")
    .max(150, "El título es demasiado largo"),
  description: optionalText(500, "La descripción no puede superar los 500 caracteres"),
  youtube_url: z
    .string()
    .trim()
    .min(1, "El link de YouTube es obligatorio")
    .max(500, "El link es demasiado largo")
    .refine(
      (value) => extractYoutubeVideoId(value) !== null,
      "Ingresa un link válido de YouTube",
    ),
  thumbnail_url: z
    .string()
    .trim()
    .max(500, "El link de la miniatura es demasiado largo")
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "El link de la miniatura debe ser una URL válida (http/https)",
    ),
  category: z
    .string()
    .trim()
    .min(2, "La categoría es obligatoria")
    .max(60, "La categoría es demasiado larga")
    .optional()
    .or(z.literal(""))
    .transform((value) => value || "recetas"),
  difficulty: z
    .union([z.enum(difficultyValues), z.literal("")])
    .optional()
    .transform((value) => (value ? value : null)),
  duration_minutes: optionalInt(1, 600, "La duración debe ser entre 1 y 600 minutos"),
  ingredients: z
    .string()
    .trim()
    .max(2000, "Los ingredientes no pueden superar los 2000 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((value) => linesToArray(value)),
  tags: z
    .string()
    .trim()
    .max(300, "Las etiquetas son demasiado largas")
    .optional()
    .or(z.literal(""))
    .transform((value) =>
      (value ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  status: z.enum(statusValues, { message: "Selecciona un estado válido" }),
});

export type RecipeVideoInput = z.infer<typeof recipeVideoSchema>;
