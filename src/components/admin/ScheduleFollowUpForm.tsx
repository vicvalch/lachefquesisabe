"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createFollowUpTaskAction,
  type CreateFollowUpTaskState,
} from "@/lib/actions/follow-up-tasks";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { MessageTemplateRow } from "@/types/database";

const initialState: CreateFollowUpTaskState = {};

/**
 * Programa manualmente el siguiente seguimiento de un lead, fuera del
 * ciclo automático basado en su estado (ensureFollowUpTaskForStatus).
 */
export function ScheduleFollowUpForm({
  leadId,
  templates,
}: {
  leadId: string;
  templates: MessageTemplateRow[];
}) {
  const [state, formAction, pending] = useActionState(
    createFollowUpTaskAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const activeTemplates = templates.filter((template) => template.is_active);

  useEffect(() => {
    if (state !== initialState && !state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="leadId" value={leadId} />

      <Field label="Título de la tarea" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          placeholder="Ej: Llamar para confirmar interés"
        />
      </Field>

      <Field label="Fecha" htmlFor="due_at">
        <Input id="due_at" name="due_at" type="datetime-local" required />
      </Field>

      <Field
        label="Plantilla sugerida (opcional)"
        htmlFor="message_template_key"
      >
        <Select id="message_template_key" name="message_template_key" defaultValue="">
          <option value="">Sin plantilla</option>
          {activeTemplates.map((template) => (
            <option key={template.key} value={template.key}>
              {template.label}
            </option>
          ))}
        </Select>
      </Field>

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="secondary" disabled={pending} className="self-start">
        {pending ? "Programando..." : "Programar seguimiento"}
      </Button>
    </form>
  );
}
