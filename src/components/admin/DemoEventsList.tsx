import Link from "next/link";
import { DemoEventStatusBadge } from "@/components/ui/Badge";
import { DEMO_EVENT_STATUS_LABELS, DEMO_TYPE_LABELS } from "@/lib/validations/demo-event";
import { formatDateTime } from "@/lib/utils";
import type { DemoEventRow } from "@/types/database";
import type { DemoRegistrationCounts } from "@/lib/demos/queries";

export function DemoEventsList({
  demos,
  counts,
  emptyMessage,
}: {
  demos: DemoEventRow[];
  counts: Record<string, DemoRegistrationCounts>;
  emptyMessage: string;
}) {
  if (demos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-8 text-center text-ink-soft">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Demo</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Cupo</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {demos.map((demo) => {
            const demoCounts = counts[demo.id] ?? { active: 0, attended: 0, noShow: 0 };
            return (
              <tr key={demo.id} className="hover:bg-cream-dark/30">
                <td className="px-4 py-3 font-medium text-ink">
                  <Link
                    href={`/admin/demos/${demo.id}`}
                    className="hover:text-brand-700 hover:underline"
                  >
                    {demo.title}
                  </Link>
                  {demo.location && (
                    <div className="text-xs text-ink-soft">{demo.location}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {DEMO_TYPE_LABELS[demo.demo_type]}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {formatDateTime(demo.scheduled_at)}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {demoCounts.active} / {demo.capacity}
                </td>
                <td className="px-4 py-3">
                  <DemoEventStatusBadge
                    status={demo.status}
                    label={DEMO_EVENT_STATUS_LABELS[demo.status]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
