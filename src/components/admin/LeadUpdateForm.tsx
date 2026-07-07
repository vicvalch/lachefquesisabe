"use client";

import { useActionState } from "react";
import { updateLeadAction, type UpdateLeadState } from "@/lib/actions/leads";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { LEAD_STATUS_OPTIONS } from "@/lib/validations/lead";
import type { LeadRow } from "@/types/database";

const initialState: UpdateLeadState = {};

export function LeadUpdateForm({ lead }: { lead: LeadRow }) {
  const [state, formAction, pending] = useActionState(
    updateLeadAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="leadId" value={lead.id} />

      <Field
        label="Estado comercial"
        htmlFor="status"
        hint="Al cambiarlo se ajusta automáticamente la tarea de seguimiento pendiente"
      >
        <Select id="status" name="status" defaultValue={lead.status}>
          {LEAD_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Notas"
        htmlFor="notes"
        hint="Notas internas del equipo; no se comparten con el lead"
      >
        <Textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={lead.notes ?? ""}
          placeholder="Ej: prefiere que la contacten después de las 6pm"
        />
      </Field>

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
