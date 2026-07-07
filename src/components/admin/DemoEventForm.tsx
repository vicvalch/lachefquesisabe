"use client";

import { useActionState, useState } from "react";
import {
  createDemoEventAction,
  type CreateDemoEventState,
} from "@/lib/actions/demos";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { DEMO_MODE_OPTIONS } from "@/lib/validations/demo-event";
import type { DemoMode } from "@/types/database";

const initialState: CreateDemoEventState = {};

export function DemoEventForm() {
  const [state, formAction, pending] = useActionState(
    createDemoEventAction,
    initialState,
  );
  const [mode, setMode] = useState<DemoMode>("in_person");

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
        <Field label="Modalidad" htmlFor="mode">
          <Select
            id="mode"
            name="mode"
            defaultValue="in_person"
            onChange={(event) => setMode(event.target.value as DemoMode)}
          >
            {DEMO_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Fecha y hora de inicio" htmlFor="starts_at">
          <Input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Hora de fin (opcional)"
          htmlFor="ends_at"
        >
          <Input id="ends_at" name="ends_at" type="datetime-local" />
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

      {mode === "in_person" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del lugar" htmlFor="location_name">
            <Input
              id="location_name"
              name="location_name"
              placeholder="Ej: Casa de la chef"
            />
          </Field>
          <Field label="Dirección" htmlFor="location_address">
            <Input
              id="location_address"
              name="location_address"
              placeholder="Ej: Heredia, Costa Rica"
            />
          </Field>
        </div>
      ) : (
        <Field
          label="Link de la videollamada"
          htmlFor="meeting_url"
          hint="Se comparte con los inscritos al confirmar"
        >
          <Input
            id="meeting_url"
            name="meeting_url"
            placeholder="Ej: https://meet.google.com/..."
          />
        </Field>
      )}

      <Field
        label="Descripción (opcional)"
        htmlFor="description"
        hint="Lo que verán en la demo; se muestra en la página pública"
      >
        <Textarea id="description" name="description" rows={3} />
      </Field>

      <Field
        label="Notas públicas (opcional)"
        htmlFor="public_notes"
        hint="Ej: qué traer, qué esperar"
      >
        <Textarea id="public_notes" name="public_notes" rows={2} />
      </Field>

      <Field
        label="Notas internas (opcional)"
        htmlFor="internal_notes"
        hint="Solo las ve el equipo admin"
      >
        <Textarea id="internal_notes" name="internal_notes" rows={3} />
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
