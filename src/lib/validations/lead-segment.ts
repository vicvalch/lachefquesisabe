import { z } from "zod";
import { LEAD_STATUS_VALUES, PRIMARY_INTEREST_VALUES } from "@/lib/validations/lead";
import { ATTENDANCE_STATUS_VALUES } from "@/lib/validations/demo-registration";

export type TriStateFilter = "any" | "yes" | "no";

const triStateValues: [TriStateFilter, ...TriStateFilter[]] = ["any", "yes", "no"];

export const CONSENT_FILTER_OPTIONS: { value: TriStateFilter; label: string }[] = [
  { value: "any", label: "Cualquiera" },
  { value: "yes", label: "Con consentimiento de contacto" },
  { value: "no", label: "Sin consentimiento de contacto" },
];

export const HAS_OPEN_TASK_OPTIONS: { value: TriStateFilter; label: string }[] = [
  { value: "any", label: "Cualquiera" },
  { value: "yes", label: "Con tarea de seguimiento abierta" },
  { value: "no", label: "Sin tarea de seguimiento abierta" },
];

export const SEARCH_MAX_LENGTH = 120;

const isoDateTimeSchema = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "La fecha no es válida");

/**
 * Shape persistido en lead_segments.criteria (jsonb). `.strict()` rechaza
 * cualquier key que no esté en esta lista: es la allowlist real de qué
 * filtros existen. Ninguno se aplica de forma insegura — todos se arman
 * con el query builder de Supabase (columna + operador conocidos, nunca
 * SQL ni fragmentos armados con el input del usuario); ver
 * listLeadsMatchingCriteria (src/lib/segments/queries.ts). Todas las keys
 * son opcionales: `{}` es un criterio válido (sin restricciones).
 */
export const leadSegmentCriteriaSchema = z
  .object({
    statuses: z.array(z.enum(LEAD_STATUS_VALUES)).optional(),
    primary_interests: z.array(z.enum(PRIMARY_INTEREST_VALUES)).optional(),
    sources: z.array(z.string().trim().min(1).max(100)).optional(),
    consent_contact: z.boolean().optional(),
    created_from: isoDateTimeSchema.optional(),
    created_to: isoDateTimeSchema.optional(),
    last_contacted_before: isoDateTimeSchema.optional(),
    last_contacted_after: isoDateTimeSchema.optional(),
    next_follow_up_before: isoDateTimeSchema.optional(),
    next_follow_up_after: isoDateTimeSchema.optional(),
    has_open_follow_up_task: z.boolean().optional(),
    demo_event_id: z.string().uuid().optional(),
    demo_attendance_statuses: z.array(z.enum(ATTENDANCE_STATUS_VALUES)).optional(),
    content_post_id: z.string().uuid().optional(),
    search: z.string().trim().min(1).max(SEARCH_MAX_LENGTH).optional(),
  })
  .strict();

export type LeadSegmentCriteriaInput = z.infer<typeof leadSegmentCriteriaSchema>;

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
 * Schema del formulario de segmento (checkboxes, selects, inputs de
 * texto/fecha) — más laxo que leadSegmentCriteriaSchema. buildLeadSegmentCriteria
 * (src/lib/segments/fields.ts) lo convierte al shape persistido: agrupa
 * `sources` en un arreglo, traduce "any"/"yes"/"no" a boolean|ausente, y
 * expande fechas de solo-día a inicio/fin de día en UTC.
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
    sources: z
      .string()
      .trim()
      .max(300, "La lista de fuentes es muy larga")
      .optional()
      .or(z.literal("")),
    consent_contact: z.enum(triStateValues).default("any"),
    created_from: optionalDateSchema,
    created_to: optionalDateSchema,
    last_contacted_before: optionalDateSchema,
    last_contacted_after: optionalDateSchema,
    next_follow_up_before: optionalDateSchema,
    next_follow_up_after: optionalDateSchema,
    has_open_follow_up_task: z.enum(triStateValues).default("any"),
    demo_event_id: z.string().uuid().optional().or(z.literal("")),
    demo_attendance_statuses: z.array(z.enum(ATTENDANCE_STATUS_VALUES)).default([]),
    content_post_id: z.string().uuid().optional().or(z.literal("")),
    search: z
      .string()
      .trim()
      .max(SEARCH_MAX_LENGTH, `La búsqueda no puede superar los ${SEARCH_MAX_LENGTH} caracteres`)
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) =>
      !data.created_from ||
      !data.created_to ||
      new Date(data.created_from).getTime() <= new Date(data.created_to).getTime(),
    {
      message: "La fecha 'recibido desde' no puede ser posterior a 'hasta'.",
      path: ["created_to"],
    },
  )
  .refine(
    (data) =>
      !data.last_contacted_after ||
      !data.last_contacted_before ||
      new Date(data.last_contacted_after).getTime() <=
        new Date(data.last_contacted_before).getTime(),
    {
      message: "El rango de último contacto no es válido.",
      path: ["last_contacted_before"],
    },
  )
  .refine(
    (data) =>
      !data.next_follow_up_after ||
      !data.next_follow_up_before ||
      new Date(data.next_follow_up_after).getTime() <=
        new Date(data.next_follow_up_before).getTime(),
    {
      message: "El rango de próximo seguimiento no es válido.",
      path: ["next_follow_up_before"],
    },
  );

export type LeadSegmentFormInput = z.infer<typeof leadSegmentFormSchema>;
