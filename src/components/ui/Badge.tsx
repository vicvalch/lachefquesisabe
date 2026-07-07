import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types/database";

const statusClasses: Record<LeadStatus, string> = {
  new: "bg-brand-100 text-brand-700",
  contacted: "bg-mustard-400/30 text-brand-700",
  interested: "bg-mustard-400/50 text-brand-700",
  invited_to_demo: "bg-brand-300/30 text-brand-700",
  confirmed_demo: "bg-brand-300/60 text-brand-700",
  attended: "bg-brand-500/15 text-brand-700",
  no_show: "bg-ink/10 text-ink-soft",
  post_demo_follow_up: "bg-olive-500/15 text-olive-600",
  purchased: "bg-olive-500/25 text-olive-600",
  lost: "bg-ink/15 text-ink-soft",
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
