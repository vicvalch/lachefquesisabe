import { createClient } from "@/lib/supabase/server";
import { listFollowUpTasks } from "@/lib/leads/queries";
import { groupFollowUpTasks } from "@/lib/leads/follow-up-tasks";
import { FollowUpTaskList } from "@/components/admin/FollowUpTaskList";

export const metadata = {
  title: "Centro de seguimientos | Admin | La Chef que Sí Sabe",
};

export default async function FollowUpCommandCenterPage() {
  const supabase = await createClient();
  const leads = await listFollowUpTasks(supabase);
  const { overdue, today, upcoming } = groupFollowUpTasks(leads);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Centro de seguimientos
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Todo lo que hay que hacer hoy: vencidos, de hoy y próximos. Copia el
          mensaje sugerido, ábrelo en WhatsApp y registra el contacto sin
          perder el hilo.
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-brand-700">
          Vencidas ({overdue.length})
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Su fecha de próximo seguimiento ya pasó.
        </p>
        <div className="mt-4">
          <FollowUpTaskList
            leads={overdue}
            urgency="overdue"
            emptyMessage="No hay tareas vencidas. ¡Vas al día!"
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          Hoy ({today.length})
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Seguimientos programados para hoy.
        </p>
        <div className="mt-4">
          <FollowUpTaskList
            leads={today}
            urgency="today"
            emptyMessage="No hay tareas programadas para hoy."
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          Próximas ({upcoming.length})
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Seguimientos programados para más adelante.
        </p>
        <div className="mt-4">
          <FollowUpTaskList
            leads={upcoming}
            urgency="upcoming"
            emptyMessage="No hay seguimientos programados más adelante."
          />
        </div>
      </section>
    </div>
  );
}
