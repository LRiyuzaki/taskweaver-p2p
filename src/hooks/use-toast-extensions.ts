
import { toast as baseToast } from "@/hooks/use-toast";
import type { ToastProps } from "@/components/ui/toast";

// Extend the toast function with common patterns
export const toast = {
  // Base toast function for direct calling
  default: (props: ToastProps) => baseToast(props),
  
  // Success toast
  success: (message: string) => {
    return baseToast({
      title: "Success",
      description: message,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300"
    });
  },
  
  // Error toast
  error: (message: string) => {
    return baseToast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  },
  
  // Warning toast
  warning: (message: string) => {
    return baseToast({
      title: "Warning",
      description: message,
      className: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300"
    });
  },
  
  // Info toast
  info: (message: string) => {
    return baseToast({
      title: "Info",
      description: message,
      className: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
    });
  }
};
