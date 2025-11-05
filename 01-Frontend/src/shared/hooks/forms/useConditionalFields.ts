/**
 * Hook para campos condicionales: visibilidad, validación y valores dinámicos
 */

import { useEffect, useMemo } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { 
    Field, 
    ConditionalRule, 
    ConditionalOperator 
} from '@/shared/components/forms/components/FormContent';

// Re-exportar tipos para uso externo
export type { ConditionalRule, ConditionalOperator };

export interface FieldState {
    isVisible: boolean;
    isEnabled: boolean;
    isRequired: boolean;
    computedValue?: any;
    validation?: {
        pattern?: RegExp;
        patternMessage?: string | string[];
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    };
}

interface UseConditionalFieldsConfig {
    fields: Field[];
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
}

// Evaluar condición según operador
const evaluateCondition = (
    operator: ConditionalOperator,
    watchValue: any,
    conditionValue: any,
    customFn?: (watchValue: any, formValues: any) => boolean,
    formValues?: any
): boolean => {
    switch (operator) {
        case 'equals':
            return watchValue === conditionValue;
        
        case 'notEquals':
            return watchValue !== conditionValue;
        
        case 'in':
            return Array.isArray(conditionValue) && conditionValue.includes(watchValue);
        
        case 'notIn':
            return Array.isArray(conditionValue) && !conditionValue.includes(watchValue);
        
        case 'greaterThan':
            return typeof watchValue === 'number' && typeof conditionValue === 'number' 
                && watchValue > conditionValue;
        
        case 'lessThan':
            return typeof watchValue === 'number' && typeof conditionValue === 'number' 
                && watchValue < conditionValue;
        
        case 'contains':
            return typeof watchValue === 'string' && typeof conditionValue === 'string' 
                && watchValue.includes(conditionValue);
        
        case 'custom':
            return customFn ? customFn(watchValue, formValues) : false;
        
        default:
            console.warn(`Operador condicional no soportado: ${operator}`);
            return false;
    }
};

// Evaluar todas las reglas de un campo
const evaluateFieldRules = (field: Field, formValues: any): FieldState => {
    // Estado por defecto (basado en propiedades estáticas del campo)
    const defaultState: FieldState = {
        isVisible: !field.hidden,
        isEnabled: !field.disabled,
        isRequired: field.required || false,
    };

    // Si no hay reglas condicionales, retornar estado por defecto
    if (!field.conditionalRules || field.conditionalRules.length === 0) {
        return defaultState;
    }

    // Procesar cada regla condicional
    let computedState = { ...defaultState };

    for (const rule of field.conditionalRules) {
        const watchValue = formValues[rule.watchField];
        
        // Evaluar la condición
        const conditionMet = evaluateCondition(
            rule.condition.operator,
            watchValue,
            rule.condition.value,
            rule.condition.customFn,
            formValues
        );

        // Aplicar acciones si la condición se cumple
        if (conditionMet && rule.actions) {
            if (rule.actions.show !== undefined) {
                computedState.isVisible = rule.actions.show;
            }
            if (rule.actions.enable !== undefined) {
                computedState.isEnabled = rule.actions.enable;
            }
            if (rule.actions.require !== undefined) {
                computedState.isRequired = rule.actions.require;
            }
            if (rule.actions.setValue !== undefined) {
                computedState.computedValue = rule.actions.setValue;
            }
            if (rule.actions.setValidation !== undefined) {
                computedState.validation = rule.actions.setValidation;
            }
        }
    }

    return computedState;
};

export const useConditionalFields = ({ fields, watch, setValue }: UseConditionalFieldsConfig) => {
    
    // Observar todos los valores del formulario
    const formValues = watch();

    // Calcular estados de todos los campos con reglas condicionales
    const fieldStates = useMemo(() => {
        const states: Record<string, FieldState> = {};
        
        fields.forEach(field => {
            if (field.conditionalRules && field.conditionalRules.length > 0) {
                const state = evaluateFieldRules(field, formValues);
                states[field.name] = state;
            }
        });
        
        return states;
    }, [fields, formValues]);

    // Aplicar acciones automáticas (setValue, clearValue)
    useEffect(() => {
        fields.forEach(field => {
            if (!field.conditionalRules) return;

            const state = fieldStates[field.name];
            if (!state) return;

            // Aplicar setValue si está definido
            if (state.computedValue !== undefined) {
                const currentValue = formValues[field.name];
                if (currentValue !== state.computedValue) {
                    setValue(field.name, state.computedValue);
                }
            }

            // Limpiar valor si el campo se oculta y clearValue está activo
            field.conditionalRules.forEach(rule => {
                if (!state.isVisible && rule.actions?.clearValue) {
                    const currentValue = formValues[field.name];
                    if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
                        setValue(field.name, '');
                    }
                }
            });
        });
    }, [fieldStates, fields, formValues, setValue]);

    const getFieldState = (fieldName: string): FieldState => {
        const field = fields.find(f => f.name === fieldName);
        
        if (!field) {
            console.warn(`Campo no encontrado: ${fieldName}`);
            return {
                isVisible: true,
                isEnabled: true,
                isRequired: false,
            };
        }

        // Si tiene reglas, retornar estado calculado
        if (fieldStates[fieldName]) {
            return fieldStates[fieldName];
        }

        // Si no tiene reglas, retornar estado por defecto
        return {
            isVisible: !field.hidden,
            isEnabled: !field.disabled,
            isRequired: field.required || false,
        };
    };

    const getVisibleFields = (): Field[] => {
        return fields.filter(field => {
            const state = getFieldState(field.name);
            return state.isVisible;
        });
    };

    const getRequiredFields = (): string[] => {
        return fields
            .filter(field => {
                const state = getFieldState(field.name);
                return state.isRequired;
            })
            .map(field => field.name);
    };

    return {
        fieldStates,
        getFieldState,
        getVisibleFields,
        getRequiredFields,
    };
};
