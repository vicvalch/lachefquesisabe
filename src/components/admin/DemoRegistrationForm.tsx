"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  registerLeadAction,
  type RegisterLeadState,
} from "@/lib/actions/demos";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { LeadRow } from "@/types/database";

const initialState: RegisterLeadState = {};

export function DemoRegistrationForm({
  demoEventId,
  availableLeads,
}: {
  demoEventId: string;
  availableLeads: LeadRow[];
}) {
  const [state, formAction, pending] = useActionState(
    registerLeadAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state !== initialState && !state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  if (availableLeads.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Todos los leads ya están inscritos en esta demo.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="demoEventId" value={demoEventId} />

      <Field label="Lead" htmlFor="lead_id">
        <Select id="lead_id" name="lead_id" required defaultValue="">
          <option value="" disabled>
            Selecciona un lead
          </option>
          {availableLeads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.name} · {lead.email}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Notas (opcional)" htmlFor="notes">
        <Input id="notes" name="notes" placeholder="Ej: viene con acompañante" />
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
        {pending ? "Agregando..." : "Agregar a la demo"}
      </Button>
    </form>
  );
}
