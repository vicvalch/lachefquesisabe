import { describe, expect, it } from "vitest";
import { groupFollowUpTasks } from "./follow-up-tasks";
import type { FollowUpTaskRow } from "@/types/database";

const NOW = new Date("2026-07-10T15:00:00.000Z");

function buildTask(overrides: Partial<FollowUpTaskRow> = {}): FollowUpTaskRow {
  return {
    id: overrides.id ?? "task-1",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    lead_id: "lead-1",
    demo_event_id: null,
    contact_log_id: null,
    created_by: null,
    title: "Dar seguimiento",
    message_template_key: "seguimiento",
    status: "open",
    due_at: NOW.toISOString(),
    source: "manual",
    completed_at: null,
    notes: null,
    ...overrides,
  };
}

describe("groupFollowUpTasks", () => {
  it("clasifica como vencida una fecha de ayer", () => {
    const task = buildTask({
      id: "overdue",
      due_at: "2026-07-09T20:00:00.000Z",
    });

    const groups = groupFollowUpTasks([task], NOW);

    expect(groups.overdue).toEqual([task]);
    expect(groups.today).toEqual([]);
    expect(groups.upcoming).toEqual([]);
  });

  it("clasifica como de hoy una fecha dentro del mismo día, sin importar la hora", () => {
    const earlierToday = buildTask({
      id: "today-early",
      due_at: "2026-07-10T06:00:00.000Z",
    });
    const laterToday = buildTask({
      id: "today-late",
      due_at: "2026-07-10T23:00:00.000Z",
    });

    const groups = groupFollowUpTasks([earlierToday, laterToday], NOW);

    expect(groups.today).toEqual([earlierToday, laterToday]);
    expect(groups.overdue).toEqual([]);
    expect(groups.upcoming).toEqual([]);
  });

  it("clasifica como próxima una fecha futura fuera de hoy", () => {
    const task = buildTask({
      id: "upcoming",
      due_at: "2026-07-15T10:00:00.000Z",
    });

    const groups = groupFollowUpTasks([task], NOW);

    expect(groups.upcoming).toEqual([task]);
    expect(groups.overdue).toEqual([]);
    expect(groups.today).toEqual([]);
  });

  it("preserva el orden de entrada dentro de cada grupo", () => {
    const overdueOld = buildTask({
      id: "overdue-old",
      due_at: "2026-07-01T10:00:00.000Z",
    });
    const overdueRecent = buildTask({
      id: "overdue-recent",
      due_at: "2026-07-09T10:00:00.000Z",
    });

    const groups = groupFollowUpTasks([overdueOld, overdueRecent], NOW);

    expect(groups.overdue).toEqual([overdueOld, overdueRecent]);
  });

  it("devuelve grupos vacíos cuando no hay tareas", () => {
    expect(groupFollowUpTasks([], NOW)).toEqual({
      overdue: [],
      today: [],
      upcoming: [],
    });
  });
});
