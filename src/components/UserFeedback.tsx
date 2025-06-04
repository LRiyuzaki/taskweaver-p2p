
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced toast helpers
export const useEnhancedToast = () => {
  const { toast } = useToast();

  const showSuccess = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 3000,
      className: "border-green-500 bg-green-50 text-green-900",
    });
  };

  const showError = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 5000,
      variant: "destructive",
    });
  };

  const showWarning = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 4000,
      className: "border-yellow-500 bg-yellow-50 text-yellow-900",
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 3000,
      className: "border-blue-500 bg-blue-50 text-blue-900",
    });
  };

  return { showSuccess, showError, showWarning, showInfo };
};

// Form validation feedback
interface FormFieldErrorProps {
  error?: string;
  touched?: boolean;
  className?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ 
  error, 
  touched, 
  className 
}) => {
  if (!error || !touched) return null;

  return (
    <div className={cn("text-sm text-destructive mt-1 flex items-center", className)}>
      <AlertCircle className="h-3 w-3 mr-1" />
      {error}
    </div>
  );
};

// Inline validation feedback
interface ValidationFeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  show?: boolean;
  className?: string;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  type,
  message,
  show = true,
  className
}) => {
  if (!show) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const styles = {
    success: "text-green-600 bg-green-50 border-green-200",
    error: "text-red-600 bg-red-50 border-red-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
    info: "text-blue-600 bg-blue-50 border-blue-200"
  };

  const Icon = icons[type];

  return (
    <Alert className={cn(styles[type], "animate-fade-in", className)}>
      <Icon className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

// Progress feedback for multi-step processes
interface ProgressFeedbackProps {
  steps: { label: string; completed: boolean }[];
  currentStep: number;
  className?: string;
}

export const ProgressFeedback: React.FC<ProgressFeedbackProps> = ({
  steps,
  currentStep,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((step, index) => {
        const isCompleted = step.completed;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div
            key={index}
            className={cn(
              "flex items-center space-x-3 p-2 rounded-md transition-colors",
              {
                "bg-green-50 text-green-700": isCompleted,
                "bg-blue-50 text-blue-700": isCurrent,
                "bg-gray-50 text-gray-500": isPending
              }
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                {
                  "bg-green-500 text-white": isCompleted,
                  "bg-blue-500 text-white": isCurrent,
                  "bg-gray-300 text-gray-600": isPending
                }
              )}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className="font-medium">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// Dismissible notification
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  onDismiss?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  description,
  onDismiss,
  autoClose = false,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onDismiss]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const styles = {
    success: "border-green-500 bg-green-50 text-green-900",
    error: "border-red-500 bg-red-50 text-red-900",
    warning: "border-yellow-500 bg-yellow-50 text-yellow-900",
    info: "border-blue-500 bg-blue-50 text-blue-900"
  };

  const Icon = icons[type];

  return (
    <Alert className={cn(styles[type], "animate-fade-in relative")}>
      <Icon className="h-4 w-4" />
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {description && (
          <AlertDescription className="mt-1">{description}</AlertDescription>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
};

// Bulk operation feedback
interface BulkOperationFeedbackProps {
  operation: string;
  total: number;
  completed: number;
  errors: number;
  isComplete: boolean;
}

export const BulkOperationFeedback: React.FC<BulkOperationFeedbackProps> = ({
  operation,
  total,
  completed,
  errors,
  isComplete
}) => {
  const successCount = completed - errors;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{operation}</h4>
        <span className="text-sm text-muted-foreground">
          {completed}/{total}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            errors > 0 ? "bg-yellow-500" : "bg-green-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-green-600">
          ✓ {successCount} successful
        </span>
        {errors > 0 && (
          <span className="text-red-600">
            ✗ {errors} failed
          </span>
        )}
      </div>
      
      {isComplete && (
        <ValidationFeedback
          type={errors > 0 ? "warning" : "success"}
          message={
            errors > 0
              ? `${operation} completed with ${errors} errors`
              : `${operation} completed successfully`
          }
        />
      )}
    </div>
  );
};
