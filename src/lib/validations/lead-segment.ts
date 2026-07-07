import { z } from "zod";
import { LEAD_STATUS_VALUES, PRIMARY_INTEREST_VALUES } from "@/lib/validations/lead";

export type HasOpenTaskFilter = "any" | "yes" | "no";

export const HAS_OPEN_TASK_OPTIONS: { value: HasOpenTaskFilter; label: string }[] = [
  { value: "any", label: "Cualquiera" },
  { value: "yes", label: "Con tarea de seguimiento abierta" },
  { value: "no", label: "Sin tarea de seguimiento abierta" },
];

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || !Number.isNaN(new Date(value).getTime()),
    "La fecha no es válida",
  );

/**
 * Cada filtro es opcional: arreglo vacío en statuses/primary_interests, o
 * "" en source/fechas, significa "sin restricción en esa dimensión".
 * listLeadsMatchingSegment (src/lib/segments/queries.ts) los combina con AND.
 */
export const leadSegmentFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre es muy corto")
      .max(100, "El nombre no puede superar los 100 caracteres"),
    description: z
      .string()
      .trim()
      .max(500, "La descripción no puede superar los 500 caracteres")
      .optional()
      .or(z.literal("")),
    statuses: z.array(z.enum(LEAD_STATUS_VALUES)).default([]),
    primary_interests: z.array(z.enum(PRIMARY_INTEREST_VALUES)).default([]),
    source: z
      .string()
      .trim()
      .max(100, "La fuente no puede superar los 100 caracteres")
      .optional()
      .or(z.literal("")),
    created_after: optionalDateSchema,
    created_before: optionalDateSchema,
    has_open_follow_up_task: z.enum(["any", "yes", "no"]).default("any"),
  })
  .refine(
    (data) =>
      !data.created_after ||
      !data.created_before ||
      new Date(data.created_after).getTime() <=
        new Date(data.created_before).getTime(),
    {
      message: "La fecha 'desde' no puede ser posterior a 'hasta'.",
      path: ["created_before"],
    },
  );

export type LeadSegmentFormInput = z.infer<typeof leadSegmentFormSchema>;
