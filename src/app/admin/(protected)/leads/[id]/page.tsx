import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeadById, listContactLogs } from "@/lib/leads/queries";
import { listFollowUpTasksForLead } from "@/lib/leads/follow-up-tasks-queries";
import { listMessageTemplates } from "@/lib/message-templates/queries";
import { getFollowUpSuggestion } from "@/lib/leads/follow-up-suggestions";
import { listCampaignsForLead } from "@/lib/campaigns/queries";
import { LeadInfoCard } from "@/components/admin/LeadInfoCard";
import { LeadUpdateForm } from "@/components/admin/LeadUpdateForm";
import { ContactLogForm } from "@/components/admin/ContactLogForm";
import { ContactLogTimeline } from "@/components/admin/ContactLogTimeline";
import { MessageTemplatePicker } from "@/components/admin/MessageTemplatePicker";
import { LeadFollowUpTasks } from "@/components/admin/LeadFollowUpTasks";
import { ScheduleFollowUpForm } from "@/components/admin/ScheduleFollowUpForm";
import { LeadCampaignMemberships } from "@/components/admin/LeadCampaignMemberships";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Detalle de lead | Admin | La Chef que Sí Sabe",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const lead = await getLeadById(supabase, id);

  if (!lead) {
    notFound();
  }

  const [contactLogs, tasks, templates, campaignMemberships] = await Promise.all([
    listContactLogs(supabase, lead.id),
    listFollowUpTasksForLead(supabase, lead.id),
    listMessageTemplates(supabase),
    listCampaignsForLead(supabase, lead.id),
  ]);

  const openTasks = tasks.filter((task) => task.status === "open");
  const activeTaskId = openTasks.length === 1 ? openTasks[0].id : undefined;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/leads"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a leads
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <LeadInfoCard lead={lead} />

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Plantillas de mensaje
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Elige una plantilla, personalízala si hace falta y cópiala o
              ábrela directo en WhatsApp.
            </p>
            <div className="mt-4">
              <MessageTemplatePicker
                templates={templates}
                lead={lead}
                defaultTemplateKey={getFollowUpSuggestion(lead.status).templateKey}
              />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Tareas de seguimiento
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Se crean automáticamente según el estado del lead; también
              puedes programar una manualmente abajo.
            </p>
            <div className="mt-4">
              <LeadFollowUpTasks lead={lead} tasks={tasks} templates={templates} />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Campañas
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Últimas 5 campañas manuales donde este lead fue destinatario.
            </p>
            <div className="mt-4">
              <LeadCampaignMemberships memberships={campaignMemberships} />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Programar seguimiento
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Crea una tarea manual cuando el seguimiento automático no
              alcanza (por ejemplo, algo puntual que quedó pendiente).
            </p>
            <div className="mt-4">
              <ScheduleFollowUpForm leadId={lead.id} templates={templates} />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Registrar contacto
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Cada contacto queda registrado y actualiza automáticamente el
              último contacto del lead.
            </p>
            <div className="mt-4">
              <ContactLogForm leadId={lead.id} taskId={activeTaskId} />
            </div>
            <div className="mt-6">
              <ContactLogTimeline logs={contactLogs} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <LeadUpdateForm lead={lead} />
          </Card>
        </div>
      </div>
    </div>
  );
}
