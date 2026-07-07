import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getDemoEventById,
  getDemoRegistrationCounts,
  listDemoRegistrations,
  listLeadsAvailableForDemo,
} from "@/lib/demos/queries";
import { DemoEventInfoCard } from "@/components/admin/DemoEventInfoCard";
import { DemoEventStatusForm } from "@/components/admin/DemoEventStatusForm";
import { DemoRegistrationForm } from "@/components/admin/DemoRegistrationForm";
import { DemoRosterTable } from "@/components/admin/DemoRosterTable";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Detalle de demo | Admin | La Chef que Sí Sabe",
};

export default async function DemoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const demo = await getDemoEventById(supabase, id);

  if (!demo) {
    notFound();
  }

  const [counts, registrations, availableLeads] = await Promise.all([
    getDemoRegistrationCounts(supabase, demo.id),
    listDemoRegistrations(supabase, demo.id),
    listLeadsAvailableForDemo(supabase, demo.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/demos"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a demos
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <DemoEventInfoCard demo={demo} counts={counts} />

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Agregar lead a la demo
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Solo se pueden agregar leads mientras haya cupo disponible.
            </p>
            <div className="mt-4">
              <DemoRegistrationForm
                demoEventId={demo.id}
                availableLeads={availableLeads}
              />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">
              Asistentes
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Cambia la asistencia de cada persona; el estado del lead se
              actualiza automáticamente para que el seguimiento por WhatsApp
              quede al día.
            </p>
            <div className="mt-4">
              <DemoRosterTable demo={demo} registrations={registrations} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <DemoEventStatusForm demo={demo} />
          </Card>
        </div>
      </div>
    </div>
  );
}
