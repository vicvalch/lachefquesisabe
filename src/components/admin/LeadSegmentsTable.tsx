import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { summarizeLeadSegmentCriteria } from "@/lib/segments/summarize";
import type { LeadSegmentRow } from "@/types/database";

export function LeadSegmentsTable({
  segments,
  countsBySegmentId,
}: {
  segments: LeadSegmentRow[];
  countsBySegmentId: Record<string, number>;
}) {
  if (segments.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-8 text-center text-ink-soft">
        Todavía no hay segmentos. Crea uno para agrupar leads con filtros
        simples y preparar una campaña de seguimiento.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Filtros</th>
            <th className="px-4 py-3">Leads</th>
            <th className="px-4 py-3">Creado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {segments.map((segment) => (
            <tr key={segment.id} className="hover:bg-cream-dark/30">
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  href={`/admin/segmentos/${segment.id}`}
                  className="hover:text-brand-700 hover:underline"
                >
                  {segment.name}
                </Link>
                {segment.description && (
                  <p className="mt-0.5 text-xs font-normal text-ink-soft">
                    {segment.description}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {summarizeLeadSegmentCriteria(segment.criteria)}
              </td>
              <td className="px-4 py-3 font-semibold text-ink">
                {countsBySegmentId[segment.id] ?? 0}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDateTime(segment.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
