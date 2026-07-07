import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const inputBaseClasses =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-ink placeholder:text-ink-soft/60 " +
  "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 " +
  "aria-[invalid=true]:border-brand-600 aria-[invalid=true]:ring-brand-600/20";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn(inputBaseClasses, className)} {...props} />;
});

Input.displayName = "Input";
