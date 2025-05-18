
import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger";
}

export const ProgressBar = React.forwardRef<
  HTMLDivElement,
  ProgressBarProps
>(({ className, value, max = 100, variant = "default", ...props }, ref) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "w-full bg-secondary h-2 rounded-full overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all",
          variantClasses[variant]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";
