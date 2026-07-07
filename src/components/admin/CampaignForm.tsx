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
        htmlFor="message_template_key"
        hint="Se sugiere al generar cada tarea de seguimiento"
      >
        <Select id="message_template_key" name="message_template_key" required defaultValue="">
          <option value="" disabled>
            Selecciona una plantilla
          </option>
          {activeTemplates.map((template) => (
            <option key={template.key} value={template.key}>
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

      <Field label="Notas (opcional)" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={3} />
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
