"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import {
  removeRegistrationAction,
  updateAttendanceAction,
  type RemoveRegistrationState,
  type UpdateAttendanceState,
} from "@/lib/actions/demos";
import { Select } from "@/components/ui/Select";
import { DemoTemplateActions } from "@/components/admin/DemoTemplateActions";
import { ATTENDANCE_STATUS_OPTIONS } from "@/lib/validations/demo-registration";
import type { DemoEventRow, MessageTemplateRow } from "@/types/database";
import type { DemoRegistrationWithLead } from "@/lib/demos/queries";

const attendanceInitialState: UpdateAttendanceState = {};
const removeInitialState: RemoveRegistrationState = {};

function DemoRosterRow({
  demo,
  registration,
  templates,
}: {
  demo: DemoEventRow;
  registration: DemoRegistrationWithLead;
  templates: MessageTemplateRow[];
}) {
  const [attendanceState, attendanceAction] = useActionState(
    updateAttendanceAction,
    attendanceInitialState,
  );
  const [removeState, removeAction] = useActionState(
    removeRegistrationAction,
    removeInitialState,
  );
  const attendanceFormRef = useRef<HTMLFormElement>(null);

  return (
    <tr className="hover:bg-cream-dark/30">
      <td className="px-4 py-3 font-medium text-ink align-top">
        <Link
          href={`/admin/leads/${registration.lead.id}`}
          className="hover:text-brand-700 hover:underline"
        >
          {registration.lead.name}
        </Link>
        <div className="text-xs text-ink-soft">
          {registration.lead.email ?? registration.lead.phone ?? "Sin contacto"}
        </div>
      </td>
      <td className="px-4 py-3 align-top">
        <form
          ref={attendanceFormRef}
          action={attendanceAction}
          className="flex flex-col gap-1"
        >
          <input type="hidden" name="demoEventId" value={demo.id} />
          <input type="hidden" name="registrationId" value={registration.id} />
          <input type="hidden" name="leadId" value={registration.lead.id} />
          <input type="hidden" name="notes" value={registration.notes ?? ""} />
          <Select
            name="attendance_status"
            defaultValue={registration.attendance_status}
            onChange={() => attendanceFormRef.current?.requestSubmit()}
          >
            {ATTENDANCE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {attendanceState.error && (
            <p className="text-xs font-medium text-brand-700" role="alert">
              {attendanceState.error}
            </p>
          )}
        </form>
      </td>
      <td className="px-4 py-3 text-ink-soft align-top">
        {registration.lead.phone ?? "Sin teléfono"}
      </td>
      <td className="px-4 py-3 align-top">
        <DemoTemplateActions
          lead={registration.lead}
          demo={demo}
          attendanceStatus={registration.attendance_status}
          templates={templates}
        />
      </td>
      <td className="px-4 py-3 align-top">
        <form action={removeAction}>
          <input type="hidden" name="demoEventId" value={demo.id} />
          <input
            type="hidden"
            name="registrationId"
            value={registration.id}
          />
          <button
            type="submit"
            className="text-xs font-semibold text-ink-soft hover:text-brand-700 hover:underline"
          >
            Quitar
          </button>
        </form>
        {removeState.error && (
          <p className="mt-1 text-xs font-medium text-brand-700" role="alert">
            {removeState.error}
          </p>
        )}
      </td>
    </tr>
  );
}

export function DemoRosterTable({
  demo,
  registrations,
  templates,
}: {
  demo: DemoEventRow;
  registrations: DemoRegistrationWithLead[];
  templates: MessageTemplateRow[];
}) {
  if (registrations.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        Todavía no hay leads inscritos en esta demo.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Lead</th>
            <th className="px-4 py-3">Asistencia</th>
            <th className="px-4 py-3">Teléfono</th>
            <th className="px-4 py-3">Plantillas WhatsApp</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {registrations.map((registration) => (
            <DemoRosterRow
              key={registration.id}
              demo={demo}
              registration={registration}
              templates={templates}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
