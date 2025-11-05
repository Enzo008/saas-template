import { FieldProps } from '../components/FormContent';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { Controller } from 'react-hook-form';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { HelpTooltip } from '../components/HelpTooltip';

/**
 * Campo de tipo RadioGroup para seleccionar una opción entre varias
 * Utiliza el componente RadioGroup de shadcn/ui para una mejor experiencia de usuario
 * Integrado con react-hook-form mediante Controller para mantener la consistencia
 */
const RadioGroupField = ({ 
    field, 
    register, // Lo usamos para registrar el campo aunque el control lo haga Controller
    errors, 
    control, // Necesario para Controller
    dirtyFields
}: FieldProps) => {
    const error = errors[field.name];
    const isValid = dirtyFields[field.name] && !error;

    if (!field.options) {
        console.error(`RadioGroup field ${field.name} requires options`);
        return null;
    }

    // Registramos el campo para que react-hook-form lo conozca
    // Esto permite que las validaciones funcionen correctamente
    register(field.name, field.validation);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5">
                <label 
                    className={cn(
                        "block text-sm font-medium transition-colors",
                        error ? "text-destructive" : "text-foreground",
                        field.validation?.['required'] && "after:content-['*'] after:ml-1 after:text-destructive"
                    )}
                >
                    {field.label || field.name}
                </label>
                {field.helpText && <HelpTooltip content={field.helpText} fieldName={field.label || field.name} />}
                
                {/* Indicador visual de estado al lado del label */}
                {(error || isValid) && (
                    <div className="flex-shrink-0 ml-1">
                        {error ? (
                            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                        ) : isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                        ) : null}
                    </div>
                )}
            </div>
            
            <Controller
                name={field.name}
                control={control}
                defaultValue={field.defaultValue ? String(field.defaultValue) : undefined}
                render={({ field: controllerField }) => (
                    <RadioGroup 
                        value={controllerField.value ? String(controllerField.value) : ''}
                        onValueChange={controllerField.onChange}
                        className={cn(
                            "flex flex-col space-y-1",
                            field.orientation === 'horizontal' && "sm:flex-row sm:space-x-4 sm:space-y-0 flex-wrap gap-y-2"
                        )}
                        disabled={field.disabled}
                        // Eliminamos la referencia directa al ref ya que RadioGroup no usa forwardRef
                        onBlur={controllerField.onBlur}
                    >
                        {field.options?.map((option) => (
                            <div key={String(option.value)} className="flex items-center space-x-2">
                                <RadioGroupItem 
                                    value={String(option.value)} 
                                    id={`${field.name}-${option.value}`}
                                    className={cn(
                                        error && "border-destructive",
                                        isValid && "border-green-500"
                                    )}
                                />
                                <Label 
                                    htmlFor={`${field.name}-${option.value}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}
            />
            
            {/* Mensaje de error */}
            {error && (
                <p 
                    id={`${field.name}-error`}
                    className="text-sm font-medium text-destructive"
                    role="alert"
                    aria-live="polite"
                >
                    {error.message as string}
                </p>
            )}
        </div>
    );
};

export default RadioGroupField;
