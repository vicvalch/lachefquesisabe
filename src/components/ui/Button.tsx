import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "whatsapp";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 focus-visible:outline-brand-700",
  secondary:
    "bg-olive-500 text-emerald-900 hover:bg-olive-600 focus-visible:outline-olive-600",
  ghost:
    "bg-transparent text-ink hover:bg-brand-50 focus-visible:outline-brand-700",
  outline:
    "border-2 border-white/70 bg-transparent text-white hover:bg-white/10 focus-visible:outline-white",
  whatsapp:
    "bg-[#128C4A] text-white hover:bg-[#0E7A40] focus-visible:outline-[#128C4A]",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
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
