import { z } from "zod";
import type { AttendanceStatus } from "@/types/database";

export const ATTENDANCE_STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
}[] = [
  { value: "registered", label: "Registrado" },
  { value: "confirmed", label: "Confirmó asistencia" },
  { value: "attended", label: "Asistió" },
  { value: "no_show", label: "No asistió" },
  { value: "cancelled", label: "Canceló" },
];

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> =
  Object.fromEntries(
    ATTENDANCE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<AttendanceStatus, string>;

const attendanceStatusValues = ATTENDANCE_STATUS_OPTIONS.map(
  (option) => option.value,
) as [AttendanceStatus, ...AttendanceStatus[]];

export const ATTENDANCE_STATUS_VALUES = attendanceStatusValues;

export const registerLeadForDemoSchema = z.object({
  lead_id: z.string().uuid("Selecciona un lead válido"),
  notes: z
    .string()
    .trim()
    .max(1000, "Las notas no pueden superar los 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type RegisterLeadForDemoInput = z.infer<
  typeof registerLeadForDemoSchema
>;

export const updateAttendanceSchema = z.object({
  attendance_status: z.enum(attendanceStatusValues, {
    message: "Selecciona un estado de asistencia válido",
  }),
  notes: z
    .string()
    .trim()
    .max(1000, "Las notas no pueden superar los 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
