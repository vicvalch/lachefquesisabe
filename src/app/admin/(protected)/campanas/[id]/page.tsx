import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOutreachCampaignById,
  listCampaignRecipients,
} from "@/lib/campaigns/queries";
import { getLeadSegmentById, listLeadsMatchingSegment } from "@/lib/segments/queries";
import { getMessageTemplateByKey } from "@/lib/message-templates/queries";
import { CampaignStatusBadge } from "@/components/ui/Badge";
import { CampaignRecipientsTable } from "@/components/admin/CampaignRecipientsTable";
import { GenerateCampaignTasksForm } from "@/components/admin/GenerateCampaignTasksForm";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Detalle de campaña | Admin | La Chef que Sí Sabe",
};

export default async function OutreachCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const campaign = await getOutreachCampaignById(supabase, id);

  if (!campaign) {
    notFound();
  }

  const [segment, recipients, template] = await Promise.all([
    getLeadSegmentById(supabase, campaign.segment_id),
    listCampaignRecipients(supabase, campaign.id),
    campaign.message_template_key
      ? getMessageTemplateByKey(supabase, campaign.message_template_key)
      : Promise.resolve(null),
  ]);

  const matchingLeads = segment
    ? await listLeadsMatchingSegment(supabase, segment)
    : [];

  const recipientLeadIds = new Set(recipients.map((recipient) => recipient.lead_id));
  const newLeadsCount = matchingLeads.filter(
    (lead) => !recipientLeadIds.has(lead.id),
  ).length;
  const sent = recipients.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/campanas"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a campañas
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-ink">
                  {campaign.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                  <CampaignStatusBadge
                    status={sent ? "sent" : "draft"}
                    label={sent ? "Enviada" : "Borrador"}
                  />
                  {segment && (
                    <span>
                      Segmento:{" "}
                      <Link
                        href={`/admin/segmentos/${segment.id}`}
                        className="font-semibold text-brand-700 hover:underline"
                      >
                        {segment.name}
                      </Link>
                    </span>
                  )}
                  <span>
                    Plantilla:{" "}
                    <span className="font-semibold text-ink">
                      {template?.label ?? "Sin plantilla"}
                    </span>
                  </span>
                </div>
                {campaign.notes && (
                  <p className="mt-2 text-sm text-ink-soft">{campaign.notes}</p>
                )}
              </div>
            </div>
          </Card>

          {!segment && (
            <Card>
              <p className="text-sm text-ink-soft">
                El segmento de esta campaña ya no existe, así que no se puede
                calcular a quién llega. El historial de tareas ya generadas
                sigue disponible abajo.
              </p>
            </Card>
          )}

          {segment && (
            <Card>
              <h2 className="font-display text-lg font-semibold text-ink">
                Vista previa de destinatarios ({matchingLeads.length})
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Leads que hoy matchean el segmento{" "}
                <strong className="text-ink">{segment.name}</strong>. Solo
                incluye leads que autorizaron ser contactados.
              </p>
              <div className="mt-4">
                <LeadsTable leads={matchingLeads} />
              </div>
            </Card>
          )}

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Tareas generadas ({recipients.length})
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Historial de a quién ya se le generó una tarea desde esta
              campaña.
            </p>
            <div className="mt-4">
              <CampaignRecipientsTable recipients={recipients} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Generar tareas de seguimiento
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Crea una tarea de seguimiento por cada lead nuevo del segmento
              (los que ya la tienen de esta campaña se saltan). Podrás
              trabajarlas después desde el Centro de Seguimientos.
            </p>
            <div className="mt-4">
              <GenerateCampaignTasksForm
                campaignId={campaign.id}
                newLeadsCount={segment ? newLeadsCount : 0}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
