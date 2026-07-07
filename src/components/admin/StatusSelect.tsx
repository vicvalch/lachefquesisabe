"use client";

import { useActionState, useRef } from "react";
import {
  updateLeadStatusAction,
  type UpdateLeadStatusState,
} from "@/lib/actions/leads";
import { Select } from "@/components/ui/Select";
import { LEAD_STATUS_LABELS } from "@/lib/validations/lead";
import type { LeadStatus } from "@/types/database";

const STATUS_ORDER: LeadStatus[] = [
  "nuevo",
  "contactado",
  "convertido",
  "descartado",
];

const initialState: UpdateLeadStatusState = {};

export function StatusSelect({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const [state, formAction, pending] = useActionState(
    updateLeadStatusAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-1.5">
      <input type="hidden" name="leadId" value={leadId} />
      <label htmlFor="status" className="text-sm font-semibold text-ink">
        Estado comercial
      </label>
      <Select
        id="status"
        name="status"
        defaultValue={status}
        disabled={pending}
        onChange={() => formRef.current?.requestSubmit()}
      >
        {STATUS_ORDER.map((value) => (
          <option key={value} value={value}>
            {LEAD_STATUS_LABELS[value]}
          </option>
        ))}
      </Select>
      {pending && <p className="text-xs text-ink-soft">Guardando...</p>}
      {state.error && (
        <p className="text-xs font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
