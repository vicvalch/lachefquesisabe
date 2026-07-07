import Link from "next/link";
import { LEAD_STATUS_LABELS } from "@/lib/validations/lead";
import { formatDateTime } from "@/lib/utils";
import type { FollowUpTaskWithLead } from "@/lib/leads/follow-up-tasks-queries";

export function UpcomingFollowUps({ tasks }: { tasks: FollowUpTaskWithLead[] }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        No hay seguimientos pendientes.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Tarea</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Vence</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-4 py-3 font-medium text-ink">{task.lead.name}</td>
              <td className="px-4 py-3 text-ink-soft">{task.title}</td>
              <td className="px-4 py-3 text-ink-soft">
                {LEAD_STATUS_LABELS[task.lead.status]}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDateTime(task.due_at)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/leads/${task.lead.id}`}
                  className="text-sm font-semibold text-brand-700 hover:underline"
                >
                  Ver lead
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
