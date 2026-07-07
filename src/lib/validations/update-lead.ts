import { z } from "zod";
import { LEAD_STATUS_VALUES } from "@/lib/validations/lead";

/**
 * Allowlist explícito de lo que el admin puede cambiar desde el detalle de
 * un lead. Nunca incluye email, phone, source, consent_contact ni
 * created_at: esos campos no se editan desde este formulario. El próximo
 * seguimiento ya no se edita acá: se gestiona con tareas de seguimiento
 * (ver ScheduleFollowUpForm y follow-up-task-lifecycle.ts).
 */
export const updateLeadSchema = z.object({
  status: z.enum(LEAD_STATUS_VALUES, { message: "Selecciona un estado válido" }),
  notes: z
    .string()
    .trim()
    .max(2000, "Las notas no pueden superar los 2000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
