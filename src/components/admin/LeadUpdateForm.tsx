"use client";

import { useActionState } from "react";
import { updateLeadAction, type UpdateLeadState } from "@/lib/actions/leads";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LEAD_STATUS_OPTIONS } from "@/lib/validations/lead";
import type { LeadRow } from "@/types/database";

const initialState: UpdateLeadState = {};

function toDatetimeLocalValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function LeadUpdateForm({ lead }: { lead: LeadRow }) {
  const [state, formAction, pending] = useActionState(
    updateLeadAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="leadId" value={lead.id} />

      <Field label="Estado comercial" htmlFor="status">
        <Select id="status" name="status" defaultValue={lead.status}>
          {LEAD_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Próximo seguimiento"
        htmlFor="next_follow_up_at"
        hint="Cuándo volver a contactar a este lead"
      >
        <Input
          id="next_follow_up_at"
          name="next_follow_up_at"
          type="datetime-local"
          defaultValue={toDatetimeLocalValue(lead.next_follow_up_at)}
        />
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
