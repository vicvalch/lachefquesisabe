"use client";

import { useActionState } from "react";
import {
  updateMessageTemplateAction,
  type UpdateMessageTemplateState,
} from "@/lib/actions/message-templates";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { MessageTemplateRow } from "@/types/database";

const initialState: UpdateMessageTemplateState = {};

export function MessageTemplateForm({ template }: { template: MessageTemplateRow }) {
  const [state, formAction, pending] = useActionState(
    updateMessageTemplateAction,
    initialState,
  );

  return (
    <Card className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="templateId" value={template.id} />

        <span className="self-start rounded-full bg-cream-dark/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {template.key}
        </span>

        <Field label="Nombre" htmlFor={`label-${template.id}`}>
          <Input
            id={`label-${template.id}`}
            name="label"
            defaultValue={template.label}
            required
          />
        </Field>

        <Field
          label="Mensaje"
          htmlFor={`body-${template.id}`}
          hint="Placeholders disponibles: {{name}}, {{demo_title}}, {{demo_date}}, {{demo_time}}, {{demo_location}}"
        >
          <Textarea
            id={`body-${template.id}`}
            name="body"
            rows={4}
            defaultValue={template.body}
            required
          />
        </Field>

        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={template.is_active}
            className="h-4 w-4 rounded border-ink/30"
          />
          Activa (visible para elegir al copiar un mensaje)
        </label>

        {state.error && (
          <p className="text-sm font-medium text-brand-700" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" variant="secondary" disabled={pending} className="self-start">
          {pending ? "Guardando..." : "Guardar plantilla"}
        </Button>
      </form>
    </Card>
  );
}
