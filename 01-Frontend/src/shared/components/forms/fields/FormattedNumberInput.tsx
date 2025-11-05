import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { formatter, formatterBudget } from '@/lib/utils';
import { Input } from '@/shared/components/ui/input';

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: string | number;
    onChange: (value: string) => void;
    useDecimal?: boolean;
    'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
}

const FormattedNumberInput = forwardRef<HTMLInputElement, FormattedNumberInputProps>(({
    value,
    onChange,
    onBlur,
    className,
    useDecimal = false,
    'aria-invalid': ariaInvalid,
    ...rest
}, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    
    // Formatear el valor para mostrar
    const formatValue = (value: string): string => {
        if (!value) return '';
        
        // Eliminar caracteres no numéricos excepto punto decimal
        const cleanValue = value.replace(/[^0-9.]/g, '');
        
        // Verificar si es un número válido
        const numberValue = parseFloat(cleanValue);
        if (isNaN(numberValue)) return '';
        
        // Formatear según el tipo (entero o decimal)
        if (useDecimal) {
            return formatterBudget.format(numberValue);
        } else {
            return formatter.format(numberValue);
        }
    };
    
    // Limpiar el valor para edición (sin formato)
    const getCleanValue = (value: string): string => {
        if (!value) return '';
        
        // Eliminar caracteres no numéricos excepto punto decimal
        let cleanValue = value.replace(/[^0-9.]/g, '');
        
        // Si estamos en modo decimal, asegurarse de que solo haya 2 decimales como máximo
        if (useDecimal && cleanValue.includes('.')) {
            const parts = cleanValue.split('.');
            if (parts[1] && parts[1].length > 2) {
                cleanValue = `${parts[0]}.${parts[1].substring(0, 2)}`;
            }
        } else if (!useDecimal) {
            // En modo entero, eliminar cualquier parte decimal
            cleanValue = cleanValue?.split('.')[0] || '';
        }
        
        return cleanValue;
    };
    
    // Estado para el valor mostrado (formateado)
    const [displayValue, setDisplayValue] = useState<string>(
        value ? formatValue(value.toString()) : ''
    );
    
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // Actualizar el valor mostrado cuando cambia el valor externo
    useEffect(() => {
        if (isFocused) {
            setDisplayValue(value ? getCleanValue(value.toString()) : '');
        } else {
            setDisplayValue(value ? formatValue(value.toString()) : '');
        }
    }, [value, useDecimal, isFocused]);



    // Manejar cambios en el input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Permitir campo vacío
        if (!inputValue) {
            setDisplayValue('');
            onChange('');
            return;
        }
        
        // Procesar el valor según las reglas de formato
        const cleanValue = getCleanValue(inputValue);
        
        // Verificar si es un número válido
        const numberValue = parseFloat(cleanValue);
        if (isNaN(numberValue) && cleanValue !== '0' && cleanValue !== '0.') return;
        
        // Cuando está enfocado, mostrar el valor sin formato
        setDisplayValue(cleanValue);
        
        // Enviar el valor limpio al formulario
        onChange(cleanValue);
    };

    // Manejar el foco para mostrar el valor sin formato
    const handleFocus = () => {
        setIsFocused(true);
        
        // Convertir el valor formateado a valor limpio para edición
        if (value) {
            const cleanValue = getCleanValue(value.toString());
            setDisplayValue(cleanValue);
        }
        
        // Seleccionar todo el texto al enfocar
        if (internalRef.current) {
            internalRef.current.select();
        }
    };

    // Manejar la pérdida de foco para formatear el valor
    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
        setIsFocused(false);
        
        // Formatear el valor al perder el foco
        if (displayValue) {
            setDisplayValue(formatValue(displayValue));
        }
        
        // Llamar al manejador onBlur externo si existe
        if (onBlur) {
            onBlur(e);
        }
    };

    return (
        <Input
            ref={ref || internalRef}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={className}
            aria-invalid={ariaInvalid === 'true' || ariaInvalid === true ? true : false}
            autoComplete="off"
            {...rest}
        />
    );
});

FormattedNumberInput.displayName = 'FormattedNumberInput';

export default FormattedNumberInput;
