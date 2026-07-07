"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  addLeadActivityAction,
  type AddLeadActivityState,
} from "@/lib/actions/leads";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { CONTACT_CHANNEL_OPTIONS } from "@/lib/validations/lead-activity";
import { cn } from "@/lib/utils";
import type { LeadActivityType } from "@/types/database";

const initialState: AddLeadActivityState = {};

const TYPE_OPTIONS: { value: LeadActivityType; label: string }[] = [
  { value: "note", label: "Nota" },
  { value: "contact", label: "Contacto realizado" },
];

export function ActivityForm({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState(
    addLeadActivityAction,
    initialState,
  );
  const [type, setType] = useState<LeadActivityType>("note");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state !== initialState && !state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="type" value={type} />

      <div className="flex gap-2">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setType(option.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              type === option.value
                ? "bg-brand-500 text-white"
                : "bg-brand-50 text-ink-soft hover:bg-brand-100",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {type === "contact" && (
        <Field label="Canal" htmlFor="channel">
          <Select id="channel" name="channel" defaultValue="whatsapp">
            {CONTACT_CHANNEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field
        label={type === "note" ? "Nota de seguimiento" : "¿Qué se habló?"}
        htmlFor="content"
      >
        <Textarea
          id="content"
          name="content"
          required
          placeholder={
            type === "note"
              ? "Ej: quiere agendar demo para el fin de semana"
              : "Ej: confirmó interés, quedó de revisar horarios"
          }
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
        {pending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
