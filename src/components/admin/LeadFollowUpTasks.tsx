"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { MessageTemplatePicker } from "@/components/admin/MessageTemplatePicker";
import { ContactLogForm } from "@/components/admin/ContactLogForm";
import { FollowUpTaskActions } from "@/components/admin/FollowUpTaskActions";
import { TASK_STATUS_LABELS } from "@/lib/validations/follow-up-task";
import type { FollowUpTaskWithDemo } from "@/lib/leads/follow-up-tasks-queries";
import type { LeadRow, MessageTemplateRow } from "@/types/database";

function PendingTask({
  task,
  lead,
  templates,
}: {
  task: FollowUpTaskWithDemo;
  lead: LeadRow;
  templates: MessageTemplateRow[];
}) {
  const [showLogForm, setShowLogForm] = useState(false);

  return (
    <li className="rounded-2xl border border-brand-500/30 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-ink">{task.title}</p>
          <p className="text-xs text-ink-soft">
            Vence {formatDateTime(task.due_at)}
            {task.demo && ` · ${task.demo.title}`}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <MessageTemplatePicker
          templates={templates}
          lead={lead}
          demo={task.demo}
          defaultTemplateKey={task.message_template_key}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-3">
        <button
          type="button"
          onClick={() => setShowLogForm((v) => !v)}
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          {showLogForm ? "Ocultar registro" : "Registrar contacto"}
        </button>
        <FollowUpTaskActions taskId={task.id} leadId={lead.id} />
      </div>

      {showLogForm && (
        <div className="mt-3 border-t border-ink/10 pt-3">
          <ContactLogForm leadId={lead.id} taskId={task.id} />
        </div>
      )}
    </li>
  );
}

function TaskHistoryItem({ task }: { task: FollowUpTaskWithDemo }) {
  return (
    <li className="rounded-2xl border border-ink/10 bg-cream-dark/20 p-4 text-sm text-ink-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-ink">{task.title}</span>
        <span className="text-xs uppercase tracking-wide">
          {TASK_STATUS_LABELS[task.status]}
        </span>
      </div>
      <p className="mt-1 text-xs">
        {task.completed_at
          ? `Resuelta el ${formatDateTime(task.completed_at)}`
          : `Vencía el ${formatDateTime(task.due_at)}`}
        {task.demo && ` · ${task.demo.title}`}
      </p>
      {task.notes && <p className="mt-1 text-xs">{task.notes}</p>}
    </li>
  );
}

export function LeadFollowUpTasks({
  lead,
  tasks,
  templates,
}: {
  lead: LeadRow;
  tasks: FollowUpTaskWithDemo[];
  templates: MessageTemplateRow[];
}) {
  const pending = tasks.filter((task) => task.status === "pending");
  const history = tasks.filter((task) => task.status !== "pending");

  if (tasks.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        Este lead todavía no tiene tareas de seguimiento.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pending.length > 0 && (
        <ul className="flex flex-col gap-3">
          {pending.map((task) => (
            <PendingTask key={task.id} task={task} lead={lead} templates={templates} />
          ))}
        </ul>
      )}

      {history.length > 0 && (
        <details className="text-sm text-ink-soft">
          <summary className="cursor-pointer font-semibold text-ink">
            Historial ({history.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {history.map((task) => (
              <TaskHistoryItem key={task.id} task={task} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
