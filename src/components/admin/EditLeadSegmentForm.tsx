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
import { ATTENDANCE_STATUS_OPTIONS } from "@/lib/validations/demo-registration";
import {
  CONSENT_FILTER_OPTIONS,
  HAS_OPEN_TASK_OPTIONS,
  SEARCH_MAX_LENGTH,
  type TriStateFilter,
} from "@/lib/validations/lead-segment";
import type { ContentPostRow, DemoEventRow, LeadSegmentRow } from "@/types/database";

const initialState: UpdateLeadSegmentState = {};

function toDateInputValue(value: string | undefined): string {
  return value ? value.slice(0, 10) : "";
}

function toTriState(value: boolean | undefined): TriStateFilter {
  if (value === undefined) return "any";
  return value ? "yes" : "no";
}

export function EditLeadSegmentForm({
  segment,
  demoEvents,
  contentPosts,
}: {
  segment: LeadSegmentRow;
  demoEvents: DemoEventRow[];
  contentPosts: ContentPostRow[];
}) {
  const [state, formAction, pending] = useActionState(
    updateLeadSegmentAction,
    initialState,
  );
  const { criteria } = segment;
  const idSuffix = segment.id;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="segmentId" value={segment.id} />

      <Field label="Nombre" htmlFor={`name-${idSuffix}`}>
        <Input
          id={`name-${idSuffix}`}
          name="name"
          defaultValue={segment.name}
          required
        />
      </Field>

      <Field label="Descripción (opcional)" htmlFor={`description-${idSuffix}`}>
        <Textarea
          id={`description-${idSuffix}`}
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
                defaultChecked={(criteria.statuses ?? []).includes(option.value)}
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
                defaultChecked={(criteria.primary_interests ?? []).includes(option.value)}
                className="h-4 w-4 rounded border-ink/30"
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">Ninguno marcado = cualquier interés.</p>
      </fieldset>

      <Field
        label="Fuentes (opcional)"
        htmlFor={`sources-${idSuffix}`}
        hint="Separadas por coma, coincidencia exacta. Ej: landing, demo"
      >
        <Input
          id={`sources-${idSuffix}`}
          name="sources"
          defaultValue={(criteria.sources ?? []).join(", ")}
        />
      </Field>

      <Field label="Consentimiento de contacto" htmlFor={`consent_contact-${idSuffix}`}>
        <Select
          id={`consent_contact-${idSuffix}`}
          name="consent_contact"
          defaultValue={toTriState(criteria.consent_contact)}
        >
          {CONSENT_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Recibido desde (opcional)" htmlFor={`created_from-${idSuffix}`}>
          <Input
            id={`created_from-${idSuffix}`}
            name="created_from"
            type="date"
            defaultValue={toDateInputValue(criteria.created_from)}
          />
        </Field>
        <Field label="Recibido hasta (opcional)" htmlFor={`created_to-${idSuffix}`}>
          <Input
            id={`created_to-${idSuffix}`}
            name="created_to"
            type="date"
            defaultValue={toDateInputValue(criteria.created_to)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Último contacto desde (opcional)"
          htmlFor={`last_contacted_after-${idSuffix}`}
        >
          <Input
            id={`last_contacted_after-${idSuffix}`}
            name="last_contacted_after"
            type="date"
            defaultValue={toDateInputValue(criteria.last_contacted_after)}
          />
        </Field>
        <Field
          label="Último contacto hasta (opcional)"
          htmlFor={`last_contacted_before-${idSuffix}`}
        >
          <Input
            id={`last_contacted_before-${idSuffix}`}
            name="last_contacted_before"
            type="date"
            defaultValue={toDateInputValue(criteria.last_contacted_before)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Próximo seguimiento desde (opcional)"
          htmlFor={`next_follow_up_after-${idSuffix}`}
        >
          <Input
            id={`next_follow_up_after-${idSuffix}`}
            name="next_follow_up_after"
            type="date"
            defaultValue={toDateInputValue(criteria.next_follow_up_after)}
          />
        </Field>
        <Field
          label="Próximo seguimiento hasta (opcional)"
          htmlFor={`next_follow_up_before-${idSuffix}`}
        >
          <Input
            id={`next_follow_up_before-${idSuffix}`}
            name="next_follow_up_before"
            type="date"
            defaultValue={toDateInputValue(criteria.next_follow_up_before)}
          />
        </Field>
      </div>

      <Field label="Tarea de seguimiento" htmlFor={`has_open_follow_up_task-${idSuffix}`}>
        <Select
          id={`has_open_follow_up_task-${idSuffix}`}
          name="has_open_follow_up_task"
          defaultValue={toTriState(criteria.has_open_follow_up_task)}
        >
          {HAS_OPEN_TASK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Demo (opcional)"
        htmlFor={`demo_event_id-${idSuffix}`}
        hint="Solo leads inscritos en esta demo"
      >
        <Select
          id={`demo_event_id-${idSuffix}`}
          name="demo_event_id"
          defaultValue={criteria.demo_event_id ?? ""}
        >
          <option value="">Cualquiera / ninguna en particular</option>
          {demoEvents.map((demo) => (
            <option key={demo.id} value={demo.id}>
              {demo.title}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-ink">
          Asistencia a la demo (opcional)
        </legend>
        <div className="flex flex-wrap gap-3">
          {ATTENDANCE_STATUS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-ink-soft"
            >
              <input
                type="checkbox"
                name="demo_attendance_statuses"
                value={option.value}
                defaultChecked={(criteria.demo_attendance_statuses ?? []).includes(
                  option.value,
                )}
                className="h-4 w-4 rounded border-ink/30"
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">
          Ninguno marcado = cualquier asistencia. Se combina con el filtro de demo de arriba.
        </p>
      </fieldset>

      <Field
        label="Contenido (opcional)"
        htmlFor={`content_post_id-${idSuffix}`}
        hint="Solo leads que llegaron desde este contenido"
      >
        <Select
          id={`content_post_id-${idSuffix}`}
          name="content_post_id"
          defaultValue={criteria.content_post_id ?? ""}
        >
          <option value="">Cualquiera / ninguno en particular</option>
          {contentPosts.map((post) => (
            <option key={post.id} value={post.id}>
              {post.title}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Búsqueda (opcional)"
        htmlFor={`search-${idSuffix}`}
        hint={`Nombre, email o teléfono. Máximo ${SEARCH_MAX_LENGTH} caracteres.`}
      >
        <Input
          id={`search-${idSuffix}`}
          name="search"
          maxLength={SEARCH_MAX_LENGTH}
          defaultValue={criteria.search ?? ""}
        />
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
