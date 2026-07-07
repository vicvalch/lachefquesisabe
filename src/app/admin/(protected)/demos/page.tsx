import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getRegistrationCountsByDemoIds,
  listPastDemoEvents,
  listUpcomingDemoEvents,
} from "@/lib/demos/queries";
import { DemoEventsList } from "@/components/admin/DemoEventsList";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Demos | Admin | La Chef que Sí Sabe",
};

export default async function DemosPage() {
  const supabase = await createClient();
  const [upcoming, past] = await Promise.all([
    listUpcomingDemoEvents(supabase),
    listPastDemoEvents(supabase),
  ]);

  const counts = await getRegistrationCountsByDemoIds(supabase, [
    ...upcoming.map((demo) => demo.id),
    ...past.map((demo) => demo.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Demos
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Organiza tus demostraciones, controla el cupo y registra quién
            asistió.
          </p>
        </div>
        <Link href="/admin/demos/new">
          <Button type="button">Crear demo</Button>
        </Link>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">
          Próximas
        </h2>
        <div className="mt-4">
          <DemoEventsList
            demos={upcoming}
            counts={counts}
            emptyMessage="No tienes demos programadas. Crea una para empezar a invitar leads."
          />
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">
          Pasadas
        </h2>
        <div className="mt-4">
          <DemoEventsList
            demos={past}
            counts={counts}
            emptyMessage="Todavía no hay demos realizadas o canceladas."
          />
        </div>
      </div>
    </div>
  );
}
