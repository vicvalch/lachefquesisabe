import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  markOnly?: boolean;
}

export function Logo({ className, markOnly = false }: LogoProps) {
  if (markOnly) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 font-display text-base font-semibold text-white"
        >
          LC
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/logo.png"
        alt="La Chef que Sí Sabe"
        loading="eager"
        fetchPriority="high"
        className="h-12 w-12 shrink-0 rounded-xl object-contain sm:h-14 sm:w-14"
      />
    </span>
  );
}
