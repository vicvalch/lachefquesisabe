import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getOutreachCampaignById,
  listCampaignRecipients,
} from "@/lib/campaigns/queries";
import { getLeadSegmentById, listLeadsMatchingCriteria } from "@/lib/segments/queries";
import { getMessageTemplateById } from "@/lib/message-templates/queries";
import { CampaignStatusBadge } from "@/components/ui/Badge";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/validations/outreach-campaign";
import { CampaignRecipientsTable } from "@/components/admin/CampaignRecipientsTable";
import { MaterializeRecipientsForm } from "@/components/admin/MaterializeRecipientsForm";
import { GenerateCampaignTasksForm } from "@/components/admin/GenerateCampaignTasksForm";
import { CancelCampaignForm } from "@/components/admin/CancelCampaignForm";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { EntityNotFoundCard } from "@/components/admin/EntityNotFoundCard";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Detalle de campaña | Admin | La Chef que Sí Sabe",
};

const CANCELLABLE_STATUSES = new Set(["draft", "ready", "tasks_created"]);

export default async function OutreachCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const campaign = await getOutreachCampaignById(supabase, id);

  if (!campaign) {
    return (
      <EntityNotFoundCard
        title="No encontramos esta campaña"
        description="Puede haber sido eliminada o el enlace no es correcto."
        backHref="/admin/campanas"
        backLabel="Volver a campañas"
      />
    );
  }

  const [segment, recipients, template] = await Promise.all([
    getLeadSegmentById(supabase, campaign.segment_id),
    listCampaignRecipients(supabase, campaign.id),
    campaign.message_template_id
      ? getMessageTemplateById(supabase, campaign.message_template_id)
      : Promise.resolve(null),
  ]);

  const matchingLeads = segment
    ? await listLeadsMatchingCriteria(supabase, segment.criteria)
    : [];

  const pendingCount = recipients.filter((recipient) => recipient.status === "selected").length;

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
                    status={campaign.status}
                    label={CAMPAIGN_STATUS_LABELS[campaign.status]}
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
                {campaign.description && (
                  <p className="mt-2 text-sm text-ink-soft">{campaign.description}</p>
                )}
              </div>
              {CANCELLABLE_STATUSES.has(campaign.status) && (
                <CancelCampaignForm campaignId={campaign.id} />
              )}
            </div>
          </Card>

          {!segment && (
            <Card>
              <p className="text-sm text-ink-soft">
                El segmento de esta campaña ya no existe, así que no se puede
                previsualizar a quién llega. El historial de destinatarios
                y tareas ya generadas sigue disponible abajo.
              </p>
            </Card>
          )}

          {segment && (
            <Card>
              <h2 className="font-display text-lg font-semibold text-ink">
                Vista previa del segmento ({matchingLeads.length})
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Leads que hoy matchean <strong className="text-ink">{segment.name}</strong>{" "}
                (preview acotado a 50). Esta lista puede cambiar; &ldquo;Materializar
                destinatarios&rdquo; es lo que la fija para esta campaña.
              </p>
              <div className="mt-4">
                <LeadsTable leads={matchingLeads} />
              </div>
            </Card>
          )}

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Destinatarios ({recipients.length})
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Destinatarios ya materializados para esta campaña, con el
              estado de cada uno.
            </p>
            <div className="mt-4">
              <CampaignRecipientsTable recipients={recipients} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Paso 1: Materializar destinatarios
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Fija como destinatarios a los leads que matchean el segmento
              ahora mismo (solo con consentimiento de contacto). No genera
              tareas ni envía nada todavía.
            </p>
            <div className="mt-4">
              <MaterializeRecipientsForm campaignId={campaign.id} />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Paso 2: Generar tareas de seguimiento
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Crea una tarea de seguimiento manual por cada destinatario
              pendiente. Podrás trabajarlas después desde{" "}
              <Link href="/admin/seguimientos" className="font-semibold underline">
                Ver seguimientos
              </Link>
              .
            </p>
            <div className="mt-4">
              <GenerateCampaignTasksForm
                campaignId={campaign.id}
                pendingCount={pendingCount}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
