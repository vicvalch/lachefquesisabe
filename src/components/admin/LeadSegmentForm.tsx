"use client";

import { useActionState } from "react";
import {
  createLeadSegmentAction,
  type CreateLeadSegmentState,
} from "@/lib/actions/segments";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LEAD_STATUS_OPTIONS, PRIMARY_INTEREST_OPTIONS } from "@/lib/validations/lead";
import { HAS_OPEN_TASK_OPTIONS } from "@/lib/validations/lead-segment";

const initialState: CreateLeadSegmentState = {};

export function LeadSegmentForm() {
  const [state, formAction, pending] = useActionState(
    createLeadSegmentAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field label="Nombre" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          placeholder="Ej: Interesados en demo virtual sin contactar"
        />
      </Field>

      <Field label="Descripción (opcional)" htmlFor="description">
        <Textarea id="description" name="description" rows={2} />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-ink">Estado del lead</legend>
        <div className="flex flex-wrap gap-3">
          {LEAD_STATUS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-ink-soft"
            >
              <input
                type="checkbox"
                name="statuses"
                value={option.value}
                className="h-4 w-4 rounded border-ink/30"
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">Ninguno marcado = cualquier estado.</p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-ink">Interés principal</legend>
        <div className="flex flex-wrap gap-3">
          {PRIMARY_INTEREST_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-ink-soft"
            >
              <input
                type="checkbox"
                name="primary_interests"
                value={option.value}
                className="h-4 w-4 rounded border-ink/30"
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">Ninguno marcado = cualquier interés.</p>
      </fieldset>

      <Field
        label="Fuente (opcional)"
        htmlFor="source"
        hint="Coincidencia exacta, ej: landing"
      >
        <Input id="source" name="source" placeholder="Ej: landing" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Recibido desde (opcional)" htmlFor="created_after">
          <Input id="created_after" name="created_after" type="date" />
        </Field>
        <Field label="Recibido hasta (opcional)" htmlFor="created_before">
          <Input id="created_before" name="created_before" type="date" />
        </Field>
      </div>

      <Field label="Tarea de seguimiento" htmlFor="has_open_follow_up_task">
        <Select
          id="has_open_follow_up_task"
          name="has_open_follow_up_task"
          defaultValue="any"
        >
          {HAS_OPEN_TASK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Creando..." : "Crear segmento"}
      </Button>
    </form>
  );
}
