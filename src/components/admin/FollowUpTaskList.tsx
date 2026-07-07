import {
  FollowUpTaskCard,
  type FollowUpUrgency,
} from "@/components/admin/FollowUpTaskCard";
import type { LeadRow } from "@/types/database";

export function FollowUpTaskList({
  leads,
  urgency,
  emptyMessage,
}: {
  leads: LeadRow[];
  urgency: FollowUpUrgency;
  emptyMessage: string;
}) {
  if (leads.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {leads.map((lead) => (
        <FollowUpTaskCard key={lead.id} lead={lead} urgency={urgency} />
      ))}
    </div>
  );
}
