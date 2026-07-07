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
import { ATTENDANCE_STATUS_OPTIONS } from "@/lib/validations/demo-registration";
import {
  CONSENT_FILTER_OPTIONS,
  HAS_OPEN_TASK_OPTIONS,
  SEARCH_MAX_LENGTH,
} from "@/lib/validations/lead-segment";
import type { ContentPostRow, DemoEventRow } from "@/types/database";

const initialState: CreateLeadSegmentState = {};

export function LeadSegmentForm({
  demoEvents,
  contentPosts,
}: {
  demoEvents: DemoEventRow[];
  contentPosts: ContentPostRow[];
}) {
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
        label="Fuentes (opcional)"
        htmlFor="sources"
        hint="Separadas por coma, coincidencia exacta. Ej: landing, demo"
      >
        <Input id="sources" name="sources" placeholder="Ej: landing, demo" />
      </Field>

      <Field label="Consentimiento de contacto" htmlFor="consent_contact">
        <Select id="consent_contact" name="consent_contact" defaultValue="any">
          {CONSENT_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Recibido desde (opcional)" htmlFor="created_from">
          <Input id="created_from" name="created_from" type="date" />
        </Field>
        <Field label="Recibido hasta (opcional)" htmlFor="created_to">
          <Input id="created_to" name="created_to" type="date" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Último contacto desde (opcional)" htmlFor="last_contacted_after">
          <Input id="last_contacted_after" name="last_contacted_after" type="date" />
        </Field>
        <Field label="Último contacto hasta (opcional)" htmlFor="last_contacted_before">
          <Input id="last_contacted_before" name="last_contacted_before" type="date" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Próximo seguimiento desde (opcional)" htmlFor="next_follow_up_after">
          <Input id="next_follow_up_after" name="next_follow_up_after" type="date" />
        </Field>
        <Field label="Próximo seguimiento hasta (opcional)" htmlFor="next_follow_up_before">
          <Input id="next_follow_up_before" name="next_follow_up_before" type="date" />
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

      <Field
        label="Demo (opcional)"
        htmlFor="demo_event_id"
        hint="Solo leads inscritos en esta demo"
      >
        <Select id="demo_event_id" name="demo_event_id" defaultValue="">
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
        htmlFor="content_post_id"
        hint="Solo leads que llegaron desde este contenido"
      >
        <Select id="content_post_id" name="content_post_id" defaultValue="">
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
        htmlFor="search"
        hint={`Nombre, email o teléfono. Máximo ${SEARCH_MAX_LENGTH} caracteres.`}
      >
        <Input id="search" name="search" maxLength={SEARCH_MAX_LENGTH} />
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
