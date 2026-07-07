import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLeadStats } from "@/lib/leads/queries";
import { listDueFollowUpTasks } from "@/lib/leads/follow-up-tasks-queries";
import {
  getRegistrationCountsByDemoIds,
  listUpcomingDemoEvents,
} from "@/lib/demos/queries";
import { getContentStats, listRecentContentPosts } from "@/lib/content/queries";
import { listRecentOutreachCampaigns } from "@/lib/campaigns/queries";
import {
  PRIMARY_INTEREST_OPTIONS,
  LEAD_STATUS_LABELS,
} from "@/lib/validations/lead";
import { StatCard } from "@/components/admin/StatCard";
import { UpcomingFollowUps } from "@/components/admin/UpcomingFollowUps";
import { UpcomingDemos } from "@/components/admin/UpcomingDemos";
import { RecentContentPosts } from "@/components/admin/RecentContentPosts";
import { OutreachCampaignsTable } from "@/components/admin/OutreachCampaignsTable";

export const metadata = {
  title: "Dashboard | Admin | La Chef que Sí Sabe",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const [
    stats,
    dueFollowUpTasks,
    upcomingDemos,
    contentStats,
    recentContent,
    recentCampaigns,
  ] = await Promise.all([
    getLeadStats(supabase),
    listDueFollowUpTasks(supabase),
    listUpcomingDemoEvents(supabase, 5),
    getContentStats(supabase),
    listRecentContentPosts(supabase, 5),
    listRecentOutreachCampaigns(supabase, 5),
  ]);
  const demoCounts = await getRegistrationCountsByDemoIds(
    supabase,
    upcomingDemos.map((demo) => demo.id),
  );

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
        <StatCard label="Nuevos por contactar" value={stats.byStatus.new} />
        <StatCard
          label="Contenido publicado"
          value={contentStats.published}
          hint={`${contentStats.draft} en borrador · ${contentStats.archived} archivado`}
        />
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-ink">
            Seguimientos pendientes
          </h2>
          <Link
            href="/admin/seguimientos"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Ver el centro de seguimientos →
          </Link>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Tareas de seguimiento vencidas o para hoy.
        </p>
        <div className="mt-4">
          <UpcomingFollowUps tasks={dueFollowUpTasks} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">
          Próximas demos
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Demostraciones programadas y su cupo disponible.
        </p>
        <div className="mt-4">
          <UpcomingDemos demos={upcomingDemos} counts={demoCounts} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">
          Contenido reciente
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Las últimas recetas, tips o guías creadas o editadas.
        </p>
        <div className="mt-4">
          <RecentContentPosts posts={recentContent} />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-ink">
            Campañas recientes
          </h2>
          <Link
            href="/admin/campanas"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Ver todas las campañas →
          </Link>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Últimas campañas manuales creadas, con su estado y destinatarios.
        </p>
        <div className="mt-4">
          <OutreachCampaignsTable campaigns={recentCampaigns} />
        </div>
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
            {PRIMARY_INTEREST_OPTIONS.map((option) => (
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
