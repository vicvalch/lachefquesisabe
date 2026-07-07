import { z } from "zod";
import { LEAD_STATUS_VALUES } from "@/lib/validations/lead";

/**
 * Allowlist explícito de lo que el admin puede cambiar desde el detalle de
 * un lead. Nunca incluye email, phone, source, consent_contact ni
 * created_at: esos campos no se editan desde este formulario.
 */
export const updateLeadSchema = z.object({
  status: z.enum(LEAD_STATUS_VALUES, { message: "Selecciona un estado válido" }),
  notes: z
    .string()
    .trim()
    .max(2000, "Las notas no pueden superar los 2000 caracteres")
    .optional()
    .or(z.literal("")),
  next_follow_up_at: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
      "La fecha de próximo seguimiento no es válida",
    ),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
