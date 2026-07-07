import type { LeadRow } from "@/types/database";

export interface FollowUpTaskGroups {
  overdue: LeadRow[];
  today: LeadRow[];
  upcoming: LeadRow[];
}

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Agrupa leads con next_follow_up_at en vencidas, de hoy y próximas. Usa el
 * reloj local del proceso para "hoy", igual que el resto del admin (no hay
 * manejo explícito de zona horaria en la app).
 */
export function groupFollowUpTasks(
  leads: LeadRow[],
  now: Date = new Date(),
): FollowUpTaskGroups {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const groups: FollowUpTaskGroups = { overdue: [], today: [], upcoming: [] };

  for (const lead of leads) {
    if (!lead.next_follow_up_at) {
      continue;
    }

    const dueAt = new Date(lead.next_follow_up_at);

    if (dueAt < todayStart) {
      groups.overdue.push(lead);
    } else if (dueAt <= todayEnd) {
      groups.today.push(lead);
    } else {
      groups.upcoming.push(lead);
    }
  }

  return groups;
}
