import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelFollowUpTask,
  completeFollowUpTask,
  createFollowUpTask,
  ensureFollowUpTaskForStatus,
  rescheduleFollowUpTask,
  skipFollowUpTask,
} from "./follow-up-task-lifecycle";

function buildUpdateChain(result: { error: { message: string } | null }) {
  const eq2 = vi.fn().mockResolvedValue(result);
  const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
  const update = vi.fn().mockReturnValue({ eq: eq1 });
  return { update, eq1, eq2 };
}

describe("ensureFollowUpTaskForStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cancela las tareas pendientes cuando el estado es final (purchased)", async () => {
    const { update, eq1, eq2 } = buildUpdateChain({ error: null });
    const from = vi.fn().mockReturnValue({ update });

    const result = await ensureFollowUpTaskForStatus(
      { from } as never,
      "lead-1",
      "purchased",
    );

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("follow_up_tasks");
    expect(update).toHaveBeenCalledWith({
      status: "cancelled",
      completed_at: "2026-07-10T12:00:00.000Z",
    });
    expect(eq1).toHaveBeenCalledWith("lead_id", "lead-1");
    expect(eq2).toHaveBeenCalledWith("status", "pending");
  });

  it("cancela las tareas pendientes cuando el estado es final (lost)", async () => {
    const { update } = buildUpdateChain({ error: null });
    const from = vi.fn().mockReturnValue({ update });

    const result = await ensureFollowUpTaskForStatus(
      { from } as never,
      "lead-1",
      "lost",
    );

    expect(result).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" }),
    );
  });

  it("no crea una tarea nueva si ya hay una pendiente", async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [{ id: "existing-task" }],
      error: null,
    });
    const eq2 = vi.fn().mockReturnValue({ limit });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    const insert = vi.fn();
    const from = vi.fn().mockReturnValue({ select, insert });

    const result = await ensureFollowUpTaskForStatus(
      { from } as never,
      "lead-1",
      "contacted",
    );

    expect(result).toEqual({ ok: true });
    expect(insert).not.toHaveBeenCalled();
  });

  it("crea una tarea con la sugerencia del estado cuando no hay ninguna pendiente", async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const eq2 = vi.fn().mockReturnValue({ limit });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ select, insert });

    const result = await ensureFollowUpTaskForStatus(
      { from } as never,
      "lead-1",
      "invited_to_demo",
      "demo-1",
    );

    expect(result).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({
      lead_id: "lead-1",
      demo_event_id: "demo-1",
      title: "Confirmar demo",
      message_template_key: "invitacion_demo",
      due_at: "2026-07-10T12:00:00.000Z",
      source: "status_change",
    });
  });

  it("devuelve el error si falla la cancelación", async () => {
    const { update } = buildUpdateChain({ error: { message: "db down" } });
    const from = vi.fn().mockReturnValue({ update });

    const result = await ensureFollowUpTaskForStatus(
      { from } as never,
      "lead-1",
      "purchased",
    );

    expect(result).toEqual({ ok: false, error: "db down" });
  });

  it("devuelve el error si falla la inserción", async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const eq2 = vi.fn().mockReturnValue({ limit });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    const insert = vi.fn().mockResolvedValue({ error: { message: "insert failed" } });
    const from = vi.fn().mockReturnValue({ select, insert });

    const result = await ensureFollowUpTaskForStatus(
      { from } as never,
      "lead-1",
      "new",
    );

    expect(result).toEqual({ ok: false, error: "insert failed" });
  });
});

describe("completeFollowUpTask", () => {
  it("marca la tarea completada y la enlaza con el contact log", async () => {
    const { update, eq1, eq2 } = buildUpdateChain({ error: null });
    const from = vi.fn().mockReturnValue({ update });

    const result = await completeFollowUpTask({ from } as never, "task-1", {
      contactLogId: "log-1",
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("follow_up_tasks");
    const payload = update.mock.calls[0][0];
    expect(payload.status).toBe("completed");
    expect(payload.contact_log_id).toBe("log-1");
    expect(eq1).toHaveBeenCalledWith("id", "task-1");
    expect(eq2).toHaveBeenCalledWith("status", "pending");
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { update } = buildUpdateChain({ error: { message: "db down" } });
    const from = vi.fn().mockReturnValue({ update });

    const result = await completeFollowUpTask({ from } as never, "task-1", {
      contactLogId: "log-1",
    });

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});

describe("skipFollowUpTask", () => {
  it("marca la tarea como saltada con notas opcionales", async () => {
    const { update, eq1, eq2 } = buildUpdateChain({ error: null });
    const from = vi.fn().mockReturnValue({ update });

    const result = await skipFollowUpTask(
      { from } as never,
      "task-1",
      "No contestó",
    );

    expect(result).toEqual({ ok: true });
    const payload = update.mock.calls[0][0];
    expect(payload.status).toBe("skipped");
    expect(payload.notes).toBe("No contestó");
    expect(eq1).toHaveBeenCalledWith("id", "task-1");
    expect(eq2).toHaveBeenCalledWith("status", "pending");
  });
});

describe("cancelFollowUpTask", () => {
  it("marca la tarea como cancelada", async () => {
    const { update } = buildUpdateChain({ error: null });
    const from = vi.fn().mockReturnValue({ update });

    const result = await cancelFollowUpTask({ from } as never, "task-1");

    expect(result).toEqual({ ok: true });
    const payload = update.mock.calls[0][0];
    expect(payload.status).toBe("cancelled");
  });
});

describe("rescheduleFollowUpTask", () => {
  it("actualiza due_at sin tocar el estado", async () => {
    const { update, eq1, eq2 } = buildUpdateChain({ error: null });
    const from = vi.fn().mockReturnValue({ update });

    const result = await rescheduleFollowUpTask(
      { from } as never,
      "task-1",
      "2026-08-01T10:00:00.000Z",
    );

    expect(result).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({ due_at: "2026-08-01T10:00:00.000Z" });
    expect(eq1).toHaveBeenCalledWith("id", "task-1");
    expect(eq2).toHaveBeenCalledWith("status", "pending");
  });
});

describe("createFollowUpTask", () => {
  it("crea una tarea manual", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });

    const result = await createFollowUpTask({ from } as never, {
      leadId: "lead-1",
      title: "Llamar de nuevo",
      dueAt: "2026-08-01T10:00:00.000Z",
      messageTemplateKey: "seguimiento",
      demoEventId: null,
      createdBy: "user-1",
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("follow_up_tasks");
    expect(insert).toHaveBeenCalledWith({
      lead_id: "lead-1",
      demo_event_id: null,
      title: "Llamar de nuevo",
      message_template_key: "seguimiento",
      due_at: "2026-08-01T10:00:00.000Z",
      source: "manual",
      created_by: "user-1",
    });
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: "db down" } });
    const from = vi.fn().mockReturnValue({ insert });

    const result = await createFollowUpTask({ from } as never, {
      leadId: "lead-1",
      title: "Llamar de nuevo",
      dueAt: "2026-08-01T10:00:00.000Z",
      messageTemplateKey: null,
      demoEventId: null,
      createdBy: null,
    });

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
