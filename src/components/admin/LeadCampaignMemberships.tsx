import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { CampaignStatusBadge } from "@/components/ui/Badge";
import {
  CAMPAIGN_RECIPIENT_STATUS_LABELS,
  CAMPAIGN_STATUS_LABELS,
} from "@/lib/validations/outreach-campaign";
import type { LeadCampaignMembership } from "@/lib/campaigns/queries";

/**
 * Últimas campañas donde este lead fue destinatario (acotado a 5, ver
 * listCampaignsForLead) — no requiere que la campaña ya haya generado su
 * tarea: muestra también las que están en 'selected' (materializadas,
 * todavía sin tarea).
 */
export function LeadCampaignMemberships({
  memberships,
}: {
  memberships: LeadCampaignMembership[];
}) {
  if (memberships.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-4 text-center text-sm text-ink-soft">
        Este lead todavía no fue destinatario de ninguna campaña manual.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {memberships.map((membership) => (
        <li
          key={membership.campaign.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/10 p-3 text-sm"
        >
          <div>
            <Link
              href={`/admin/campanas/${membership.campaign.id}`}
              className="font-semibold text-brand-700 hover:underline"
            >
              {membership.campaign.name}
            </Link>
            <p className="text-xs text-ink-soft">
              {CAMPAIGN_RECIPIENT_STATUS_LABELS[membership.recipientStatus]} ·{" "}
              {formatDateTime(membership.createdAt)}
            </p>
          </div>
          <CampaignStatusBadge
            status={membership.campaign.status}
            label={CAMPAIGN_STATUS_LABELS[membership.campaign.status]}
          />
        </li>
      ))}
    </ul>
  );
}
