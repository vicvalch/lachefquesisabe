import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  markOnly?: boolean;
}

export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 font-display text-base font-semibold text-white"
      >
        LC
      </span>
      {!markOnly && (
        <span className="font-display text-lg font-semibold leading-tight text-ink">
          La Chef que Sí Sabe
        </span>
      )}
    </span>
  );
}
