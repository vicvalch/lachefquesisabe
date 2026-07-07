import { z } from "zod";
import type { LeadStatus, PrimaryInterest } from "@/types/database";

export const PRIMARY_INTEREST_OPTIONS: { value: PrimaryInterest; label: string }[] =
  [
    { value: "easy_recipes", label: "Recetas fáciles" },
    { value: "save_time", label: "Ahorrar tiempo" },
    { value: "in_person_demo", label: "Demo presencial" },
    { value: "virtual_demo", label: "Demo virtual" },
    { value: "buy_thermomix", label: "Comprar una Thermomix" },
    { value: "more_info", label: "Más información" },
  ];

export const PRIMARY_INTEREST_LABELS: Record<PrimaryInterest, string> =
  Object.fromEntries(
    PRIMARY_INTEREST_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<PrimaryInterest, string>;

export const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "interested", label: "Interesado" },
  { value: "invited_to_demo", label: "Invitado a demo" },
  { value: "confirmed_demo", label: "Confirmó demo" },
  { value: "attended", label: "Asistió" },
  { value: "no_show", label: "No asistió" },
  { value: "post_demo_follow_up", label: "Seguimiento post-demo" },
  { value: "purchased", label: "Compró" },
  { value: "lost", label: "Perdido" },
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> =
  Object.fromEntries(
    LEAD_STATUS_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<LeadStatus, string>;

const primaryInterestValues = PRIMARY_INTEREST_OPTIONS.map(
  (option) => option.value,
) as [PrimaryInterest, ...PrimaryInterest[]];

const leadStatusValues = LEAD_STATUS_OPTIONS.map((option) => option.value) as [
  LeadStatus,
  ...LeadStatus[],
];

export const LEAD_STATUS_VALUES = leadStatusValues;

export const leadFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Cuéntanos tu nombre completo")
    .max(100, "El nombre es demasiado largo"),
  email: z
    .string()
    .trim()
    .min(1, "Tu email es necesario para contactarte")
    .email("Ingresa un email válido"),
  phone: z
    .string()
    .trim()
    .max(20, "El teléfono es demasiado largo")
    .optional()
    .or(z.literal("")),
  primary_interest: z.enum(primaryInterestValues, {
    message: "Selecciona qué te interesa",
  }),
  message: z
    .string()
    .trim()
    .max(500, "El mensaje no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
  consent_contact: z.boolean().refine((value) => value === true, {
    message: "Necesitamos tu autorización para poder contactarte",
  }),
  // Honeypot: debe llegar vacío. Los bots suelen completar todos los campos.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const createLeadInputSchema = leadFormSchema.omit({ website: true });

export type CreateLeadInput = z.infer<typeof createLeadInputSchema>;
