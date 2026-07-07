import { z } from "zod";
import { PRIMARY_INTEREST_OPTIONS } from "@/lib/validations/lead";
import type { PrimaryInterest } from "@/types/database";

const primaryInterestValues = PRIMARY_INTEREST_OPTIONS.map(
  (option) => option.value,
) as [PrimaryInterest, ...PrimaryInterest[]];

/**
 * Registro público a una demo desde /demos/[slug]. A diferencia del
 * formulario de captura general (`lib/validations/lead.ts`), aquí el
 * WhatsApp es obligatorio: es el canal principal para confirmar el lugar.
 */
export const publicDemoRegistrationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Cuéntanos tu nombre completo")
    .max(100, "El nombre es demasiado largo"),
  phone: z
    .string()
    .trim()
    .min(1, "Necesitamos tu WhatsApp para confirmarte el lugar")
    .max(20, "El teléfono es demasiado largo"),
  email: z
    .string()
    .trim()
    .max(200, "El email es demasiado largo")
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      "Ingresa un email válido",
    ),
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

export type PublicDemoRegistrationFormValues = z.infer<
  typeof publicDemoRegistrationFormSchema
>;

export const publicDemoRegistrationInputSchema =
  publicDemoRegistrationFormSchema.omit({ website: true });

export type PublicDemoRegistrationInput = z.infer<
  typeof publicDemoRegistrationInputSchema
>;
