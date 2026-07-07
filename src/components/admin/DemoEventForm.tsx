"use client";

import { useActionState } from "react";
import {
  createDemoEventAction,
  type CreateDemoEventState,
} from "@/lib/actions/demos";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { DEMO_TYPE_OPTIONS } from "@/lib/validations/demo-event";

const initialState: CreateDemoEventState = {};

export function DemoEventForm() {
  const [state, formAction, pending] = useActionState(
    createDemoEventAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Título" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          placeholder="Ej: Demo de recetas rápidas"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de demo" htmlFor="demo_type">
          <Select id="demo_type" name="demo_type" defaultValue="in_person">
            {DEMO_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Fecha y hora" htmlFor="scheduled_at">
          <Input
            id="scheduled_at"
            name="scheduled_at"
            type="datetime-local"
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Ubicación"
          htmlFor="location"
          hint="Dirección o link de la videollamada"
        >
          <Input id="location" name="location" placeholder="Ej: Casa, Heredia" />
        </Field>

        <Field label="Cupo" htmlFor="capacity" hint="Número máximo de personas">
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            max={200}
            defaultValue={8}
            required
          />
        </Field>
      </div>

      <Field
        label="Descripción (opcional)"
        htmlFor="description"
        hint="Lo que verán en la demo"
      >
        <Textarea id="description" name="description" rows={3} />
      </Field>

      <Field label="Notas internas (opcional)" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={3} />
      </Field>

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Creando..." : "Crear demo"}
      </Button>
    </form>
  );
}
