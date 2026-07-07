"use client";

import { useActionState } from "react";
import {
  updateDemoEventStatusAction,
  type UpdateDemoEventStatusState,
} from "@/lib/actions/demos";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { DEMO_EVENT_STATUS_OPTIONS } from "@/lib/validations/demo-event";
import type { DemoEventRow } from "@/types/database";

const initialState: UpdateDemoEventStatusState = {};

export function DemoEventStatusForm({ demo }: { demo: DemoEventRow }) {
  const [state, formAction, pending] = useActionState(
    updateDemoEventStatusAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="demoEventId" value={demo.id} />

      <Field label="Estado de la demo" htmlFor="status">
        <Select id="status" name="status" defaultValue={demo.status}>
          {DEMO_EVENT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Notas internas"
        htmlFor="internal_notes"
        hint="No se comparten con los leads"
      >
        <Textarea
          id="internal_notes"
          name="internal_notes"
          rows={4}
          defaultValue={demo.internal_notes ?? ""}
          placeholder="Ej: llevar ingredientes extra, faltó espacio para estacionar"
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
