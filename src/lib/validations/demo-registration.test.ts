import { describe, expect, it } from "vitest";
import {
  registerLeadForDemoSchema,
  updateAttendanceSchema,
} from "./demo-registration";

describe("registerLeadForDemoSchema", () => {
  it("acepta un lead_id válido sin notas", () => {
    const result = registerLeadForDemoSchema.safeParse({
      lead_id: "8f14e45f-ceea-467e-adaf-4d9a94b8b32b",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un lead_id que no es un uuid", () => {
    const result = registerLeadForDemoSchema.safeParse({ lead_id: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("updateAttendanceSchema", () => {
  it("acepta un estado de asistencia válido", () => {
    const result = updateAttendanceSchema.safeParse({
      attendance_status: "attended",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un estado de asistencia que no existe en el enum", () => {
    const result = updateAttendanceSchema.safeParse({
      attendance_status: "asistio",
    });
    expect(result.success).toBe(false);
  });
});
