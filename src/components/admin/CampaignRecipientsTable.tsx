import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { TASK_STATUS_LABELS } from "@/lib/validations/follow-up-task";
import type { CampaignRecipientWithLead } from "@/lib/campaigns/queries";

export function CampaignRecipientsTable({
  recipients,
}: {
  recipients: CampaignRecipientWithLead[];
}) {
  if (recipients.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        Todavía no se generaron tareas para esta campaña.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Lead</th>
            <th className="px-4 py-3">Tarea</th>
            <th className="px-4 py-3">Generada</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {recipients.map((recipient) => (
            <tr key={recipient.id} className="hover:bg-cream-dark/30">
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  href={`/admin/leads/${recipient.lead.id}`}
                  className="hover:text-brand-700 hover:underline"
                >
                  {recipient.lead.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {recipient.task
                  ? `${TASK_STATUS_LABELS[recipient.task.status]} · ${formatDateTime(
                      recipient.task.due_at,
                    )}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDateTime(recipient.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
