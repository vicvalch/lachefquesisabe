import { describe, expect, it } from "vitest";
import { groupFollowUpTasks } from "./follow-up-tasks";
import type { LeadRow } from "@/types/database";

const NOW = new Date("2026-07-10T15:00:00.000Z");

function buildLead(overrides: Partial<LeadRow> = {}): LeadRow {
  return {
    id: overrides.id ?? "lead-1",
    created_at: new Date(0).toISOString(),
    name: "Ana Pérez",
    email: "ana@example.com",
    phone: "88888888",
    primary_interest: "easy_recipes",
    message: null,
    status: "new",
    source: "landing",
    consent_contact: true,
    notes: null,
    next_follow_up_at: null,
    last_contacted_at: null,
    ...overrides,
  };
}

describe("groupFollowUpTasks", () => {
  it("ignora leads sin next_follow_up_at", () => {
    const leads = [buildLead({ id: "no-follow-up", next_follow_up_at: null })];

    const groups = groupFollowUpTasks(leads, NOW);

    expect(groups).toEqual({ overdue: [], today: [], upcoming: [] });
  });

  it("clasifica como vencida una fecha de ayer", () => {
    const lead = buildLead({
      id: "overdue",
      next_follow_up_at: "2026-07-09T20:00:00.000Z",
    });

    const groups = groupFollowUpTasks([lead], NOW);

    expect(groups.overdue).toEqual([lead]);
    expect(groups.today).toEqual([]);
    expect(groups.upcoming).toEqual([]);
  });

  it("clasifica como de hoy una fecha dentro del mismo día, sin importar la hora", () => {
    const earlierToday = buildLead({
      id: "today-early",
      next_follow_up_at: "2026-07-10T06:00:00.000Z",
    });
    const laterToday = buildLead({
      id: "today-late",
      next_follow_up_at: "2026-07-10T23:00:00.000Z",
    });

    const groups = groupFollowUpTasks([earlierToday, laterToday], NOW);

    expect(groups.today).toEqual([earlierToday, laterToday]);
    expect(groups.overdue).toEqual([]);
    expect(groups.upcoming).toEqual([]);
  });

  it("clasifica como próxima una fecha futura fuera de hoy", () => {
    const lead = buildLead({
      id: "upcoming",
      next_follow_up_at: "2026-07-15T10:00:00.000Z",
    });

    const groups = groupFollowUpTasks([lead], NOW);

    expect(groups.upcoming).toEqual([lead]);
    expect(groups.overdue).toEqual([]);
    expect(groups.today).toEqual([]);
  });

  it("preserva el orden de entrada dentro de cada grupo", () => {
    const overdueOld = buildLead({
      id: "overdue-old",
      next_follow_up_at: "2026-07-01T10:00:00.000Z",
    });
    const overdueRecent = buildLead({
      id: "overdue-recent",
      next_follow_up_at: "2026-07-09T10:00:00.000Z",
    });

    const groups = groupFollowUpTasks([overdueOld, overdueRecent], NOW);

    expect(groups.overdue).toEqual([overdueOld, overdueRecent]);
  });
});
