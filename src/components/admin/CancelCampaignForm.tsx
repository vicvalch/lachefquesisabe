"use client";

import { useActionState } from "react";
import {
  cancelOutreachCampaignAction,
  type CancelOutreachCampaignState,
} from "@/lib/actions/campaigns";
import { Button } from "@/components/ui/Button";

const initialState: CancelOutreachCampaignState = {};

export function CancelCampaignForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, pending] = useActionState(
    cancelOutreachCampaignAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="campaignId" value={campaignId} />

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="ghost" disabled={pending} className="self-start">
        {pending ? "Cancelando..." : "Cancelar campaña"}
      </Button>
    </form>
  );
}
