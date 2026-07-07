import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { inputBaseClasses } from "./Input";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(inputBaseClasses, "bg-white", className)}
      {...props}
    />
  );
});

Select.displayName = "Select";
