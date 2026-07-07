import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import {
  LEAD_INTEREST_OPTIONS,
  LEAD_STATUS_LABELS,
} from "@/lib/validations/lead";
import { formatDateTime } from "@/lib/utils";
import type { LeadRow } from "@/types/database";

export function LeadInfoCard({ lead }: { lead: LeadRow }) {
  const interestLabel =
    LEAD_INTEREST_OPTIONS.find((option) => option.value === lead.interest)
      ?.label ?? lead.interest;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            {lead.name}
          </h2>
          <p className="text-sm text-ink-soft">
            Recibido el {formatDateTime(lead.created_at)}
          </p>
        </div>
        <StatusBadge status={lead.status} label={LEAD_STATUS_LABELS[lead.status]} />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Email
          </dt>
          <dd className="text-sm text-ink">
            <a href={`mailto:${lead.email}`} className="hover:underline">
              {lead.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Teléfono
          </dt>
          <dd className="text-sm text-ink">
            {lead.phone ? (
              <a href={`tel:${lead.phone}`} className="hover:underline">
                {lead.phone}
              </a>
            ) : (
              "No proporcionado"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Interés
          </dt>
          <dd className="text-sm text-ink">{interestLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Origen
          </dt>
          <dd className="text-sm text-ink">{lead.source}</dd>
        </div>
      </dl>

      {lead.message && (
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Mensaje
          </dt>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
            {lead.message}
          </p>
        </div>
      )}
    </Card>
  );
}
