import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types/database";

const statusClasses: Record<LeadStatus, string> = {
  nuevo: "bg-brand-100 text-brand-700",
  contactado: "bg-mustard-400/30 text-brand-700",
  convertido: "bg-olive-500/15 text-olive-600",
  descartado: "bg-ink/10 text-ink-soft",
};

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: LeadStatus;
  label: string;
}

export function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        statusClasses[status],
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}
