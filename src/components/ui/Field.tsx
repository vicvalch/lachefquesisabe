import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  ...props
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className={cn("text-sm font-semibold text-ink", className)}
        {...props}
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-brand-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
