import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { LEAD_STATUS_LABELS } from "@/lib/validations/lead";
import { formatDateTime } from "@/lib/utils";
import type { LeadRow } from "@/types/database";

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-8 text-center text-ink-soft">
        Todavía no hay leads. Cuando alguien complete el formulario de la
        landing, aparecerá aquí.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Contacto</th>
            <th className="px-4 py-3">Interés</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Recibido</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-cream-dark/30">
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="hover:text-brand-700 hover:underline"
                >
                  {lead.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-soft">
                <div>{lead.email}</div>
                {lead.phone && <div>{lead.phone}</div>}
              </td>
              <td className="px-4 py-3 text-ink-soft">{lead.interest}</td>
              <td className="px-4 py-3">
                <StatusBadge
                  status={lead.status}
                  label={LEAD_STATUS_LABELS[lead.status]}
                />
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDateTime(lead.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
