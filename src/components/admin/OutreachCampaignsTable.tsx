import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { CampaignStatusBadge } from "@/components/ui/Badge";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/validations/outreach-campaign";
import type { OutreachCampaignWithSegment } from "@/lib/campaigns/queries";

export function OutreachCampaignsTable({
  campaigns,
}: {
  campaigns: OutreachCampaignWithSegment[];
}) {
  if (campaigns.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        Todavía no hay campañas manuales. Creá una para agrupar el
        seguimiento de un segmento de leads.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Campaña</th>
            <th className="px-4 py-3">Segmento</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Destinatarios</th>
            <th className="px-4 py-3">Creada</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="hover:bg-cream-dark/30">
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  href={`/admin/campanas/${campaign.id}`}
                  className="hover:text-brand-700 hover:underline"
                >
                  {campaign.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {campaign.segment ? (
                  <Link
                    href={`/admin/segmentos/${campaign.segment.id}`}
                    className="hover:text-brand-700 hover:underline"
                  >
                    {campaign.segment.name}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                <CampaignStatusBadge
                  status={campaign.status}
                  label={CAMPAIGN_STATUS_LABELS[campaign.status]}
                />
              </td>
              <td className="px-4 py-3 text-ink-soft">{campaign.recipientsCount}</td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDateTime(campaign.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
