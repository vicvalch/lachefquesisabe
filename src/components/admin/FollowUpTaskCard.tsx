"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WhatsAppTemplates } from "@/components/admin/WhatsAppTemplates";
import { ContactLogForm } from "@/components/admin/ContactLogForm";
import { CompleteFollowUpButton } from "@/components/admin/CompleteFollowUpButton";
import {
  LEAD_STATUS_LABELS,
  PRIMARY_INTEREST_LABELS,
} from "@/lib/validations/lead";
import { getFollowUpSuggestion } from "@/lib/leads/follow-up-suggestions";
import type { LeadRow } from "@/types/database";

export type FollowUpUrgency = "overdue" | "today" | "upcoming";

const URGENCY_BORDER_CLASSES: Record<FollowUpUrgency, string> = {
  overdue: "border-brand-500/40",
  today: "border-mustard-400/60",
  upcoming: "border-ink/10",
};

export function FollowUpTaskCard({
  lead,
  urgency,
}: {
  lead: LeadRow;
  urgency: FollowUpUrgency;
}) {
  const [showLogForm, setShowLogForm] = useState(false);
  const suggestion = getFollowUpSuggestion(lead.status);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5",
        URGENCY_BORDER_CLASSES[urgency],
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/leads/${lead.id}`}
            className="font-display text-lg font-semibold text-ink hover:text-brand-700 hover:underline"
          >
            {lead.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            <StatusBadge status={lead.status} label={LEAD_STATUS_LABELS[lead.status]} />
            <span>{PRIMARY_INTEREST_LABELS[lead.primary_interest]}</span>
            {lead.phone && <span>· {lead.phone}</span>}
          </div>
        </div>
        <div className="text-right text-xs text-ink-soft">
          <p className="font-semibold text-ink">{suggestion.taskLabel}</p>
          <p>
            {lead.next_follow_up_at ? formatDateTime(lead.next_follow_up_at) : "-"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <WhatsAppTemplates lead={lead} defaultTemplateId={suggestion.templateId} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-4">
        <Button type="button" variant="ghost" onClick={() => setShowLogForm((v) => !v)}>
          {showLogForm ? "Ocultar registro" : "Registrar contacto"}
        </Button>
        <CompleteFollowUpButton leadId={lead.id} />
        <Link
          href={`/admin/leads/${lead.id}`}
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          Ver lead completo
        </Link>
      </div>

      {showLogForm && (
        <div className="mt-4 border-t border-ink/10 pt-4">
          <ContactLogForm leadId={lead.id} />
        </div>
      )}
    </div>
  );
}
