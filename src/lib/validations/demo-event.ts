import { z } from "zod";
import type { DemoEventStatus, DemoMode } from "@/types/database";

export const DEMO_MODE_OPTIONS: { value: DemoMode; label: string }[] = [
  { value: "in_person", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
];

export const DEMO_MODE_LABELS: Record<DemoMode, string> = Object.fromEntries(
  DEMO_MODE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<DemoMode, string>;

export const DEMO_EVENT_STATUS_OPTIONS: {
  value: DemoEventStatus;
  label: string;
}[] = [
  { value: "draft", label: "Borrador (no visible)" },
  { value: "scheduled", label: "Programada" },
  { value: "full", label: "Cupo lleno" },
  { value: "completed", label: "Realizada" },
  { value: "cancelled", label: "Cancelada" },
];

export const DEMO_EVENT_STATUS_LABELS: Record<DemoEventStatus, string> =
  Object.fromEntries(
    DEMO_EVENT_STATUS_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<DemoEventStatus, string>;

const demoModeValues = DEMO_MODE_OPTIONS.map((option) => option.value) as [
  DemoMode,
  ...DemoMode[],
];

const demoEventStatusValues = DEMO_EVENT_STATUS_OPTIONS.map(
  (option) => option.value,
) as [DemoEventStatus, ...DemoEventStatus[]];

export const DEMO_EVENT_STATUS_VALUES = demoEventStatusValues;

/**
 * Estados visibles para el sitio público: una demo "scheduled" o "full"
 * con fecha futura. "draft", "completed" y "cancelled" nunca se listan.
 */
export const PUBLIC_DEMO_EVENT_STATUSES: DemoEventStatus[] = [
  "scheduled",
  "full",
];

export const createDemoEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Dale un título a la demo")
    .max(150, "El título es demasiado largo"),
  description: z
    .string()
    .trim()
    .max(1000, "La descripción no puede superar los 1000 caracteres")
    .optional()
    .or(z.literal("")),
  public_notes: z
    .string()
    .trim()
    .max(500, "Las notas públicas no pueden superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
  mode: z.enum(demoModeValues, {
    message: "Selecciona la modalidad de la demo",
  }),
  starts_at: z
    .string()
    .trim()
    .min(1, "Indica la fecha y hora de inicio")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "La fecha de inicio no es válida",
    ),
  ends_at: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
      "La fecha de fin no es válida",
    ),
  location_name: z
    .string()
    .trim()
    .max(150, "El nombre del lugar es demasiado largo")
    .optional()
    .or(z.literal("")),
  location_address: z
    .string()
    .trim()
    .max(250, "La dirección es demasiado larga")
    .optional()
    .or(z.literal("")),
  meeting_url: z
    .string()
    .trim()
    .max(500, "El link es demasiado largo")
    .optional()
    .or(z.literal("")),
  capacity: z.coerce
    .number()
    .int("El cupo debe ser un número entero")
    .min(1, "El cupo debe ser al menos 1")
    .max(200, "El cupo no puede superar las 200 personas"),
  internal_notes: z
    .string()
    .trim()
    .max(2000, "Las notas no pueden superar los 2000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type CreateDemoEventInput = z.infer<typeof createDemoEventSchema>;

export const updateDemoEventStatusSchema = z.object({
  status: z.enum(demoEventStatusValues, {
    message: "Selecciona un estado válido",
  }),
  internal_notes: z
    .string()
    .trim()
    .max(2000, "Las notas no pueden superar los 2000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type UpdateDemoEventStatusInput = z.infer<
  typeof updateDemoEventStatusSchema
>;
