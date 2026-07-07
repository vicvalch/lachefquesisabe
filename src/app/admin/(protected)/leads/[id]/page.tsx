import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeadById, listContactLogs } from "@/lib/leads/queries";
import { LeadInfoCard } from "@/components/admin/LeadInfoCard";
import { LeadUpdateForm } from "@/components/admin/LeadUpdateForm";
import { ContactLogForm } from "@/components/admin/ContactLogForm";
import { ContactLogTimeline } from "@/components/admin/ContactLogTimeline";
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

  const contactLogs = await listContactLogs(supabase, lead.id);

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
              Registrar contacto
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Cada contacto queda registrado y actualiza automáticamente el
              último contacto y el próximo seguimiento del lead.
            </p>
            <div className="mt-4">
              <ContactLogForm leadId={lead.id} />
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
