import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { DEMO_MODE_LABELS } from "@/lib/validations/demo-event";
import { formatDemoDate, formatDemoTime } from "@/lib/demos/format";
import type { DemoEventRow } from "@/types/database";

function locationLine(demo: DemoEventRow): string | null {
  if (demo.mode === "virtual") {
    return null;
  }
  const place = [demo.location_name, demo.location_address]
    .filter(Boolean)
    .join(", ");
  return place || null;
}

export function DemoCard({ demo }: { demo: DemoEventRow }) {
  const location = locationLine(demo);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border-soft bg-white-soft p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-emerald-900">
          {demo.title}
        </h3>
        <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {DEMO_MODE_LABELS[demo.mode]}
        </span>
      </div>

      <div className="text-sm text-ink-soft">
        <p className="font-semibold text-ink">
          {formatDemoDate(demo.starts_at)} · {formatDemoTime(demo.starts_at)}
        </p>
        {location && <p>{location}</p>}
        {demo.mode === "virtual" && <p>Link al confirmar tu lugar</p>}
      </div>

      {demo.description && (
        <p className="line-clamp-3 text-sm text-ink-soft">{demo.description}</p>
      )}

      <span className="w-fit rounded-full bg-olive-500/20 px-3 py-1 text-xs font-semibold text-olive-600">
        Cupos limitados
      </span>

      <Link
        href={`/demos/${demo.slug}`}
        className={buttonClasses("primary", "mt-2 self-start px-5 py-2.5 text-sm")}
      >
        Reservar mi espacio
      </Link>
    </div>
  );
}
