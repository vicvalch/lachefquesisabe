import {
  CONTACT_CHANNEL_LABELS,
  CONTACT_DIRECTION_LABELS,
} from "@/lib/validations/contact-log";
import { formatDateTime } from "@/lib/utils";
import type { ContactLogRow } from "@/types/database";

export function ContactLogTimeline({ logs }: { logs: ContactLogRow[] }) {
  if (logs.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        Todavía no hay contactos registrados para este lead.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {logs.map((log) => (
        <li
          key={log.id}
          className="rounded-2xl border border-ink/10 bg-white p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            <span>
              {CONTACT_CHANNEL_LABELS[log.channel]} ·{" "}
              {CONTACT_DIRECTION_LABELS[log.direction]}
            </span>
            <span>{formatDateTime(log.created_at)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
            {log.summary}
          </p>
          {log.outcome && (
            <p className="mt-2 text-sm text-ink-soft">
              <span className="font-semibold text-ink">Resultado: </span>
              {log.outcome}
            </p>
          )}
          {log.next_follow_up_at && (
            <p className="mt-1 text-sm text-ink-soft">
              <span className="font-semibold text-ink">
                Próximo seguimiento:{" "}
              </span>
              {formatDateTime(log.next_follow_up_at)}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
