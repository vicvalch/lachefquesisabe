"use client";

import { useActionState } from "react";
import {
  materializeCampaignRecipientsAction,
  type MaterializeCampaignRecipientsState,
} from "@/lib/actions/campaigns";
import { Button } from "@/components/ui/Button";

const initialState: MaterializeCampaignRecipientsState = {};

/**
 * Paso 1 del flujo manual: snapshotea quién matchea el segmento ahora
 * mismo como destinatario de la campaña. No crea tareas ni envía nada.
 */
export function MaterializeRecipientsForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, pending] = useActionState(
    materializeCampaignRecipientsAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="campaignId" value={campaignId} />

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="text-sm font-medium text-olive-600" role="status">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Materializando..." : "Materializar destinatarios"}
      </Button>
    </form>
  );
}
