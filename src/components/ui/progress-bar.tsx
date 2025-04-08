
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const progressVariants = cva(
  "h-2 w-full overflow-hidden rounded-full bg-secondary relative",
  {
    variants: {
      variant: {
        default: "",
        success: "bg-green-100",
        warning: "bg-yellow-100",
        danger: "bg-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        danger: "bg-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  showValue?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, variant, max = 100, showValue = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    // Determine variant based on progress if not explicitly set
    const determinedVariant = variant || (
      percentage === 100 ? "success" : 
      percentage >= 50 ? "warning" : 
      "default"
    );
    
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div className={cn(progressVariants({ variant: determinedVariant }))}>
          <div
            className={cn(indicatorVariants({ variant: determinedVariant }))}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-white">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
