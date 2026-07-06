import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-600",
  secondary:
    "bg-olive-500 text-white hover:bg-olive-600 focus-visible:outline-olive-600",
  ghost:
    "bg-transparent text-ink hover:bg-brand-50 focus-visible:outline-brand-500",
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
