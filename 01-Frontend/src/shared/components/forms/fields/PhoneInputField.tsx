/**
 * PhoneInputField - Campo de entrada para números telefónicos
 * Integra react-phone-number-input con nuestro sistema de formularios
 */

import { cn } from '@/lib/utils';
import { Controller } from 'react-hook-form';
import { FieldProps } from '../components/FormContent';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { PhoneInput } from '@/shared/components/ui/phone-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { HelpTooltip } from '../components/HelpTooltip';

const PhoneInputField = ({ 
    field, 
    errors, 
    dirtyFields,
    control
}: FieldProps) => {
    const error = errors[field.name];
    const isValid = dirtyFields[field.name] && !error;
    const hasValue = dirtyFields[field.name];

    if (!control) {
        console.error('PhoneInputField requiere control de react-hook-form');
        return null;
    }

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
                <Controller
                    name={field.name}
                    control={control}
                    rules={{
                        ...(field.validation || {}),
                        validate: {
                            validPhone: (value) => {
                                // Si el campo no es requerido y está vacío, es válido
                                if (!field.required && (!value || value === '')) {
                                    return true;
                                }
                                // Si el campo es requerido y está vacío, es inválido
                                if (field.required && (!value || value === '')) {
                                    return 'El número de teléfono es requerido';
                                }
                                // Si hay un valor, validar que sea un número válido
                                if (value && !isValidPhoneNumber(value)) {
                                    return 'Ingrese un número de teléfono válido';
                                }
                                return true;
                            }
                        }
                    }}
                    render={({ field: controllerField }) => (
                        <div className="relative">
                            <PhoneInput
                                id={field.name}
                                value={controllerField.value as string}
                                onChange={(value) => {
                                    controllerField.onChange(value || '');
                                }}
                                onBlur={controllerField.onBlur}
                                className={cn(
                                    error && "border-destructive focus-visible:ring-destructive/20",
                                    isValid && "border-green-500 focus-visible:ring-green-500/20"
                                )}
                                placeholder={field.placeholder || 'Ingrese número telefónico'}
                                defaultCountry="PE" // País por defecto (Perú)
                                disabled={field.disabled || false}
                                aria-invalid={error ? "true" : "false"}
                                aria-describedby={
                                    error ? `${field.name}-error` : 
                                    field.helpText ? `${field.name}-help` : undefined
                                }
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
            </div>

            {/* Mensaje de error */}
            {error && (
                <p 
                    id={`${field.name}-error`}
                    className="text-sm font-medium text-destructive"
                    role="alert"
                    aria-live="polite"
                >
                    {error.message?.toString() || 'Campo inválido'}
                </p>
            )}
        </div>
    );
};

export default PhoneInputField;
