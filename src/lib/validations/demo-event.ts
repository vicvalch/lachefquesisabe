import { z } from "zod";
import type { DemoEventStatus, DemoType } from "@/types/database";

export const DEMO_TYPE_OPTIONS: { value: DemoType; label: string }[] = [
  { value: "in_person", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
];

export const DEMO_TYPE_LABELS: Record<DemoType, string> = Object.fromEntries(
  DEMO_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<DemoType, string>;

export const DEMO_EVENT_STATUS_OPTIONS: {
  value: DemoEventStatus;
  label: string;
}[] = [
  { value: "scheduled", label: "Programada" },
  { value: "completed", label: "Realizada" },
  { value: "cancelled", label: "Cancelada" },
];

export const DEMO_EVENT_STATUS_LABELS: Record<DemoEventStatus, string> =
  Object.fromEntries(
    DEMO_EVENT_STATUS_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<DemoEventStatus, string>;

const demoTypeValues = DEMO_TYPE_OPTIONS.map((option) => option.value) as [
  DemoType,
  ...DemoType[],
];

const demoEventStatusValues = DEMO_EVENT_STATUS_OPTIONS.map(
  (option) => option.value,
) as [DemoEventStatus, ...DemoEventStatus[]];

export const DEMO_EVENT_STATUS_VALUES = demoEventStatusValues;

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
  demo_type: z.enum(demoTypeValues, {
    message: "Selecciona el tipo de demo",
  }),
  location: z
    .string()
    .trim()
    .max(200, "La ubicación es demasiado larga")
    .optional()
    .or(z.literal("")),
  scheduled_at: z
    .string()
    .trim()
    .min(1, "Indica la fecha y hora de la demo")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "La fecha de la demo no es válida",
    ),
  capacity: z.coerce
    .number()
    .int("El cupo debe ser un número entero")
    .min(1, "El cupo debe ser al menos 1")
    .max(200, "El cupo no puede superar las 200 personas"),
  notes: z
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
  notes: z
    .string()
    .trim()
    .max(2000, "Las notas no pueden superar los 2000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type UpdateDemoEventStatusInput = z.infer<
  typeof updateDemoEventStatusSchema
>;
