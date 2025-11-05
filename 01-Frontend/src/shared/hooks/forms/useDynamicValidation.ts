/**
 * Hook para manejar validaciones dinámicas de campos
 * Las validaciones se actualizan en tiempo real basándose en otros campos
 */

import { useState, useEffect } from 'react';
import { UseFormWatch } from 'react-hook-form';
import { Field } from '@/shared/components/forms/components/FormContent';

interface ValidationRules {
  required?: string | boolean;
  pattern?: {
    value: RegExp;
    message: string;
  };
  minLength?: {
    value: number;
    message: string;
  };
  maxLength?: {
    value: number;
    message: string;
  };
  min?: {
    value: number;
    message: string;
  };
  max?: {
    value: number;
    message: string;
  };
}

interface UseDynamicValidationConfig {
  field: Field;
  watch: UseFormWatch<any>;
}

/**
 * Hook que retorna las reglas de validación dinámicas para un campo
 * Las reglas se actualizan automáticamente cuando cambian los valores observados
 */
export const useDynamicValidation = ({ field, watch }: UseDynamicValidationConfig) => {
  // Construir validaciones por defecto del campo
  const buildDefaultValidation = (): ValidationRules => {
    // Si el campo ya tiene validaciones construidas, usarlas
    if (field.validation) {
      return field.validation as ValidationRules;
    }

    // Si no, construir validaciones básicas
    const label = Array.isArray(field.label) ? field.label[0] : field.label || field.name;
    const rules: ValidationRules = {};

    if (field.required) {
      rules.required = `${label} es obligatorio`;
    }

    return rules;
  };

  // Estado de validaciones (inicia con las por defecto)
  const [validationRules, setValidationRules] = useState<ValidationRules>(buildDefaultValidation());

  // Si no hay reglas condicionales, retornar validaciones por defecto
  if (!field.conditionalRules || field.conditionalRules.length === 0) {
    return validationRules;
  }

  // Observar solo los campos específicos que afectan las validaciones
  const watchFields = field.conditionalRules.map(rule => rule.watchField);
  const watchedValues = watch(watchFields);

  // Evaluar reglas condicionales cuando cambien los valores observados
  useEffect(() => {
    const formValues = watch();
    const label = Array.isArray(field.label) ? field.label[0] : field.label || field.name;

    // Evaluar reglas condicionales
    let hasMatchingRule = false;

    for (const rule of field.conditionalRules!) {
      const watchValue = formValues[rule.watchField];
      
      // Evaluar condición
      let conditionMet = false;
      switch (rule.condition.operator) {
        case 'equals':
          conditionMet = watchValue === rule.condition.value;
          break;
        case 'in':
          conditionMet = Array.isArray(rule.condition.value) && rule.condition.value.includes(watchValue);
          break;
        // Agregar más operadores según necesidad
      }

      // Si la condición se cumple y hay validaciones, aplicarlas
      if (conditionMet && rule.actions?.setValidation) {
        hasMatchingRule = true;
        const newRules: ValidationRules = {};

        // Required (puede venir de actions.require o del campo original)
        if (rule.actions.require !== undefined) {
          if (rule.actions.require) {
            newRules.required = `${label} es obligatorio`;
          }
        } else if (field.required) {
          newRules.required = `${label} es obligatorio`;
        }

        // Pattern
        if (rule.actions.setValidation.pattern) {
          const patternMsg = Array.isArray(rule.actions.setValidation.patternMessage)
            ? rule.actions.setValidation.patternMessage[0]
            : rule.actions.setValidation.patternMessage;
          
          newRules.pattern = {
            value: rule.actions.setValidation.pattern,
            message: patternMsg || `${label} no tiene un formato válido`
          };
        }

        // MinLength
        if (rule.actions.setValidation.minLength) {
          newRules.minLength = {
            value: rule.actions.setValidation.minLength,
            message: `${label} debe tener al menos ${rule.actions.setValidation.minLength} caracteres`
          };
        }

        // MaxLength
        if (rule.actions.setValidation.maxLength) {
          newRules.maxLength = {
            value: rule.actions.setValidation.maxLength,
            message: `${label} no puede exceder ${rule.actions.setValidation.maxLength} caracteres`
          };
        }

        // Min
        if (rule.actions.setValidation.min !== undefined) {
          newRules.min = {
            value: rule.actions.setValidation.min,
            message: `${label} debe ser mayor o igual a ${rule.actions.setValidation.min}`
          };
        }

        // Max
        if (rule.actions.setValidation.max !== undefined) {
          newRules.max = {
            value: rule.actions.setValidation.max,
            message: `${label} debe ser menor o igual a ${rule.actions.setValidation.max}`
          };
        }

        setValidationRules(newRules);
        break; // Usar la primera regla que coincida
      }
    }

    // Si ninguna regla coincidió, usar validaciones por defecto
    if (!hasMatchingRule) {
      setValidationRules(buildDefaultValidation());
    }
  }, [JSON.stringify(watchedValues)]); // Solo cuando cambien los valores observados

  return validationRules;
};
