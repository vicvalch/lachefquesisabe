import { z } from "zod";
import type { TaskStatus } from "@/types/database";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendiente",
  completed: "Completada",
  skipped: "Saltada",
  cancelled: "Cancelada",
};

const dueAtSchema = z
  .string()
  .min(1, "Selecciona una fecha")
  .refine(
    (value) => !Number.isNaN(new Date(value).getTime()),
    "La fecha no es válida",
  );

export const createFollowUpTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Escribe un título para la tarea")
    .max(150, "El título no puede superar los 150 caracteres"),
  due_at: dueAtSchema,
  message_template_key: z.string().optional().or(z.literal("")),
});

export type CreateFollowUpTaskInput = z.infer<typeof createFollowUpTaskSchema>;

export const rescheduleFollowUpTaskSchema = z.object({
  due_at: dueAtSchema,
});

export type RescheduleFollowUpTaskInput = z.infer<
  typeof rescheduleFollowUpTaskSchema
>;

export const taskNotesSchema = z
  .string()
  .trim()
  .max(500, "La nota no puede superar los 500 caracteres")
  .optional()
  .or(z.literal(""));
