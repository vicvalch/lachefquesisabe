import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type {
  AttendanceStatus,
  CampaignStatus,
  ContentStatus,
  DemoEventStatus,
  LeadStatus,
} from "@/types/database";

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

const demoEventStatusClasses: Record<DemoEventStatus, string> = {
  draft: "bg-ink/10 text-ink-soft",
  scheduled: "bg-brand-100 text-brand-700",
  full: "bg-mustard-400/50 text-brand-700",
  completed: "bg-olive-500/25 text-olive-600",
  cancelled: "bg-ink/15 text-ink-soft",
};

interface DemoEventStatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: DemoEventStatus;
  label: string;
}

export function DemoEventStatusBadge({
  status,
  label,
  className,
  ...props
}: DemoEventStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        demoEventStatusClasses[status],
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}

const attendanceStatusClasses: Record<AttendanceStatus, string> = {
  registered: "bg-brand-100 text-brand-700",
  confirmed: "bg-brand-300/60 text-brand-700",
  attended: "bg-olive-500/25 text-olive-600",
  no_show: "bg-ink/10 text-ink-soft",
  cancelled: "bg-ink/15 text-ink-soft",
};

interface AttendanceStatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: AttendanceStatus;
  label: string;
}

export function AttendanceStatusBadge({
  status,
  label,
  className,
  ...props
}: AttendanceStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        attendanceStatusClasses[status],
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}

const campaignStatusClasses: Record<CampaignStatus, string> = {
  draft: "bg-ink/10 text-ink-soft",
  ready: "bg-brand-100 text-brand-700",
  tasks_created: "bg-mustard-400/50 text-brand-700",
  completed: "bg-olive-500/25 text-olive-600",
  cancelled: "bg-ink/15 text-ink-soft",
};

interface CampaignStatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: CampaignStatus;
  label: string;
}

export function CampaignStatusBadge({
  status,
  label,
  className,
  ...props
}: CampaignStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        campaignStatusClasses[status],
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}

const contentStatusClasses: Record<ContentStatus, string> = {
  draft: "bg-ink/10 text-ink-soft",
  published: "bg-olive-500/25 text-olive-600",
  archived: "bg-ink/15 text-ink-soft",
};

interface ContentStatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: ContentStatus;
  label: string;
}

export function ContentStatusBadge({
  status,
  label,
  className,
  ...props
}: ContentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        contentStatusClasses[status],
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}
