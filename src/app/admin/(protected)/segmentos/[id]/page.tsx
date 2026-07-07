import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeadSegmentById, listLeadsMatchingSegment } from "@/lib/segments/queries";
import { listOutreachCampaignsForSegment } from "@/lib/campaigns/queries";
import { EditLeadSegmentForm } from "@/components/admin/EditLeadSegmentForm";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { OutreachCampaignsTable } from "@/components/admin/OutreachCampaignsTable";
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
    notFound();
  }

  const [matchingLeads, campaigns] = await Promise.all([
    listLeadsMatchingSegment(supabase, segment),
    listOutreachCampaignsForSegment(supabase, segment.id),
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
              Se calcula en vivo según los filtros de este segmento: solo
              incluye leads que autorizaron ser contactados.
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
              Cada campaña elige una plantilla y genera una tarea de
              seguimiento manual por lead.
            </p>
            <div className="mt-4">
              <OutreachCampaignsTable campaigns={campaigns} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <EditLeadSegmentForm segment={segment} />
          </Card>
        </div>
      </div>
    </div>
  );
}
