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
      percentage >= 70 ? "warning" :
      percentage > 0 ? "default" : 
      "danger"
    );

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ variant: determinedVariant }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            indicatorVariants({ variant: determinedVariant }),
            "transition-transform duration-300 ease-in-out"
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </ProgressPrimitive.Root>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };