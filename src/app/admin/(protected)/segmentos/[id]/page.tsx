import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLeadSegmentById, listLeadsMatchingCriteria } from "@/lib/segments/queries";
import { listOutreachCampaignsForSegment } from "@/lib/campaigns/queries";
import { listAllDemoEvents } from "@/lib/demos/queries";
import { listContentPostsAdmin } from "@/lib/content/queries";
import { EditLeadSegmentForm } from "@/components/admin/EditLeadSegmentForm";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { OutreachCampaignsTable } from "@/components/admin/OutreachCampaignsTable";
import { EntityNotFoundCard } from "@/components/admin/EntityNotFoundCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Detalle de segmento | Admin | La Chef que Sí Sabe",
};

export default async function LeadSegmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const segment = await getLeadSegmentById(supabase, id);

  if (!segment) {
    return (
      <EntityNotFoundCard
        title="No encontramos este segmento"
        description="Puede haber sido eliminado o el enlace no es correcto."
        backHref="/admin/segmentos"
        backLabel="Volver a segmentos"
      />
    );
  }

  const [matchingLeads, campaigns, demoEvents, contentPosts] = await Promise.all([
    listLeadsMatchingCriteria(supabase, segment.criteria),
    listOutreachCampaignsForSegment(supabase, segment.id),
    listAllDemoEvents(supabase),
    listContentPostsAdmin(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/segmentos"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a segmentos
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-ink">
                  {segment.name}
                </h1>
                {segment.description && (
                  <p className="mt-1 text-sm text-ink-soft">{segment.description}</p>
                )}
              </div>
              <Link href={`/admin/campanas/new?segment_id=${segment.id}`}>
                <Button type="button">+ Nueva campaña</Button>
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Leads en este segmento ({matchingLeads.length})
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Se calcula en vivo según el criterio de este segmento (preview
              acotado a 50 leads). Las campañas manuales solo generan tareas
              para leads con consentimiento de contacto.
            </p>
            <div className="mt-4">
              <LeadsTable leads={matchingLeads} />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Campañas de este segmento
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Cada campaña manual elige una plantilla, materializa
              destinatarios y genera tareas de seguimiento por lead.
            </p>
            <div className="mt-4">
              <OutreachCampaignsTable campaigns={campaigns} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <EditLeadSegmentForm
              segment={segment}
              demoEvents={demoEvents}
              contentPosts={contentPosts}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
