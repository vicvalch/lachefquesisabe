import type { FollowUpTaskRow } from "@/types/database";

export interface FollowUpTaskGroups<T extends FollowUpTaskRow = FollowUpTaskRow> {
  overdue: T[];
  today: T[];
  upcoming: T[];
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
 * Agrupa tareas de seguimiento pendientes en vencidas, de hoy y próximas,
 * según su due_at. Usa el reloj local del proceso para "hoy", igual que el
 * resto del admin (no hay manejo explícito de zona horaria en la app).
 */
export function groupFollowUpTasks<T extends FollowUpTaskRow>(
  tasks: T[],
  now: Date = new Date(),
): FollowUpTaskGroups<T> {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const groups: FollowUpTaskGroups<T> = { overdue: [], today: [], upcoming: [] };

  for (const task of tasks) {
    const dueAt = new Date(task.due_at);

    if (dueAt < todayStart) {
      groups.overdue.push(task);
    } else if (dueAt <= todayEnd) {
      groups.today.push(task);
    } else {
      groups.upcoming.push(task);
    }
  }

  return groups;
}
