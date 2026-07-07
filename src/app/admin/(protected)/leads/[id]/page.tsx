import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeadById, listLeadActivities } from "@/lib/leads/queries";
import { LeadInfoCard } from "@/components/admin/LeadInfoCard";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";
import { WhatsAppTemplates } from "@/components/admin/WhatsAppTemplates";
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

  const activities = await listLeadActivities(supabase, lead.id);

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
              Plantillas de WhatsApp
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Elige una plantilla, personalízala si hace falta y cópiala o
              ábrela directo en WhatsApp.
            </p>
            <div className="mt-4">
              <WhatsAppTemplates lead={lead} />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Notas y contactos
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Registra cada seguimiento para no perder el hilo con este lead.
            </p>
            <div className="mt-4">
              <ActivityForm leadId={lead.id} />
            </div>
            <div className="mt-6">
              <ActivityTimeline activities={activities} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <StatusSelect leadId={lead.id} status={lead.status} />
          </Card>
        </div>
      </div>
    </div>
  );
}
