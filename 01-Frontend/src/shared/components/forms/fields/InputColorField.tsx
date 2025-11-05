import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FieldProps } from '../components/FormContent';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { HelpTooltip } from '../components/HelpTooltip';

const InputColorField = ({ 
    field, 
    register, 
    errors, 
    dirtyFields,
    setValue,
    watch
}: FieldProps) => {
    const [color, setColor] = useState('#000000');
    const error = errors[field.name];
    const currentValue = watch(field.name);
    const isValid = dirtyFields[field.name] && !error;

    useEffect(() => {
        if (currentValue && currentValue !== color) {
            setColor(currentValue);
        }
    }, [currentValue, color]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.toUpperCase();
        if (/^#([0-9A-Fa-f]{6})$/.test(newValue)) {
            setColor(newValue);
            setValue(field.name, newValue);
        }
    };

    return (
        <div className="space-y-2">
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
            <div className="flex items-center space-x-2">
                <input 
                    id={field.name}
                    className={cn(
                        "flex h-10 w-full rounded-md bg-background px-3 py-2 text-sm",
                        "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        // Usar border-2 para estados de validación para mejor visibilidad
                        error ? "border-2 border-destructive focus-visible:ring-destructive" :
                        isValid ? "border-2 border-green-500 focus-visible:ring-green-500" :
                        "border border-input"
                    )}
                    type="text" 
                    placeholder={field.placeholder || "#000000"} 
                    maxLength={7} 
                    autoComplete="off"
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={
                        error ? `${field.name}-error` : 
                        field.helpText ? `${field.name}-help` : undefined
                    }
                    {...register(field.name, {
                        ...field.validation,
                        onChange: handleTextChange
                    })}
                />
                <div className="relative flex items-center justify-center">
                    <input 
                        className="h-10 w-10 cursor-pointer rounded-md border border-input overflow-hidden"
                        type="color" 
                        value={color}
                        onChange={(e) => {
                            const newColor = e.target.value.toUpperCase();
                            setValue(field.name, newColor);
                            setColor(newColor);
                        }}
                        aria-label="Color picker"
                    />
                </div>
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

export default InputColorField;
