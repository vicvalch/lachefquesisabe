import { z } from "zod";
import type { LeadInterest, LeadStatus } from "@/types/database";

export const LEAD_INTEREST_OPTIONS: { value: LeadInterest; label: string }[] = [
  { value: "recetas", label: "Recetas" },
  { value: "demo_cocina", label: "Demo de cocina" },
  { value: "demo_thermomix", label: "Demo de Thermomix" },
  { value: "otro", label: "Otro" },
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  convertido: "Convertido",
  descartado: "Descartado",
};

const leadInterestValues = LEAD_INTEREST_OPTIONS.map((o) => o.value) as [
  LeadInterest,
  ...LeadInterest[],
];

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
  interest: z.enum(leadInterestValues, {
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
