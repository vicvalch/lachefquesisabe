"use client";

import { useActionState } from "react";
import {
  completeFollowUpAction,
  type CompleteFollowUpState,
} from "@/lib/actions/leads";
import { Button } from "@/components/ui/Button";

const initialState: CompleteFollowUpState = {};

export function CompleteFollowUpButton({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState(
    completeFollowUpAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="leadId" value={leadId} />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Completando..." : "Marcar como completada"}
      </Button>
      {state.error && (
        <p className="text-xs font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
