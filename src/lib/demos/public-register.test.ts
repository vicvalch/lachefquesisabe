import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerPublicLeadForDemo } from "./public-register";
import type { PublicDemoRegistrationInput } from "@/lib/validations/public-demo-registration";

function buildSupabaseMock(options: {
  demoResult: {
    data: { id: string; status: string; starts_at: string } | null;
    error: { message: string } | null;
  };
  leadResult?: { error: { message: string } | null };
  registrationResult?: { error: { message: string } | null };
}) {
  const leadResult = options.leadResult ?? { error: null };
  const registrationResult = options.registrationResult ?? { error: null };

  const demoMaybeSingle = vi.fn().mockResolvedValue(options.demoResult);
  const demoEq = vi.fn().mockReturnValue({ maybeSingle: demoMaybeSingle });
  const demoSelect = vi.fn().mockReturnValue({ eq: demoEq });

  // Sin .select() encadenado: el registro público no puede pedirle a
  // PostgREST la fila de vuelta (RETURNING), porque "anon" no tiene policy
  // de SELECT sobre `leads` y esa combinación falla por RLS en Postgres real.
  const leadInsert = vi.fn().mockResolvedValue(leadResult);

  const registrationInsert = vi.fn().mockResolvedValue(registrationResult);

  const from = vi.fn((table: string) => {
    if (table === "demo_events") return { select: demoSelect };
    if (table === "leads") return { insert: leadInsert };
    if (table === "demo_registrations") return { insert: registrationInsert };
    throw new Error(`Tabla inesperada: ${table}`);
  });

  return {
    client: { from } as never,
    from,
    demoEq,
    leadInsert,
    registrationInsert,
  };
}

const validInput: PublicDemoRegistrationInput = {
  name: "Ana Pérez",
  phone: "8888-8888",
  email: "",
  primary_interest: "in_person_demo",
  message: "",
  consent_contact: true,
};

describe("registerPublicLeadForDemo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("crea el lead con status confirmed_demo y la inscripción confirmed", async () => {
    const { client, from, demoEq, leadInsert, registrationInsert } =
      buildSupabaseMock({
        demoResult: {
          data: {
            id: "demo-1",
            status: "scheduled",
            starts_at: "2026-08-01T18:00:00.000Z",
          },
          error: null,
        },
      });

    const result = await registerPublicLeadForDemo(client, "demo-slug", validInput);

    expect(result).toEqual({ ok: true });
    expect(demoEq).toHaveBeenCalledWith("slug", "demo-slug");
    expect(from).toHaveBeenCalledWith("leads");
    expect(leadInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ana Pérez",
        phone: "8888-8888",
        email: null,
        primary_interest: "in_person_demo",
        consent_contact: true,
        source: "demo",
        status: "confirmed_demo",
      }),
    );
    const leadPayload = leadInsert.mock.calls[0][0];
    expect(typeof leadPayload.id).toBe("string");
    expect(leadPayload.id).toHaveLength(36);

    expect(from).toHaveBeenCalledWith("demo_registrations");
    expect(registrationInsert).toHaveBeenCalledWith({
      demo_event_id: "demo-1",
      lead_id: leadPayload.id,
      attendance_status: "confirmed",
    });
  });

  it("acepta un demo con status 'full'", async () => {
    const { client } = buildSupabaseMock({
      demoResult: {
        data: {
          id: "demo-1",
          status: "full",
          starts_at: "2026-08-01T18:00:00.000Z",
        },
        error: null,
      },
    });

    const result = await registerPublicLeadForDemo(client, "demo-slug", validInput);

    expect(result).toEqual({ ok: true });
  });

  it("no permite que el payload setee un status arbitrario para el lead", async () => {
    const { leadInsert, client } = buildSupabaseMock({
      demoResult: {
        data: {
          id: "demo-1",
          status: "scheduled",
          starts_at: "2026-08-01T18:00:00.000Z",
        },
        error: null,
      },
    });

    const tampered = {
      ...validInput,
      status: "purchased",
      created_by: "attacker",
      notes: "no debería llegar",
    } as unknown as PublicDemoRegistrationInput;

    await registerPublicLeadForDemo(client, "demo-slug", tampered);

    const payload = leadInsert.mock.calls[0][0];
    expect(payload.status).toBe("confirmed_demo");
    expect(payload).not.toHaveProperty("created_by");
    expect(payload).not.toHaveProperty("notes");
  });

  it("rechaza una demo cancelada", async () => {
    const { client, leadInsert } = buildSupabaseMock({
      demoResult: {
        data: {
          id: "demo-1",
          status: "cancelled",
          starts_at: "2026-08-01T18:00:00.000Z",
        },
        error: null,
      },
    });

    const result = await registerPublicLeadForDemo(client, "demo-slug", validInput);

    expect(result).toEqual({
      ok: false,
      error: "Esta demostración ya no está disponible para registro.",
    });
    expect(leadInsert).not.toHaveBeenCalled();
  });

  it("rechaza una demo ya realizada", async () => {
    const { client, leadInsert } = buildSupabaseMock({
      demoResult: {
        data: {
          id: "demo-1",
          status: "completed",
          starts_at: "2026-06-01T18:00:00.000Z",
        },
        error: null,
      },
    });

    const result = await registerPublicLeadForDemo(client, "demo-slug", validInput);

    expect(result.ok).toBe(false);
    expect(leadInsert).not.toHaveBeenCalled();
  });

  it("rechaza una demo cuya fecha ya pasó", async () => {
    const { client, leadInsert } = buildSupabaseMock({
      demoResult: {
        data: {
          id: "demo-1",
          status: "scheduled",
          starts_at: "2026-01-01T18:00:00.000Z",
        },
        error: null,
      },
    });

    const result = await registerPublicLeadForDemo(client, "demo-slug", validInput);

    expect(result).toEqual({ ok: false, error: "Esta demostración ya pasó." });
    expect(leadInsert).not.toHaveBeenCalled();
  });

  it("devuelve un error si la demo no existe", async () => {
    const { client } = buildSupabaseMock({
      demoResult: { data: null, error: null },
    });

    const result = await registerPublicLeadForDemo(client, "demo-slug", validInput);

    expect(result).toEqual({
      ok: false,
      error: "No encontramos esa demostración.",
    });
  });
});
