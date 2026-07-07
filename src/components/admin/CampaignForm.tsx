"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createOutreachCampaignAction,
  type CreateOutreachCampaignState,
} from "@/lib/actions/campaigns";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CONTACT_CHANNEL_OPTIONS } from "@/lib/validations/contact-log";
import { CAMPAIGN_TASK_PRIORITY_OPTIONS } from "@/lib/validations/outreach-campaign";
import type { LeadSegmentRow, MessageTemplateRow } from "@/types/database";

const initialState: CreateOutreachCampaignState = {};

export function CampaignForm({
  segments,
  templates,
  defaultSegmentId,
}: {
  segments: LeadSegmentRow[];
  templates: MessageTemplateRow[];
  defaultSegmentId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    createOutreachCampaignAction,
    initialState,
  );
  const activeTemplates = templates.filter((template) => template.is_active);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Segmento" htmlFor="segment_id">
        <Select
          id="segment_id"
          name="segment_id"
          required
          defaultValue={defaultSegmentId ?? ""}
        >
          <option value="" disabled>
            Selecciona un segmento
          </option>
          {segments.map((segment) => (
            <option key={segment.id} value={segment.id}>
              {segment.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Plantilla de mensaje"
        htmlFor="message_template_id"
        hint="Se sugiere al generar cada tarea de seguimiento"
      >
        <Select id="message_template_id" name="message_template_id" required defaultValue="">
          <option value="" disabled>
            Selecciona una plantilla
          </option>
          {activeTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Nombre de la campaña" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          placeholder="Ej: Recontacto interesados en demo virtual"
        />
      </Field>

      <Field label="Descripción (opcional)" htmlFor="description">
        <Textarea id="description" name="description" rows={2} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Canal sugerido" htmlFor="task_type">
          <Select id="task_type" name="task_type" defaultValue="whatsapp">
            {CONTACT_CHANNEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Prioridad de la tarea" htmlFor="task_priority">
          <Select id="task_priority" name="task_priority" defaultValue="medium">
            {CAMPAIGN_TASK_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Título de la tarea (opcional)"
        htmlFor="task_title"
        hint="Si se deja vacío, se usa 'Contactar: <nombre de la campaña>'"
      >
        <Input id="task_title" name="task_title" placeholder="Ej: Llamar para confirmar interés" />
      </Field>

      <Field
        label="Notas de la tarea (opcional)"
        htmlFor="task_notes"
        hint="Se copian tal cual en cada tarea generada"
      >
        <Textarea id="task_notes" name="task_notes" rows={2} />
      </Field>

      <Field
        label="Fecha sugerida (opcional)"
        htmlFor="due_at"
        hint="Si se deja vacío, las tareas se generan con fecha de hoy"
      >
        <Input id="due_at" name="due_at" type="datetime-local" />
      </Field>

      {segments.length === 0 && (
        <p className="text-xs text-ink-soft">
          Todavía no hay segmentos. Crea uno primero desde{" "}
          <Link href="/admin/segmentos/new" className="font-semibold underline">
            /admin/segmentos/new
          </Link>
          .
        </p>
      )}

      {activeTemplates.length === 0 && (
        <p className="text-xs text-ink-soft">
          Todavía no hay plantillas activas. Crea o activa una desde{" "}
          <Link href="/admin/plantillas" className="font-semibold underline">
            /admin/plantillas
          </Link>
          .
        </p>
      )}

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Creando..." : "Crear campaña"}
      </Button>
    </form>
  );
}
