import { describe, expect, it, vi } from "vitest";
import {
  registerLeadForDemo,
  removeRegistration,
  updateAttendanceStatus,
} from "./registrations";
import type { UpdateAttendanceInput } from "@/lib/validations/demo-registration";

function buildRegisterMock(options: {
  demoResult: { data: { capacity: number } | null; error: { message: string } | null };
  existingResult?: {
    data: { attendance_status: string }[] | null;
    error: { message: string } | null;
  };
  insertResult?: { error: { message: string; code?: string } | null };
}) {
  const existingResult = options.existingResult ?? { data: [], error: null };
  const insertResult = options.insertResult ?? { error: null };

  const demoMaybeSingle = vi.fn().mockResolvedValue(options.demoResult);
  const demoEq = vi.fn().mockReturnValue({ maybeSingle: demoMaybeSingle });
  const demoSelect = vi.fn().mockReturnValue({ eq: demoEq });

  const regEq = vi.fn().mockResolvedValue(existingResult);
  const regSelect = vi.fn().mockReturnValue({ eq: regEq });
  const regInsert = vi.fn().mockResolvedValue(insertResult);

  const from = vi.fn((table: string) => {
    if (table === "demo_events") return { select: demoSelect };
    if (table === "demo_registrations") {
      return { select: regSelect, insert: regInsert };
    }
    throw new Error(`Tabla inesperada: ${table}`);
  });

  return { client: { from } as never, from, regInsert };
}

describe("registerLeadForDemo", () => {
  it("inscribe al lead cuando hay cupo disponible", async () => {
    const { client, regInsert } = buildRegisterMock({
      demoResult: { data: { capacity: 8 }, error: null },
      existingResult: {
        data: [{ attendance_status: "registered" }],
        error: null,
      },
    });

    const result = await registerLeadForDemo(client, "demo-1", {
      lead_id: "lead-1",
      notes: "",
    });

    expect(result).toEqual({ ok: true });
    expect(regInsert).toHaveBeenCalledWith({
      demo_event_id: "demo-1",
      lead_id: "lead-1",
      notes: null,
    });
  });

  it("rechaza la inscripción cuando el cupo activo ya alcanzó la capacidad", async () => {
    const { client, regInsert } = buildRegisterMock({
      demoResult: { data: { capacity: 1 }, error: null },
      existingResult: {
        data: [{ attendance_status: "confirmed" }],
        error: null,
      },
    });

    const result = await registerLeadForDemo(client, "demo-1", {
      lead_id: "lead-1",
      notes: "",
    });

    expect(result).toEqual({
      ok: false,
      error: "Ya no hay cupos disponibles para esta demo.",
    });
    expect(regInsert).not.toHaveBeenCalled();
  });

  it("no cuenta las inscripciones canceladas contra el cupo", async () => {
    const { client } = buildRegisterMock({
      demoResult: { data: { capacity: 1 }, error: null },
      existingResult: {
        data: [{ attendance_status: "cancelled" }],
        error: null,
      },
    });

    const result = await registerLeadForDemo(client, "demo-1", {
      lead_id: "lead-1",
      notes: "",
    });

    expect(result).toEqual({ ok: true });
  });

  it("devuelve un error si la demo no existe", async () => {
    const { client } = buildRegisterMock({
      demoResult: { data: null, error: { message: "not found" } },
    });

    const result = await registerLeadForDemo(client, "demo-1", {
      lead_id: "lead-1",
      notes: "",
    });

    expect(result).toEqual({ ok: false, error: "No se encontró la demo." });
  });

  it("devuelve un mensaje amigable cuando el lead ya está inscrito", async () => {
    const { client } = buildRegisterMock({
      demoResult: { data: { capacity: 8 }, error: null },
      insertResult: { error: { message: "duplicate key", code: "23505" } },
    });

    const result = await registerLeadForDemo(client, "demo-1", {
      lead_id: "lead-1",
      notes: "",
    });

    expect(result).toEqual({
      ok: false,
      error: "Este lead ya está registrado en esta demo.",
    });
  });
});

function buildAttendanceMock(options: {
  registrationUpdateResult?: { error: { message: string } | null };
  leadUpdateResult?: { error: { message: string } | null };
}) {
  const registrationUpdateResult = options.registrationUpdateResult ?? {
    error: null,
  };
  const leadUpdateResult = options.leadUpdateResult ?? { error: null };

  const regEq = vi.fn().mockResolvedValue(registrationUpdateResult);
  const regUpdate = vi.fn().mockReturnValue({ eq: regEq });

  const leadEq = vi.fn().mockResolvedValue(leadUpdateResult);
  const leadUpdate = vi.fn().mockReturnValue({ eq: leadEq });

  const from = vi.fn((table: string) => {
    if (table === "demo_registrations") return { update: regUpdate };
    if (table === "leads") return { update: leadUpdate };
    throw new Error(`Tabla inesperada: ${table}`);
  });

  return { client: { from } as never, from, regUpdate, regEq, leadUpdate, leadEq };
}

const baseAttendanceInput: UpdateAttendanceInput = {
  attendance_status: "attended",
  notes: "",
};

describe("updateAttendanceStatus", () => {
  it("actualiza la inscripción y sincroniza leads.status a 'attended'", async () => {
    const { client, regUpdate, regEq, leadUpdate, leadEq } =
      buildAttendanceMock({});

    const result = await updateAttendanceStatus(
      client,
      "registration-1",
      "lead-1",
      baseAttendanceInput,
    );

    expect(result).toEqual({ ok: true });
    expect(regUpdate).toHaveBeenCalledWith({
      attendance_status: "attended",
      notes: null,
    });
    expect(regEq).toHaveBeenCalledWith("id", "registration-1");
    expect(leadUpdate).toHaveBeenCalledWith({ status: "attended" });
    expect(leadEq).toHaveBeenCalledWith("id", "lead-1");
  });

  it("sincroniza invited_to_demo, confirmed_demo y no_show según la asistencia", async () => {
    const cases: [UpdateAttendanceInput["attendance_status"], string][] = [
      ["registered", "invited_to_demo"],
      ["confirmed", "confirmed_demo"],
      ["no_show", "no_show"],
    ];

    for (const [attendance_status, expectedStatus] of cases) {
      const { client, leadUpdate } = buildAttendanceMock({});

      await updateAttendanceStatus(client, "registration-1", "lead-1", {
        attendance_status,
        notes: "",
      });

      expect(leadUpdate).toHaveBeenCalledWith({ status: expectedStatus });
    }
  });

  it("no sincroniza leads.status cuando la asistencia se cancela", async () => {
    const { client, leadUpdate } = buildAttendanceMock({});

    const result = await updateAttendanceStatus(client, "registration-1", "lead-1", {
      attendance_status: "cancelled",
      notes: "",
    });

    expect(result).toEqual({ ok: true });
    expect(leadUpdate).not.toHaveBeenCalled();
  });

  it("devuelve el error si falla la actualización de la inscripción", async () => {
    const { client, leadUpdate } = buildAttendanceMock({
      registrationUpdateResult: { error: { message: "db down" } },
    });

    const result = await updateAttendanceStatus(
      client,
      "registration-1",
      "lead-1",
      baseAttendanceInput,
    );

    expect(result).toEqual({ ok: false, error: "db down" });
    expect(leadUpdate).not.toHaveBeenCalled();
  });

  it("devuelve el error si falla la sincronización del lead", async () => {
    const { client } = buildAttendanceMock({
      leadUpdateResult: { error: { message: "lead update failed" } },
    });

    const result = await updateAttendanceStatus(
      client,
      "registration-1",
      "lead-1",
      baseAttendanceInput,
    );

    expect(result).toEqual({ ok: false, error: "lead update failed" });
  });
});

describe("removeRegistration", () => {
  it("elimina la inscripción", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ delete: del });

    const result = await removeRegistration({ from } as never, "registration-1");

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("demo_registrations");
    expect(eq).toHaveBeenCalledWith("id", "registration-1");
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: "db down" } });
    const del = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ delete: del });

    const result = await removeRegistration({ from } as never, "registration-1");

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
