import { createClient } from "@/lib/supabase/server";
import { listOpenFollowUpTasks } from "@/lib/leads/follow-up-tasks-queries";
import { listMessageTemplates } from "@/lib/message-templates/queries";
import { groupFollowUpTasks } from "@/lib/leads/follow-up-tasks";
import { FollowUpTaskList } from "@/components/admin/FollowUpTaskList";

export const metadata = {
  title: "Centro de seguimientos | Admin | La Chef que Sí Sabe",
};

export default async function FollowUpCommandCenterPage() {
  const supabase = await createClient();
  const [tasks, templates] = await Promise.all([
    listOpenFollowUpTasks(supabase),
    listMessageTemplates(supabase),
  ]);
  const { overdue, today, upcoming } = groupFollowUpTasks(tasks);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Centro de seguimientos
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Todo lo que hay que hacer hoy: vencidas, de hoy y próximas. Copia el
          mensaje sugerido, ábrelo en WhatsApp y registra el contacto sin
          perder el hilo.
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-brand-700">
          Vencidas ({overdue.length})
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Su fecha de vencimiento ya pasó.
        </p>
        <div className="mt-4">
          <FollowUpTaskList
            tasks={overdue}
            urgency="overdue"
            templates={templates}
            emptyMessage="No hay tareas vencidas. ¡Vas al día!"
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          Hoy ({today.length})
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Tareas programadas para hoy.
        </p>
        <div className="mt-4">
          <FollowUpTaskList
            tasks={today}
            urgency="today"
            templates={templates}
            emptyMessage="No hay tareas programadas para hoy."
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          Próximas ({upcoming.length})
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Tareas programadas para más adelante.
        </p>
        <div className="mt-4">
          <FollowUpTaskList
            tasks={upcoming}
            urgency="upcoming"
            templates={templates}
            emptyMessage="No hay tareas programadas más adelante."
          />
        </div>
      </section>
    </div>
  );
}
