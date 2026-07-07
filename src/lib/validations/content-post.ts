import { z } from "zod";
import type {
  ContentDifficulty,
  ContentStatus,
  ContentType,
} from "@/types/database";

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: "recipe", label: "Receta" },
  { value: "tip", label: "Tip" },
  { value: "guide", label: "Guía" },
];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> =
  Object.fromEntries(
    CONTENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<ContentType, string>;

export const CONTENT_STATUS_OPTIONS: { value: ContentStatus; label: string }[] =
  [
    { value: "draft", label: "Borrador" },
    { value: "published", label: "Publicado" },
    { value: "archived", label: "Archivado" },
  ];

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> =
  Object.fromEntries(
    CONTENT_STATUS_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<ContentStatus, string>;

export const CONTENT_DIFFICULTY_OPTIONS: {
  value: ContentDifficulty;
  label: string;
}[] = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Intermedia" },
  { value: "hard", label: "Avanzada" },
];

export const CONTENT_DIFFICULTY_LABELS: Record<ContentDifficulty, string> =
  Object.fromEntries(
    CONTENT_DIFFICULTY_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<ContentDifficulty, string>;

const contentTypeValues = CONTENT_TYPE_OPTIONS.map(
  (option) => option.value,
) as [ContentType, ...ContentType[]];

const contentStatusValues = CONTENT_STATUS_OPTIONS.map(
  (option) => option.value,
) as [ContentStatus, ...ContentStatus[]];

const contentDifficultyValues = CONTENT_DIFFICULTY_OPTIONS.map(
  (option) => option.value,
) as [ContentDifficulty, ...ContentDifficulty[]];

export const CONTENT_TYPE_VALUES = contentTypeValues;
export const CONTENT_STATUS_VALUES = contentStatusValues;

/**
 * Único estado visible para el sitio público. La RLS además exige
 * `published_at is not null and published_at <= now()`; las queries
 * públicas repiten esa condición (ver lib/content/queries.ts).
 */
export const PUBLIC_CONTENT_STATUSES: ContentStatus[] = ["published"];

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

function optionalText(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .or(z.literal(""));
}

export const contentPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Dale un título al contenido")
    .max(150, "El título es demasiado largo"),
  content_type: z.enum(contentTypeValues, {
    message: "Selecciona el tipo de contenido",
  }),
  status: z.enum(contentStatusValues, {
    message: "Selecciona un estado válido",
  }),
  category_id: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null))
    .refine(
      (value) => value === null || z.string().uuid().safeParse(value).success,
      "Categoría inválida",
    ),
  excerpt: optionalText(300, "El extracto no puede superar los 300 caracteres"),
  body: z
    .string()
    .trim()
    .min(10, "El contenido debe tener al menos 10 caracteres")
    .max(20000, "El contenido no puede superar los 20000 caracteres"),
  ingredients: optionalText(
    4000,
    "Los ingredientes no pueden superar los 4000 caracteres",
  ),
  instructions: optionalText(
    8000,
    "Las instrucciones no pueden superar los 8000 caracteres",
  ),
  prep_time_minutes: optionalInt(
    1,
    600,
    "El tiempo de preparación debe ser entre 1 y 600 minutos",
  ),
  cook_time_minutes: optionalInt(
    1,
    600,
    "El tiempo de cocción debe ser entre 1 y 600 minutos",
  ),
  servings: optionalInt(1, 100, "Las porciones deben ser entre 1 y 100"),
  difficulty: z
    .union([z.enum(contentDifficultyValues), z.literal("")])
    .optional()
    .transform((value) => (value ? value : null)),
  image_url: z
    .string()
    .trim()
    .max(500, "El link de la imagen es demasiado largo")
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "El link de la imagen debe ser una URL válida (http/https)",
    ),
  seo_title: optionalText(
    150,
    "El título SEO no puede superar los 150 caracteres",
  ),
  seo_description: optionalText(
    300,
    "La descripción SEO no puede superar los 300 caracteres",
  ),
  featured: z
    .union([z.literal("on"), z.literal(""), z.null()])
    .optional()
    .transform((value) => value === "on"),
});

export type ContentPostInput = z.infer<typeof contentPostSchema>;
