"use client";

import { useActionState, useState } from "react";
import {
  cancelFollowUpTaskAction,
  rescheduleFollowUpTaskAction,
  skipFollowUpTaskAction,
  type CancelFollowUpTaskState,
  type RescheduleFollowUpTaskState,
  type SkipFollowUpTaskState,
} from "@/lib/actions/follow-up-tasks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const skipInitialState: SkipFollowUpTaskState = {};
const cancelInitialState: CancelFollowUpTaskState = {};
const rescheduleInitialState: RescheduleFollowUpTaskState = {};

/**
 * Saltar, cancelar o reprogramar una tarea de seguimiento pendiente. Para
 * completarla con registro de lo conversado se usa ContactLogForm (con
 * taskId), no este componente.
 */
export function FollowUpTaskActions({
  taskId,
  leadId,
}: {
  taskId: string;
  leadId: string;
}) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [skipState, skipAction, skipPending] = useActionState(
    skipFollowUpTaskAction,
    skipInitialState,
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelFollowUpTaskAction,
    cancelInitialState,
  );
  const [rescheduleState, rescheduleAction, reschedulePending] = useActionState(
    rescheduleFollowUpTaskAction,
    rescheduleInitialState,
  );

  const error = skipState.error || cancelState.error || rescheduleState.error;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <form action={skipAction}>
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="leadId" value={leadId} />
          <Button type="submit" variant="ghost" disabled={skipPending}>
            {skipPending ? "Saltando..." : "Saltar"}
          </Button>
        </form>

        <form action={cancelAction}>
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="leadId" value={leadId} />
          <Button type="submit" variant="ghost" disabled={cancelPending}>
            {cancelPending ? "Cancelando..." : "Cancelar"}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowReschedule((v) => !v)}
        >
          Reprogramar
        </Button>
      </div>

      {showReschedule && (
        <form
          action={rescheduleAction}
          className="flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="leadId" value={leadId} />
          <Input type="datetime-local" name="due_at" required />
          <Button type="submit" variant="secondary" disabled={reschedulePending}>
            {reschedulePending ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      )}

      {error && (
        <p className="text-xs font-medium text-brand-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
