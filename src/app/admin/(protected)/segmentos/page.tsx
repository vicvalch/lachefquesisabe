import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listLeadSegments, listLeadsMatchingSegment } from "@/lib/segments/queries";
import { LeadSegmentsTable } from "@/components/admin/LeadSegmentsTable";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Segmentos de leads | Admin | La Chef que Sí Sabe",
};

export default async function LeadSegmentsPage() {
  const supabase = await createClient();
  const segments = await listLeadSegments(supabase);

  const matchingLeadsBySegment = await Promise.all(
    segments.map((segment) => listLeadsMatchingSegment(supabase, segment)),
  );
  const countsBySegmentId = Object.fromEntries(
    segments.map((segment, index) => [
      segment.id,
      matchingLeadsBySegment[index].length,
    ]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Segmentos de leads
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Agrupa leads con filtros simples para preparar una campaña de
            seguimiento manual. Qué leads entran se calcula en vivo, no es
            una lista fija.
          </p>
        </div>
        <Link href="/admin/segmentos/new">
          <Button type="button">+ Nuevo segmento</Button>
        </Link>
      </div>

      <LeadSegmentsTable segments={segments} countsBySegmentId={countsBySegmentId} />
    </div>
  );
}
