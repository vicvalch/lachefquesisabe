"use client";

import { useActionState } from "react";
import {
  generateCampaignTasksAction,
  type GenerateCampaignTasksState,
} from "@/lib/actions/campaigns";
import { Button } from "@/components/ui/Button";

const initialState: GenerateCampaignTasksState = {};

/**
 * Paso 2 del flujo manual: crea una follow_up_task por cada destinatario
 * 'selected' de la campaña. La fecha y el resto de la configuración de la
 * tarea ya quedaron fijadas al crear la campaña (task_title, task_notes,
 * due_at); acá no hace falta pedir nada más.
 */
export function GenerateCampaignTasksForm({
  campaignId,
  pendingCount,
}: {
  campaignId: string;
  pendingCount: number;
}) {
  const [state, formAction, pending] = useActionState(
    generateCampaignTasksAction,
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

      <Button
        type="submit"
        disabled={pending || pendingCount === 0}
        className="self-start"
      >
        {pending
          ? "Generando..."
          : pendingCount > 0
            ? `Generar ${pendingCount} tareas de seguimiento`
            : "No hay destinatarios pendientes"}
      </Button>
    </form>
  );
}
