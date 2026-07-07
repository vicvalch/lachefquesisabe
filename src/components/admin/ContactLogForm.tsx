"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addContactLogAction,
  type AddContactLogState,
} from "@/lib/actions/leads";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  CONTACT_CHANNEL_OPTIONS,
  CONTACT_DIRECTION_OPTIONS,
} from "@/lib/validations/contact-log";

const initialState: AddContactLogState = {};

export function ContactLogForm({
  leadId,
  taskId,
}: {
  leadId: string;
  taskId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    addContactLogAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state !== initialState && !state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="task_id" value={taskId ?? ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Canal" htmlFor="channel">
          <Select id="channel" name="channel" defaultValue="whatsapp">
            {CONTACT_CHANNEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Dirección" htmlFor="direction">
          <Select id="direction" name="direction" defaultValue="outbound">
            {CONTACT_DIRECTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Resumen" htmlFor="summary">
        <Textarea
          id="summary"
          name="summary"
          required
          placeholder="Ej: confirmó interés, quedó de revisar horarios"
        />
      </Field>

      <Field label="Resultado (opcional)" htmlFor="outcome">
        <Input
          id="outcome"
          name="outcome"
          placeholder="Ej: agendó demo para el sábado"
        />
      </Field>

      <Field label="Próximo seguimiento (opcional)" htmlFor="next_follow_up_at">
        <Input id="next_follow_up_at" name="next_follow_up_at" type="datetime-local" />
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
        {pending ? "Guardando..." : "Registrar contacto"}
      </Button>
    </form>
  );
}
