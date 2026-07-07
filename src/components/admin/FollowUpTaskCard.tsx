"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MessageTemplatePicker } from "@/components/admin/MessageTemplatePicker";
import { ContactLogForm } from "@/components/admin/ContactLogForm";
import { FollowUpTaskActions } from "@/components/admin/FollowUpTaskActions";
import {
  LEAD_STATUS_LABELS,
  PRIMARY_INTEREST_LABELS,
} from "@/lib/validations/lead";
import type { FollowUpTaskWithLead } from "@/lib/leads/follow-up-tasks-queries";
import type { MessageTemplateRow } from "@/types/database";

export type FollowUpUrgency = "overdue" | "today" | "upcoming";

const URGENCY_BORDER_CLASSES: Record<FollowUpUrgency, string> = {
  overdue: "border-brand-500/40",
  today: "border-mustard-400/60",
  upcoming: "border-ink/10",
};

export function FollowUpTaskCard({
  task,
  urgency,
  templates,
}: {
  task: FollowUpTaskWithLead;
  urgency: FollowUpUrgency;
  templates: MessageTemplateRow[];
}) {
  const [showLogForm, setShowLogForm] = useState(false);
  const { lead, demo } = task;

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
          <p className="font-semibold text-ink">{task.title}</p>
          <p>{formatDateTime(task.due_at)}</p>
          {demo && <p className="mt-0.5">{demo.title}</p>}
        </div>
      </div>

      <div className="mt-4">
        <MessageTemplatePicker
          templates={templates}
          lead={lead}
          demo={demo}
          defaultTemplateKey={task.message_template_key}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => setShowLogForm((v) => !v)}>
            {showLogForm ? "Ocultar registro" : "Registrar contacto"}
          </Button>
          <Link
            href={`/admin/leads/${lead.id}`}
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Ver lead completo
          </Link>
        </div>
        <FollowUpTaskActions taskId={task.id} leadId={lead.id} />
      </div>

      {showLogForm && (
        <div className="mt-4 border-t border-ink/10 pt-4">
          <ContactLogForm leadId={lead.id} taskId={task.id} />
        </div>
      )}
    </div>
  );
}
