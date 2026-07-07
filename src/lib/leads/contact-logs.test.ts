import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addContactLog } from "./contact-logs";
import type { AddContactLogInput } from "@/lib/validations/contact-log";

function buildSupabaseMock(
  options: {
    insertResult?: { data: { id: string } | null; error: { message: string } | null };
    leadUpdateResult?: { error: { message: string } | null };
    taskUpdateResult?: { error: { message: string } | null };
    taskInsertResult?: { error: { message: string } | null };
  } = {},
) {
  const insertResult = options.insertResult ?? {
    data: { id: "log-1" },
    error: null,
  };
  const leadUpdateResult = options.leadUpdateResult ?? { error: null };
  const taskUpdateResult = options.taskUpdateResult ?? { error: null };
  const taskInsertResult = options.taskInsertResult ?? { error: null };

  const single = vi.fn().mockResolvedValue(insertResult);
  const select = vi.fn().mockReturnValue({ single });
  const contactLogInsert = vi.fn().mockReturnValue({ select });

  const leadEq = vi.fn().mockResolvedValue(leadUpdateResult);
  const leadUpdate = vi.fn().mockReturnValue({ eq: leadEq });

  const taskEq2 = vi.fn().mockResolvedValue(taskUpdateResult);
  const taskEq1 = vi.fn().mockReturnValue({ eq: taskEq2 });
  const taskUpdate = vi.fn().mockReturnValue({ eq: taskEq1 });
  const taskInsert = vi.fn().mockResolvedValue(taskInsertResult);

  const from = vi.fn((table: string) => {
    if (table === "contact_logs") return { insert: contactLogInsert };
    if (table === "leads") return { update: leadUpdate };
    if (table === "follow_up_tasks") return { update: taskUpdate, insert: taskInsert };
    throw new Error(`Tabla inesperada: ${table}`);
  });

  return {
    client: { from } as never,
    from,
    contactLogInsert,
    leadUpdate,
    leadEq,
    taskUpdate,
    taskEq1,
    taskEq2,
    taskInsert,
  };
}

const baseInput: AddContactLogInput = {
  channel: "whatsapp",
  direction: "outbound",
  summary: "Se le explicó el paquete de recetas",
};

describe("addContactLog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("inserta el contact log y actualiza last_contacted_at", async () => {
    const { client, from, contactLogInsert, leadUpdate, leadEq, taskUpdate, taskInsert } =
      buildSupabaseMock();

    const result = await addContactLog(client, "lead-1", "user-1", baseInput);

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("contact_logs");
    expect(contactLogInsert).toHaveBeenCalledWith({
      lead_id: "lead-1",
      created_by: "user-1",
      channel: "whatsapp",
      direction: "outbound",
      summary: "Se le explicó el paquete de recetas",
      outcome: null,
      next_follow_up_at: null,
    });
    expect(from).toHaveBeenCalledWith("leads");
    expect(leadUpdate).toHaveBeenCalledWith({
      last_contacted_at: "2026-07-10T12:00:00.000Z",
    });
    expect(leadEq).toHaveBeenCalledWith("id", "lead-1");
    expect(taskUpdate).not.toHaveBeenCalled();
    expect(taskInsert).not.toHaveBeenCalled();
  });

  it("completa la tarea indicada por task_id y la enlaza con el contact log", async () => {
    const { client, taskUpdate, taskEq1, taskEq2 } = buildSupabaseMock();

    const result = await addContactLog(client, "lead-1", "user-1", {
      ...baseInput,
      task_id: "task-1",
    });

    expect(result).toEqual({ ok: true });
    const payload = taskUpdate.mock.calls[0][0];
    expect(payload.status).toBe("completed");
    expect(payload.contact_log_id).toBe("log-1");
    expect(taskEq1).toHaveBeenCalledWith("id", "task-1");
    expect(taskEq2).toHaveBeenCalledWith("status", "open");
  });

  it("crea una tarea nueva cuando viene next_follow_up_at", async () => {
    const { client, taskInsert } = buildSupabaseMock();

    const result = await addContactLog(client, "lead-1", "user-1", {
      ...baseInput,
      outcome: "Confirmó que quiere la demo",
      next_follow_up_at: "2026-08-01T10:00:00.000Z",
    });

    expect(result).toEqual({ ok: true });
    expect(taskInsert).toHaveBeenCalledWith({
      lead_id: "lead-1",
      demo_event_id: null,
      title: "Dar seguimiento",
      message_template_key: "recontacto-suave",
      due_at: "2026-08-01T10:00:00.000Z",
      source: "manual",
      created_by: "user-1",
    });
  });

  it("devuelve el error si falla la inserción del contact log", async () => {
    const { client, leadUpdate } = buildSupabaseMock({
      insertResult: { data: null, error: { message: "db down" } },
    });

    const result = await addContactLog(client, "lead-1", "user-1", baseInput);

    expect(result).toEqual({ ok: false, error: "db down" });
    expect(leadUpdate).not.toHaveBeenCalled();
  });

  it("devuelve el error si falla la actualización del lead", async () => {
    const { client } = buildSupabaseMock({
      leadUpdateResult: { error: { message: "update failed" } },
    });

    const result = await addContactLog(client, "lead-1", "user-1", baseInput);

    expect(result).toEqual({ ok: false, error: "update failed" });
  });

  it("devuelve el error si falla completar la tarea", async () => {
    const { client } = buildSupabaseMock({
      taskUpdateResult: { error: { message: "task update failed" } },
    });

    const result = await addContactLog(client, "lead-1", "user-1", {
      ...baseInput,
      task_id: "task-1",
    });

    expect(result).toEqual({ ok: false, error: "task update failed" });
  });

  it("devuelve el error si falla crear la nueva tarea", async () => {
    const { client } = buildSupabaseMock({
      taskInsertResult: { error: { message: "task insert failed" } },
    });

    const result = await addContactLog(client, "lead-1", "user-1", {
      ...baseInput,
      next_follow_up_at: "2026-08-01T10:00:00.000Z",
    });

    expect(result).toEqual({ ok: false, error: "task insert failed" });
  });
});
