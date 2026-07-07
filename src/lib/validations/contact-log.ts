import { z } from "zod";
import type { ContactChannel, ContactDirection } from "@/types/database";

export const CONTACT_CHANNEL_OPTIONS: { value: ContactChannel; label: string }[] =
  [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "phone", label: "Llamada" },
    { value: "email", label: "Email" },
    { value: "instagram", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
    { value: "in_person", label: "En persona" },
    { value: "other", label: "Otro" },
  ];

export const CONTACT_CHANNEL_LABELS: Record<ContactChannel, string> =
  Object.fromEntries(
    CONTACT_CHANNEL_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<ContactChannel, string>;

export const CONTACT_DIRECTION_OPTIONS: {
  value: ContactDirection;
  label: string;
}[] = [
  { value: "outbound", label: "Saliente (lo contactamos nosotros)" },
  { value: "inbound", label: "Entrante (nos contactó)" },
];

export const CONTACT_DIRECTION_LABELS: Record<ContactDirection, string> =
  Object.fromEntries(
    CONTACT_DIRECTION_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<ContactDirection, string>;

const contactChannelValues = CONTACT_CHANNEL_OPTIONS.map(
  (option) => option.value,
) as [ContactChannel, ...ContactChannel[]];

const contactDirectionValues = CONTACT_DIRECTION_OPTIONS.map(
  (option) => option.value,
) as [ContactDirection, ...ContactDirection[]];

export const addContactLogSchema = z.object({
  channel: z.enum(contactChannelValues, {
    message: "Selecciona el canal de contacto",
  }),
  direction: z.enum(contactDirectionValues, {
    message: "Selecciona la dirección del contacto",
  }),
  summary: z
    .string()
    .trim()
    .min(1, "Escribe un resumen antes de guardar")
    .max(1000, "El resumen no puede superar los 1000 caracteres"),
  outcome: z
    .string()
    .trim()
    .max(500, "El resultado no puede superar los 500 caracteres")
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
  task_id: z.string().uuid().optional().or(z.literal("")),
});

export type AddContactLogInput = z.infer<typeof addContactLogSchema>;
