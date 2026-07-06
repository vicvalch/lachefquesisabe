import { createClient } from "@/lib/supabase/server";
import { getLeadStats } from "@/lib/leads/queries";
import { LEAD_INTEREST_OPTIONS, LEAD_STATUS_LABELS } from "@/lib/validations/lead";
import { StatCard } from "@/components/admin/StatCard";

export const metadata = {
  title: "Dashboard | Admin | La Chef que Sí Sabe",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const stats = await getLeadStats(supabase);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Resumen de leads capturados desde la landing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Leads totales" value={stats.total} />
        <StatCard
          label="Últimos 7 días"
          value={stats.last7Days}
          hint="Nuevos leads recibidos"
        />
        <StatCard
          label="Nuevos por contactar"
          value={stats.byStatus.nuevo}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            Por estado
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <StatCard
                key={status}
                label={LEAD_STATUS_LABELS[status as keyof typeof LEAD_STATUS_LABELS]}
                value={count}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            Por interés
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {LEAD_INTEREST_OPTIONS.map((option) => (
              <StatCard
                key={option.value}
                label={option.label}
                value={stats.byInterest[option.value]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
