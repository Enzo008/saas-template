import { useRef, useEffect } from 'react';
import { FieldProps } from '../components/FormContent';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { HelpTooltip } from '../components/HelpTooltip';

const TextAreaField = ({ 
    field, 
    register, 
    errors, 
    dirtyFields,
    watch
}: FieldProps) => {
    const error = errors[field.name];
    const isValid = dirtyFields[field.name] && !error;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // Configuración de auto-resize
    const minRows = field.minRows || 1;
    const maxRows = field.maxRows || 6;
    const currentValue = watch?.(field.name) || '';

    // Función para ajustar la altura automáticamente
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to calculate scrollHeight correctly
        textarea.style.height = 'auto';
        
        // Calculate line height
        const computedStyle = window.getComputedStyle(textarea);
        const lineHeight = parseInt(computedStyle.lineHeight) || 20;
        const paddingTop = parseInt(computedStyle.paddingTop) || 0;
        const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;
        
        // Calculate min and max heights
        const minHeight = (lineHeight * minRows) + paddingTop + paddingBottom;
        const maxHeight = (lineHeight * maxRows) + paddingTop + paddingBottom;
        
        // Set new height based on content, respecting min/max
        const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${newHeight}px`;
        
        // Enable/disable scrolling based on max height
        textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    };

    // Adjust height when content changes
    useEffect(() => {
        adjustHeight();
    }, [currentValue, minRows, maxRows]);

    // Register field and get props
    const registerProps = register(field.name, field.validation);

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
            </div>
            <div className="relative">
            <textarea
                {...registerProps}
                ref={(e) => {
                    registerProps.ref(e);
                    if (textareaRef) {
                        (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = e;
                    }
                }}
                id={field.name}
                className={cn(
                    "flex w-full rounded-md bg-background px-3 py-2 text-sm",
                    "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200",
                    // Usar border-2 para estados de validación para mejor visibilidad
                    error ? "border-2 border-destructive focus-visible:ring-destructive" :
                    isValid ? "border-2 border-green-500 focus-visible:ring-green-500" :
                    "border border-input"
                )}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                rows={minRows}
                style={{
                    minHeight: `${(20 * minRows) + 16}px`, // Fallback min-height
                    overflowY: 'hidden' // Initially hidden, will be set by adjustHeight
                }}
                onChange={(e) => {
                    registerProps.onChange(e);
                    setTimeout(adjustHeight, 0);
                }}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={
                    error ? `${field.name}-error` : 
                    field.helpText ? `${field.name}-help` : undefined
                }
            />
            
            {/* Indicador visual de estado - Posicionado en esquina superior derecha */}
            {(error || isValid) && (
                <div className="absolute top-2 right-2 pointer-events-none z-10">
                    {error ? (
                        <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                    ) : isValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                    ) : null}
                </div>
            )}
            </div>
            
            {field.maxLength && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span></span>
                    <span>{currentValue.length}/{field.maxLength}</span>
                </div>
            )}
            
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

export default TextAreaField;