import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listLeads } from "@/lib/leads/queries";
import { listDueFollowUpTasks } from "@/lib/leads/follow-up-tasks-queries";
import { groupFollowUpTasks } from "@/lib/leads/follow-up-tasks";
import {
  getRegistrationCountsByDemoIds,
  listUpcomingDemoEvents,
} from "@/lib/demos/queries";
import { listRecentOutreachCampaigns } from "@/lib/campaigns/queries";
import { StatCard } from "@/components/admin/StatCard";
import { UpcomingFollowUps } from "@/components/admin/UpcomingFollowUps";
import { UpcomingDemos } from "@/components/admin/UpcomingDemos";
import { OutreachCampaignsTable } from "@/components/admin/OutreachCampaignsTable";
import { LeadsTable } from "@/components/admin/LeadsTable";

export const metadata = {
  title: "Dashboard | Admin | La Chef que Sí Sabe",
};

const ACTIVE_CAMPAIGN_STATUSES = new Set(["draft", "ready", "tasks_created"]);

export default async function DashboardPage() {
  const supabase = await createClient();
  const [dueFollowUpTasks, newLeads, upcomingDemos, recentCampaigns] =
    await Promise.all([
      listDueFollowUpTasks(supabase, 8),
      listLeads(supabase, { status: "new", limit: 5 }),
      listUpcomingDemoEvents(supabase, 5),
      listRecentOutreachCampaigns(supabase, 5),
    ]);
  const demoCounts = await getRegistrationCountsByDemoIds(
    supabase,
    upcomingDemos.map((demo) => demo.id),
  );

  const { overdue, today } = groupFollowUpTasks(dueFollowUpTasks);
  const activeCampaignsCount = recentCampaigns.filter((campaign) =>
    ACTIVE_CAMPAIGN_STATUSES.has(campaign.status),
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Lo que hay que atender hoy: seguimientos, leads nuevos, demos y
          campañas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Seguimientos vencidos" value={overdue.length} />
        <StatCard label="Seguimientos para hoy" value={today.length} />
        <StatCard label="Leads nuevos" value={newLeads.length} />
        <StatCard label="Campañas activas" value={activeCampaignsCount} />
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
          {dueFollowUpTasks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
              No hay tareas pendientes para hoy.
            </p>
          ) : (
            <UpcomingFollowUps tasks={dueFollowUpTasks} />
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-ink">
            Leads nuevos
          </h2>
          <Link
            href="/admin/leads?status=new"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Ver todos los leads →
          </Link>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Últimos leads recibidos que todavía no fueron contactados.
        </p>
        <div className="mt-4">
          {newLeads.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
              No hay leads recientes.
            </p>
          ) : (
            <LeadsTable leads={newLeads} />
          )}
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
          {upcomingDemos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
              No hay demos próximas.
            </p>
          ) : (
            <UpcomingDemos demos={upcomingDemos} counts={demoCounts} />
          )}
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
          {recentCampaigns.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
              No hay campañas activas.
            </p>
          ) : (
            <OutreachCampaignsTable campaigns={recentCampaigns} />
          )}
        </div>
      </div>
    </div>
  );
}
