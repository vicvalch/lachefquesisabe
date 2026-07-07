import Link from "next/link";
import { LEAD_STATUS_LABELS } from "@/lib/validations/lead";
import { formatDateTime } from "@/lib/utils";
import type { LeadRow } from "@/types/database";

export function UpcomingFollowUps({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) {
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
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Próximo seguimiento</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="px-4 py-3 font-medium text-ink">{lead.name}</td>
              <td className="px-4 py-3 text-ink-soft">
                {LEAD_STATUS_LABELS[lead.status]}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {lead.next_follow_up_at
                  ? formatDateTime(lead.next_follow_up_at)
                  : "-"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/leads/${lead.id}`}
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
