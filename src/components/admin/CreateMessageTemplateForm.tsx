"use client";

import { useActionState } from "react";
import {
  createMessageTemplateAction,
  type CreateMessageTemplateState,
} from "@/lib/actions/message-templates";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const initialState: CreateMessageTemplateState = {};

export function CreateMessageTemplateForm() {
  const [state, formAction, pending] = useActionState(
    createMessageTemplateAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        label="Clave"
        htmlFor="key"
        hint="Identificador estable en minúsculas y guiones (ej: seguimiento-compra). No se puede cambiar después."
      >
        <Input id="key" name="key" required placeholder="ej: recontacto-suave" />
      </Field>

      <Field label="Nombre" htmlFor="label">
        <Input id="label" name="label" required placeholder="Nombre visible de la plantilla" />
      </Field>

      <Field
        label="Mensaje"
        htmlFor="body"
        hint="Placeholders disponibles: {{name}}, {{demo_title}}, {{demo_date}}, {{demo_time}}, {{demo_location}}"
      >
        <Textarea id="body" name="body" rows={4} required />
      </Field>

      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked
          className="h-4 w-4 rounded border-ink/30"
        />
        Activa (visible para elegir al copiar un mensaje)
      </label>

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Creando..." : "Crear plantilla"}
      </Button>
    </form>
  );
}
