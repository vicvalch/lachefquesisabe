import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import type { DemoEventRow } from "@/types/database";
import type { DemoRegistrationCounts } from "@/lib/demos/queries";

export function UpcomingDemos({
  demos,
  counts,
}: {
  demos: DemoEventRow[];
  counts: Record<string, DemoRegistrationCounts>;
}) {
  if (demos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        No tienes demos programadas.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Demo</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Cupo</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {demos.map((demo) => {
            const demoCounts = counts[demo.id] ?? {
              active: 0,
              attended: 0,
              noShow: 0,
            };
            return (
              <tr key={demo.id}>
                <td className="px-4 py-3 font-medium text-ink">{demo.title}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {formatDateTime(demo.scheduled_at)}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {demoCounts.active} / {demo.capacity}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/demos/${demo.id}`}
                    className="text-sm font-semibold text-brand-700 hover:underline"
                  >
                    Ver demo
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
