"use client";

import { useActionState } from "react";
import {
  generateCampaignTasksAction,
  type GenerateCampaignTasksState,
} from "@/lib/actions/campaigns";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: GenerateCampaignTasksState = {};

export function GenerateCampaignTasksForm({
  campaignId,
  newLeadsCount,
}: {
  campaignId: string;
  newLeadsCount: number;
}) {
  const [state, formAction, pending] = useActionState(
    generateCampaignTasksAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="campaignId" value={campaignId} />

      <Field
        label="Fecha del seguimiento"
        htmlFor="due_at"
        hint="Cuándo debería aparecer la tarea en el Centro de Seguimientos"
      >
        <Input id="due_at" name="due_at" type="datetime-local" required />
      </Field>

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
        disabled={pending || newLeadsCount === 0}
        className="self-start"
      >
        {pending
          ? "Generando..."
          : newLeadsCount > 0
            ? `Generar ${newLeadsCount} tareas de seguimiento`
            : "No hay leads nuevos para generar"}
      </Button>
    </form>
  );
}
