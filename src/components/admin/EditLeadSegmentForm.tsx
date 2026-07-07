"use client";

import { useActionState } from "react";
import {
  updateLeadSegmentAction,
  type UpdateLeadSegmentState,
} from "@/lib/actions/segments";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LEAD_STATUS_OPTIONS, PRIMARY_INTEREST_OPTIONS } from "@/lib/validations/lead";
import {
  HAS_OPEN_TASK_OPTIONS,
  type HasOpenTaskFilter,
} from "@/lib/validations/lead-segment";
import type { LeadSegmentRow } from "@/types/database";

const initialState: UpdateLeadSegmentState = {};

function toDateInputValue(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function hasOpenTaskDefault(value: boolean | null): HasOpenTaskFilter {
  if (value === null) return "any";
  return value ? "yes" : "no";
}

export function EditLeadSegmentForm({ segment }: { segment: LeadSegmentRow }) {
  const [state, formAction, pending] = useActionState(
    updateLeadSegmentAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="segmentId" value={segment.id} />

      <Field label="Nombre" htmlFor={`name-${segment.id}`}>
        <Input
          id={`name-${segment.id}`}
          name="name"
          defaultValue={segment.name}
          required
        />
      </Field>

      <Field label="Descripción (opcional)" htmlFor={`description-${segment.id}`}>
        <Textarea
          id={`description-${segment.id}`}
          name="description"
          rows={2}
          defaultValue={segment.description ?? ""}
        />
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
                defaultChecked={segment.filter_statuses.includes(option.value)}
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
                defaultChecked={segment.filter_primary_interests.includes(
                  option.value,
                )}
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
        htmlFor={`source-${segment.id}`}
        hint="Coincidencia exacta, ej: landing"
      >
        <Input
          id={`source-${segment.id}`}
          name="source"
          defaultValue={segment.filter_source ?? ""}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Recibido desde (opcional)" htmlFor={`created_after-${segment.id}`}>
          <Input
            id={`created_after-${segment.id}`}
            name="created_after"
            type="date"
            defaultValue={toDateInputValue(segment.filter_created_after)}
          />
        </Field>
        <Field label="Recibido hasta (opcional)" htmlFor={`created_before-${segment.id}`}>
          <Input
            id={`created_before-${segment.id}`}
            name="created_before"
            type="date"
            defaultValue={toDateInputValue(segment.filter_created_before)}
          />
        </Field>
      </div>

      <Field
        label="Tarea de seguimiento"
        htmlFor={`has_open_follow_up_task-${segment.id}`}
      >
        <Select
          id={`has_open_follow_up_task-${segment.id}`}
          name="has_open_follow_up_task"
          defaultValue={hasOpenTaskDefault(segment.filter_has_open_task)}
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

      <Button
        type="submit"
        variant="secondary"
        disabled={pending}
        className="self-start"
      >
        {pending ? "Guardando..." : "Guardar segmento"}
      </Button>
    </form>
  );
}
