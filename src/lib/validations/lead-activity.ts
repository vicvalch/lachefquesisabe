import { z } from "zod";
import type { ContactChannel, LeadActivityType } from "@/types/database";

export const CONTACT_CHANNEL_OPTIONS: { value: ContactChannel; label: string }[] =
  [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "llamada", label: "Llamada" },
    { value: "email", label: "Email" },
    { value: "otro", label: "Otro" },
  ];

export const CONTACT_CHANNEL_LABELS: Record<ContactChannel, string> =
  Object.fromEntries(
    CONTACT_CHANNEL_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<ContactChannel, string>;

export const LEAD_ACTIVITY_TYPE_LABELS: Record<LeadActivityType, string> = {
  note: "Nota",
  contact: "Contacto registrado",
};

const contactChannelValues = CONTACT_CHANNEL_OPTIONS.map(
  (option) => option.value,
) as [ContactChannel, ...ContactChannel[]];

export const addLeadActivitySchema = z
  .object({
    type: z.enum(["note", "contact"], {
      message: "Selecciona el tipo de registro",
    }),
    channel: z.enum(contactChannelValues).optional(),
    content: z
      .string()
      .trim()
      .min(1, "Escribe algo antes de guardar")
      .max(1000, "El texto no puede superar los 1000 caracteres"),
  })
  .refine((data) => data.type !== "contact" || !!data.channel, {
    message: "Selecciona el canal de contacto",
    path: ["channel"],
  });

export type AddLeadActivityInput = z.infer<typeof addLeadActivitySchema>;
