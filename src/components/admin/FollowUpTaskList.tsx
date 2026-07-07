import {
  FollowUpTaskCard,
  type FollowUpUrgency,
} from "@/components/admin/FollowUpTaskCard";
import type { FollowUpTaskWithLead } from "@/lib/leads/follow-up-tasks-queries";
import type { MessageTemplateRow } from "@/types/database";

export function FollowUpTaskList({
  tasks,
  urgency,
  templates,
  emptyMessage,
}: {
  tasks: FollowUpTaskWithLead[];
  urgency: FollowUpUrgency;
  templates: MessageTemplateRow[];
  emptyMessage: string;
}) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {tasks.map((task) => (
        <FollowUpTaskCard
          key={task.id}
          task={task}
          urgency={urgency}
          templates={templates}
        />
      ))}
    </div>
  );
}
