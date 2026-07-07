import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

interface EntityNotFoundCardProps {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}

export function EntityNotFoundCard({
  title,
  description,
  backHref,
  backLabel,
}: EntityNotFoundCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-ink/20 bg-white p-12 text-center">
      <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
      <p className="max-w-md text-sm text-ink-soft">{description}</p>
      <Link href={backHref} className={buttonClasses("primary")}>
        {backLabel}
      </Link>
    </div>
  );
}
