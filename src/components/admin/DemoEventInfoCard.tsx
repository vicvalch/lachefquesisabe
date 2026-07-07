import { Card } from "@/components/ui/Card";
import { DemoEventStatusBadge } from "@/components/ui/Badge";
import {
  DEMO_EVENT_STATUS_LABELS,
  DEMO_TYPE_LABELS,
} from "@/lib/validations/demo-event";
import { formatDateTime } from "@/lib/utils";
import type { DemoEventRow } from "@/types/database";
import type { DemoRegistrationCounts } from "@/lib/demos/queries";

export function DemoEventInfoCard({
  demo,
  counts,
}: {
  demo: DemoEventRow;
  counts: DemoRegistrationCounts;
}) {
  const spotsLeft = Math.max(demo.capacity - counts.active, 0);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            {demo.title}
          </h2>
          <p className="text-sm text-ink-soft">
            {formatDateTime(demo.scheduled_at)}
          </p>
        </div>
        <DemoEventStatusBadge
          status={demo.status}
          label={DEMO_EVENT_STATUS_LABELS[demo.status]}
        />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Tipo
          </dt>
          <dd className="text-sm text-ink">{DEMO_TYPE_LABELS[demo.demo_type]}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Ubicación
          </dt>
          <dd className="text-sm text-ink">{demo.location || "Sin definir"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Cupo
          </dt>
          <dd className="text-sm text-ink">
            {counts.active} / {demo.capacity} inscritos · {spotsLeft} lugares
            disponibles
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Asistencia registrada
          </dt>
          <dd className="text-sm text-ink">
            {counts.attended} asistieron · {counts.noShow} no asistieron
          </dd>
        </div>
      </dl>

      {demo.description && (
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Descripción
          </dt>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
            {demo.description}
          </p>
        </div>
      )}
    </Card>
  );
}
