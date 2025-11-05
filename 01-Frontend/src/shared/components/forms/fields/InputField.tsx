import { cn } from '@/lib/utils';
import { Input } from '@/shared/components/ui/input';
import FormattedNumberInput from './FormattedNumberInput';
import { Controller } from 'react-hook-form';
import { FieldProps } from '../components/FormContent';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useDynamicValidation } from '@/shared/hooks/forms/useDynamicValidation';
import { HelpTooltip } from '../components/HelpTooltip';

const InputField = ({ 
    field, 
    register, 
    errors, 
    dirtyFields,
    control,
    watch
}: FieldProps) => {
    const error = errors[field.name];
    const isValid = dirtyFields[field.name] && !error;
    const hasValue = dirtyFields[field.name];
    
    // Obtener validaciones dinámicas
    const validationRules = useDynamicValidation({ field, watch });

    // Determinar el formato decimal para números
    const useDecimalFormat = field.useDecimal || field.numberFormat === 'decimal';

    return (
        <div className="space-y-2">
            {/* Label mejorado con accesibilidad y tooltip de ayuda */}
            <div className="flex items-center gap-1.5">
                <label 
                    htmlFor={field.name} 
                    className={cn(
                        "block text-sm font-medium transition-colors",
                        error ? "text-destructive" : "text-foreground",
                        field.required && "after:content-['*'] after:ml-1 after:text-destructive"
                    )}
                >
                    {field.label || field.name}
                </label>
                {field.helpText && <HelpTooltip content={field.helpText} fieldName={field.label || field.name} />}
            </div>
            
            {/* Campo de entrada con indicadores visuales */}
            <div className="relative">
                {field.type === 'number' && control ? (
                    <Controller
                        name={field.name}
                        control={control}
                        {...(field.validation && { rules: field.validation })}
                        render={({ field: controllerField }) => (
                            <div className="relative">
                                <FormattedNumberInput
                                    id={field.name}
                                    value={controllerField.value || ''}
                                    onChange={(value) => {
                                        const numericValue = value === '' ? undefined : Number(value);
                                        controllerField.onChange(numericValue);
                                    }}
                                    onBlur={controllerField.onBlur}
                                    className={cn(
                                        "pr-10", // Espacio para el icono
                                        error && "border-destructive focus-visible:ring-destructive/20",
                                        isValid && "border-green-500 focus-visible:ring-green-500/20"
                                    )}
                                    placeholder={field.placeholder || ''}
                                    required={field.required || false}
                                    min={field.validation?.['min']?.value}
                                    max={field.validation?.['max']?.value}
                                    useDecimal={useDecimalFormat}
                                    aria-invalid={error ? "true" : "false"}
                                    aria-describedby={
                                        error ? `${field.name}-error` : 
                                        field.helpText ? `${field.name}-help` : undefined
                                    }
                                    disabled={field.disabled || false}
                                />
                                
                                {/* Indicador visual de estado */}
                                {hasValue && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        {error ? (
                                            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                                        ) : isValid ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                ) : field.conditionalRules && field.conditionalRules.some(r => r.actions?.setValidation) ? (
                    // Usar Controller para campos con validaciones dinámicas
                    <Controller
                        name={field.name}
                        control={control}
                        rules={validationRules}
                        render={({ field: controllerField }) => (
                            <div className="relative">
                                <Input
                                    type={field.type}
                                    id={field.name}
                                    className={cn(
                                        "pr-10",
                                        error && "border-destructive focus-visible:ring-destructive/20",
                                        isValid && "border-green-500 focus-visible:ring-green-500/20"
                                    )}
                                    placeholder={field.placeholder || ''}
                                    maxLength={validationRules.maxLength?.value || field.maxLength}
                                    autoFocus={field.autoFocus}
                                    disabled={field.disabled}
                                    aria-invalid={error ? "true" : "false"}
                                    aria-describedby={
                                        error ? `${field.name}-error` : 
                                        field.helpText ? `${field.name}-help` : undefined
                                    }
                                    autoComplete="off"
                                    {...controllerField}
                                />
                                
                                {hasValue && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        {error ? (
                                            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                                        ) : isValid ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                ) : (
                    <div className="relative">
                        <Input
                            type={field.type}
                            id={field.name}
                            className={cn(
                                "pr-10", // Espacio para el icono
                                error && "border-destructive focus-visible:ring-destructive/20",
                                isValid && "border-green-500 focus-visible:ring-green-500/20"
                            )}
                            placeholder={field.placeholder || ''}
                            maxLength={validationRules.maxLength?.value || field.maxLength}
                            autoFocus={field.autoFocus}
                            disabled={field.disabled}
                            aria-invalid={error ? "true" : "false"}
                            aria-describedby={
                                error ? `${field.name}-error` : 
                                field.helpText ? `${field.name}-help` : undefined
                            }
                            autoComplete="off"
                            {...register(field.name, validationRules)}
                        />
                        
                        {/* Indicador visual de estado */}
                        {hasValue && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                {error ? (
                                    <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                                ) : isValid ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                                ) : null}
                            </div>
                        )}
                    </div>
                )}
            </div>

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

export default InputField;