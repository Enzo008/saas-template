/**
 * Campo de checkbox para formularios con integración completa de react-hook-form
 * Sigue los patrones del sistema y utiliza el componente Checkbox de shadcn/ui
 */
import { useController } from 'react-hook-form';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/lib/utils';
import type { FieldProps } from '../components/FormContent';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { HelpTooltip } from '../components/HelpTooltip';

function InputCheckboxField({ 
  field, 
  control, 
  errors,
  dirtyFields
}: FieldProps) {
  const {
    field: { value, onChange, ...fieldProps },
    fieldState: { error: fieldError }
  } = useController({
    name: field.name,
    control,
    defaultValue: field.defaultValue ?? false
  });

  const error = errors[field.name];
  const finalError = (error as any)?.message || fieldError?.message;
  const isValid = dirtyFields[field.name] && !error;
  const checkboxId = `checkbox-${field.name}`;

  return (
    <div className="space-y-2">
      {/* Agregar padding top para alinear con otros campos que tienen label arriba */}
      <div className="flex items-center gap-1.5 pt-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={checkboxId}
            checked={!!value}
            onCheckedChange={onChange}
            disabled={field.disabled}
            className={cn(
              finalError ? "border-destructive focus-visible:ring-destructive" :
              isValid ? "border-green-500 focus-visible:ring-green-500" : ""
            )}
            aria-invalid={finalError ? "true" : "false"}
            aria-describedby={
              finalError ? `${field.name}-error` : undefined
            }
            {...fieldProps}
          />
          {field.label && (
            <Label 
              htmlFor={checkboxId}
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors cursor-pointer",
                field.required && "after:content-['*'] after:ml-0.5 after:text-destructive",
                finalError && "text-destructive"
              )}
            >
              {field.label}
            </Label>
          )}
        </div>
        {field.helpText && <HelpTooltip content={field.helpText} fieldName={field.label || field.name} />}
        
        {/* Indicador visual de estado */}
        {(finalError || isValid) && (
          <div className="flex-shrink-0 ml-1">
            {finalError ? (
              <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
            ) : isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
            ) : null}
          </div>
        )}
      </div>
      
      {/* Mensaje de error */}
      {finalError && (
        <p 
          id={`${field.name}-error`}
          className="text-sm font-medium text-destructive ml-6"
          role="alert"
          aria-live="polite"
        >
          {finalError}
        </p>
      )}
    </div>
  );
}

export default InputCheckboxField;
