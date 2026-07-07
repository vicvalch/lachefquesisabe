import { describe, expect, it, vi } from "vitest";
import { updateLead } from "./update-lead";
import type { UpdateLeadInput } from "./update-lead";

function buildSupabaseMock(options: {
  updateResult?: { error: { message: string } | null };
  pendingResult?: { data: { id: string }[] | null; error: { message: string } | null };
  taskInsertResult?: { error: { message: string } | null };
}) {
  const updateResult = options.updateResult ?? { error: null };
  const pendingResult = options.pendingResult ?? { data: [], error: null };
  const taskInsertResult = options.taskInsertResult ?? { error: null };

  const leadEq = vi.fn().mockResolvedValue(updateResult);
  const leadUpdate = vi.fn().mockReturnValue({ eq: leadEq });

  const limit = vi.fn().mockResolvedValue(pendingResult);
  const taskEq2 = vi.fn().mockReturnValue({ limit });
  const taskEq1 = vi.fn().mockReturnValue({ eq: taskEq2 });
  const taskSelect = vi.fn().mockReturnValue({ eq: taskEq1 });
  const taskInsert = vi.fn().mockResolvedValue(taskInsertResult);
  const taskCancelEq2 = vi.fn().mockResolvedValue(taskInsertResult);
  const taskCancelEq1 = vi.fn().mockReturnValue({ eq: taskCancelEq2 });
  const taskUpdate = vi.fn().mockReturnValue({ eq: taskCancelEq1 });

  const from = vi.fn((table: string) => {
    if (table === "leads") return { update: leadUpdate };
    if (table === "follow_up_tasks") {
      return { select: taskSelect, insert: taskInsert, update: taskUpdate };
    }
    throw new Error(`Tabla inesperada: ${table}`);
  });

  return {
    client: { from } as never,
    from,
    leadUpdate,
    leadEq,
    taskSelect,
    taskInsert,
    taskUpdate,
  };
}

const baseInput: UpdateLeadInput = {
  status: "contacted",
  notes: "Quiere agendar demo el sábado",
};

describe("updateLead", () => {
  it("actualiza únicamente estado y notas", async () => {
    const { client, from, leadUpdate, leadEq } = buildSupabaseMock({});

    const result = await updateLead(client, "lead-1", baseInput);

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("leads");
    expect(leadUpdate).toHaveBeenCalledWith({
      status: "contacted",
      notes: "Quiere agendar demo el sábado",
    });
    expect(leadEq).toHaveBeenCalledWith("id", "lead-1");
  });

  it("ignora campos fuera del allowlist aunque vengan colados en el input", async () => {
    const { client, leadUpdate } = buildSupabaseMock({});
    const tampered = {
      ...baseInput,
      email: "hacker@example.com",
      phone: "000",
      source: "otro",
      consent_contact: false,
    } as unknown as UpdateLeadInput;

    await updateLead(client, "lead-1", tampered);

    const payload = leadUpdate.mock.calls[0]?.[0] ?? {};
    expect(Object.keys(payload).sort()).toEqual(["notes", "status"].sort());
  });

  it("crea una tarea de seguimiento acorde al nuevo estado si no hay ninguna pendiente", async () => {
    const { client, taskInsert } = buildSupabaseMock({});

    await updateLead(client, "lead-1", baseInput);

    expect(taskInsert).toHaveBeenCalledWith(
      expect.objectContaining({ lead_id: "lead-1", source: "status_change" }),
    );
  });

  it("cancela las tareas pendientes cuando el estado pasa a purchased", async () => {
    const { client, taskUpdate } = buildSupabaseMock({});

    await updateLead(client, "lead-1", { status: "purchased", notes: null });

    expect(taskUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" }),
    );
  });

  it("devuelve el error cuando Supabase falla al actualizar el lead", async () => {
    const { client } = buildSupabaseMock({
      updateResult: { error: { message: "db down" } },
    });

    const result = await updateLead(client, "lead-1", baseInput);

    expect(result).toEqual({
      ok: false,
      error: "No pudimos guardar los cambios. Intenta de nuevo.",
    });
  });
});
