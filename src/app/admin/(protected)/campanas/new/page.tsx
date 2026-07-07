import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listLeadSegments } from "@/lib/segments/queries";
import { listMessageTemplates } from "@/lib/message-templates/queries";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Nueva campaña | Admin | La Chef que Sí Sabe",
};

export default async function NewOutreachCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ segment_id?: string }>;
}) {
  const { segment_id: segmentId } = await searchParams;
  const supabase = await createClient();
  const [segments, templates] = await Promise.all([
    listLeadSegments(supabase),
    listMessageTemplates(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/campanas"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a campañas
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Nueva campaña
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Después de crearla podrás previsualizar a quién llega antes de
          generar las tareas de seguimiento.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CampaignForm
          segments={segments}
          templates={templates}
          defaultSegmentId={segmentId}
        />
      </Card>
    </div>
  );
}
