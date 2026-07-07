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
    <div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">
          {demo.title}
        </h3>
        <span className="shrink-0 rounded-full bg-mustard-400/40 px-3 py-1 text-xs font-semibold text-brand-700">
          Cupos limitados
        </span>
      </div>

      <div className="text-sm text-ink-soft">
        <p>
          {formatDemoDate(demo.starts_at)} · {formatDemoTime(demo.starts_at)}
        </p>
        <p>{DEMO_MODE_LABELS[demo.mode]}</p>
        {location && <p>{location}</p>}
        {demo.mode === "virtual" && <p>Virtual — link al confirmar tu lugar</p>}
      </div>

      {demo.description && (
        <p className="line-clamp-3 text-sm text-ink-soft">{demo.description}</p>
      )}

      <Link
        href={`/demos/${demo.slug}`}
        className={buttonClasses("primary", "mt-2 self-start px-5 py-2.5 text-sm")}
      >
        Ver detalles
      </Link>
    </div>
  );
}
