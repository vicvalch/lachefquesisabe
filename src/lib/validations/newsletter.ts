import { z } from "zod";

export const newsletterSubscribeSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Cuéntanos tu nombre completo")
    .max(100, "El nombre es demasiado largo"),
  email: z
    .string()
    .trim()
    .min(1, "Tu email es necesario para enviarte las recetas")
    .email("Ingresa un email válido"),
  phone: z
    .string()
    .trim()
    .max(20, "El teléfono es demasiado largo")
    .optional()
    .or(z.literal("")),
  consent_contact: z.boolean().refine((value) => value === true, {
    message: "Necesitamos tu autorización para poder contactarte",
  }),
  // Honeypot: debe llegar vacío. Los bots suelen completar todos los campos.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type NewsletterSubscribeValues = z.infer<typeof newsletterSubscribeSchema>;

export const newsletterSubscribeInputSchema = newsletterSubscribeSchema.omit({
  website: true,
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeInputSchema>;
