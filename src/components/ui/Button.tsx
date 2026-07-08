import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "outline-brand"
  | "whatsapp";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-700 text-white shadow-lg shadow-emerald-900/20 hover:bg-brand-800 hover:shadow-xl hover:shadow-emerald-900/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus-visible:outline-brand-700",
  secondary:
    "bg-olive-500 text-emerald-900 shadow-md shadow-olive-600/20 hover:bg-olive-600 hover:shadow-lg hover:shadow-olive-600/25 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-olive-600",
  ghost:
    "bg-transparent text-ink hover:bg-brand-50 hover:-translate-y-0.5 focus-visible:outline-brand-700",
  outline:
    "border-2 border-white/70 bg-white/5 text-white backdrop-blur-sm hover:border-white hover:bg-white/15 hover:-translate-y-0.5 focus-visible:outline-white",
  "outline-brand":
    "border-2 border-emerald-800/20 bg-white-soft text-emerald-900 shadow-sm hover:border-brand-600 hover:bg-brand-50 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-brand-700",
  whatsapp:
    "bg-[#128C4A] text-white shadow-lg shadow-[#128C4A]/25 hover:bg-[#0E7A40] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-[#128C4A]",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold tracking-tight transition-all duration-200 ease-out",
    "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    variantClasses[variant],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses(variant, className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
