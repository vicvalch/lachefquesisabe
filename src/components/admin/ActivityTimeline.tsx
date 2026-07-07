import {
  CONTACT_CHANNEL_LABELS,
  LEAD_ACTIVITY_TYPE_LABELS,
} from "@/lib/validations/lead-activity";
import { formatDateTime } from "@/lib/utils";
import type { LeadActivityRow } from "@/types/database";

export function ActivityTimeline({
  activities,
}: {
  activities: LeadActivityRow[];
}) {
  if (activities.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        Todavía no hay notas ni contactos registrados para este lead.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {activities.map((activity) => (
        <li
          key={activity.id}
          className="rounded-2xl border border-ink/10 bg-white p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            <span>
              {LEAD_ACTIVITY_TYPE_LABELS[activity.type]}
              {activity.channel &&
                ` · ${CONTACT_CHANNEL_LABELS[activity.channel]}`}
            </span>
            <span>{formatDateTime(activity.created_at)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
            {activity.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
