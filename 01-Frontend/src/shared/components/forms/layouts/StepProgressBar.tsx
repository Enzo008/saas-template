import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Fragment } from 'react/jsx-runtime';

export interface Step {
  id: number;
  title: string;
  description?: string;
  completed?: boolean;
  disabled?: boolean;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  variant?: 'default' | 'compact';
}

export const StepProgressBar = ({ 
  steps, 
  currentStep,
  className,
  variant = 'default'
}: StepProgressBarProps) => {
  const isCompact = variant === 'compact';

  return (
    <div className={cn("w-full", !isCompact && "mb-4", className)}>
      <div className={cn(
        "flex items-center",
        isCompact ? "justify-center space-x-2" : "justify-between"
      )}>
        {steps.map((step, index) => (
          <Fragment key={step.id}>
            <div className={cn(
              "flex items-center",
              !isCompact && "space-x-2"
            )}>
              {/* Step circle - solo visual */}
              <div 
                className={cn(
                  "relative flex items-center justify-center rounded-full border-2 transition-all duration-200",
                  isCompact ? "w-8 h-8" : "w-10 h-10",
                  step.id === currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : step.completed
                    ? "border-green-500 bg-green-500 text-white"
                    : step.disabled
                    ? "border-gray-200 bg-gray-100 text-gray-400"
                    : "border-gray-300 bg-gray-100 text-gray-500",
                  step.disabled && "opacity-50"
                )}
                aria-current={step.id === currentStep ? "step" : undefined}
              >
                {step.completed ? (
                  <CheckCircle className={cn("text-white", isCompact ? "h-3 w-3" : "h-4 w-4")} />
                ) : (
                  <span className={cn("font-medium", isCompact ? "text-xs" : "text-sm")}>
                    {step.id}
                  </span>
                )}
              </div>

              {/* Step info - only in default variant */}
              {!isCompact && (
                <div className="text-left">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      step.id === currentStep
                        ? "text-primary"
                        : step.completed
                        ? "text-green-600"
                        : step.disabled
                        ? "text-gray-400"
                        : "text-gray-500"
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div className={cn(
                "h-px bg-gray-300 transition-colors duration-200",
                isCompact ? "w-8" : "flex-1 mx-4",
                index < currentStep - 1 ? "bg-primary" : "bg-muted-foreground/30"
              )} />
            )}
          </Fragment>
        ))}
      </div>

      {/* Step titles for compact variant */}
      {isCompact && (
        <div className="flex justify-center mt-2">
          <div className="text-center">
            <div className="text-sm font-medium text-primary">
              {steps.find(step => step.id === currentStep)?.title}
            </div>
            {steps.find(step => step.id === currentStep)?.description && (
              <div className="text-xs text-muted-foreground">
                {steps.find(step => step.id === currentStep)?.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
