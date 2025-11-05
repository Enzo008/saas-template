/**
 * Sistema inteligente para construcción de campos de formulario
 * Proporciona una API fluida y type-safe para crear campos con validaciones
 * 
 * CARACTERÍSTICAS:
 * - API fluida para construcción de campos
 * - Validaciones automáticas con React Hook Form
 * - Soporte para traducciones bilingües
 * - Sistema de campos condicionales (show/hide/require basado en otros campos)
 * - Anchos responsive automáticos
 */

import { 
  Field, 
  FieldOption, 
  ConditionalRule,
  ConditionalOperator 
} from '@/shared/components/forms/components/FormContent';
import { useDirectTranslation, DirectTranslation } from '@/shared/utils/directTranslation';

// Re-exportar tipos para uso externo
export type { ConditionalRule, ConditionalOperator };

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

export type FieldWidth = 'full' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4' | '1/6' | '5/6';
export type FieldType = Field['type'];

interface BaseFieldOptions {
  label?: DirectTranslation | string;
  placeholder?: DirectTranslation | string;
  helpText?: DirectTranslation | string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  section?: string;
  width?: FieldWidth;
  autoFocus?: boolean;
  defaultValue?: any;
  conditionalRules?: ConditionalRule[];
}
interface TextFieldOptions extends BaseFieldOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: DirectTranslation | string;
}

interface NumberFieldOptions extends BaseFieldOptions {
  min?: number;
  max?: number;
  useDecimal?: boolean;
  numberFormat?: 'integer' | 'decimal';
}

interface SelectFieldOptions extends BaseFieldOptions {
  options?: FieldOption[];
  endpoint?: string;
  fieldType?: 'simple' | 'composite';
  keyField?: string | string[];
  labelKey?: string;
  isClearable?: boolean;
  isMulti?: boolean;
  loadOptions?: (inputValue: string) => Promise<any[]>;
  // Para claves compuestas (compatibilidad)
  isCompositeKey?: boolean;
  compositeKeys?: string[];
  dependentFields?: Array<{
    sourceField: string;
    targetField: string;
    isComposite?: boolean;
  }>;
}

interface TextAreaOptions extends BaseFieldOptions {
  rows?: number;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
}

interface RadioOptions extends BaseFieldOptions {
  options: FieldOption[];
  orientation?: 'horizontal' | 'vertical';
}

// ============================================================================
// VALIDACIONES SIMPLIFICADAS
// ============================================================================

/**
 * Funciones de validación simples - Solo RHF (React Hook Form)
 * Eliminamos Zod para simplificar y evitar duplicación
 */
export const createValidation = {
  /**
   * Validación de texto requerido
   */
  requiredText: (fieldName: string, options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  } = {}) => {
    const { minLength = 1, maxLength = 255, pattern, patternMessage } = options;
    
    return {
      required: `${fieldName} es obligatorio`,
      ...(minLength > 1 && { 
        minLength: { 
          value: minLength, 
          message: `${fieldName} debe tener al menos ${minLength} caracteres` 
        } 
      }),
      ...(maxLength < 255 && { 
        maxLength: { 
          value: maxLength, 
          message: `${fieldName} no puede exceder ${maxLength} caracteres` 
        } 
      }),
      ...(pattern && { 
        pattern: { 
          value: pattern, 
          message: patternMessage || `${fieldName} tiene un formato inválido` 
        } 
      }),
    };
  },

  /**
   * Validación de texto opcional
   */
  optionalText: (fieldName: string, options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  } = {}) => {
    const { minLength, maxLength = 255, pattern, patternMessage } = options;
    
    return {
      ...(minLength && { 
        minLength: { 
          value: minLength, 
          message: `${fieldName} debe tener al menos ${minLength} caracteres` 
        } 
      }),
      ...(maxLength < 255 && { 
        maxLength: { 
          value: maxLength, 
          message: `${fieldName} no puede exceder ${maxLength} caracteres` 
        } 
      }),
      ...(pattern && { 
        pattern: { 
          value: pattern, 
          message: patternMessage || `${fieldName} tiene un formato inválido` 
        } 
      }),
    };
  },

  /**
   * Validación de email
   */
  email: (fieldName: string, required = true) => ({
    ...(required && { required: `${fieldName} es obligatorio` }),
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: `${fieldName} debe ser un correo válido`
    }
  }),

  /**
   * Validación de número
   */
  number: (fieldName: string, options: {
    required?: boolean;
    min?: number;
    max?: number;
  } = {}) => {
    const { required = true, min, max } = options;
    
    return {
      ...(required && { required: `${fieldName} es obligatorio` }),
      ...(min !== undefined && { 
        min: { 
          value: min, 
          message: `${fieldName} debe ser mayor o igual a ${min}` 
        } 
      }),
      ...(max !== undefined && { 
        max: { 
          value: max, 
          message: `${fieldName} debe ser menor o igual a ${max}` 
        } 
      }),
    };
  },

  /**
   * Validación de select
   */
  select: (fieldName: string, required = true) => ({
    ...(required && { required: `${fieldName} es obligatorio` })
  })
};

// ============================================================================
// FIELD BUILDER - API FLUIDA
// ============================================================================

export class FieldBuilder {
  private field: Partial<Field> = {};

  constructor(name: string) {
    this.field.name = name;
  }

  /**
   * Helper para procesar traducciones directas
   */
  private _processTranslation(value: DirectTranslation | string | undefined): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    // Para arrays [ES, EN], usar el primer elemento (español) como fallback
    // En un hook real se usaría useDirectTranslation, pero aquí necesitamos un valor estático
    return Array.isArray(value) ? value[0] : value;
  }

  /**
   * Campo de texto con API fluida
   */
  text(options: TextFieldOptions = {}) {
    const { 
      label, 
      placeholder, 
      helpText, 
      required = false, 
      disabled = false, 
      hidden = false,
      section,
      width = 'full',
      autoFocus = false,
      defaultValue,
      minLength,
      maxLength,
      pattern,
      patternMessage,
      conditionalRules
    } = options;

    this.field = {
      ...this.field,
      ...this._createFieldObject({
        type: 'text',
        label: this._processTranslation(label),
        placeholder: this._processTranslation(placeholder),
        helpText: this._processTranslation(helpText),
        disabled,
        hidden,
        section,
        autoFocus,
        defaultValue,
        minLength,
        maxLength,
        pattern,
        patternMessage,
        conditionalRules
      }),
      // ✅ Agregar propiedades de validación en el nivel principal para atributos HTML
      ...(minLength !== undefined && { minLength }),
      ...(maxLength !== undefined && { maxLength }),
      ...(pattern !== undefined && { pattern })
    };

    // Aplicar ancho
    this._applyWidth(width);

    // ✅ Aplicar validaciones para RHF (SIEMPRE todas las que se pasen)
    if (required || minLength || maxLength || pattern) {
      const processedLabel = this._processTranslation(label) || this.field.name!;
      const processedPatternMessage = this._processTranslation(patternMessage);
      
      // Construir objeto de validación con TODAS las reglas
      const validation: Record<string, any> = {};
      
      // Required
      if (required) {
        validation['required'] = `${processedLabel} es obligatorio`;
      }
      
      // MinLength
      if (minLength !== undefined) {
        validation['minLength'] = {
          value: minLength,
          message: `${processedLabel} debe tener al menos ${minLength} caracteres`
        };
      }
      
      // MaxLength
      if (maxLength !== undefined) {
        validation['maxLength'] = {
          value: maxLength,
          message: `${processedLabel} no puede exceder ${maxLength} caracteres`
        };
      }
      
      // Pattern
      if (pattern !== undefined) {
        validation['pattern'] = {
          value: pattern,
          message: processedPatternMessage || `${processedLabel} no tiene un formato válido`
        };
      }
      
      this.field.validation = validation;
    }

    return this;
  }

  /**
   * Campo de email
   */
  email(options: BaseFieldOptions = {}) {
    const { label, placeholder, helpText, required = false, disabled = false, hidden = false, section, width = 'full', autoFocus = false, defaultValue, conditionalRules } = options;

    this.field = {
      ...this.field,
      ...this._createFieldObject({
        type: 'email',
        label: this._processTranslation(label),
        placeholder: this._processTranslation(placeholder),
        helpText: this._processTranslation(helpText),
        disabled,
        hidden,
        section,
        autoFocus,
        defaultValue,
        conditionalRules
      })
    };

    this._applyWidth(width);

    // Validación de email simplificada
    const processedLabel = this._processTranslation(label) || this.field.name!;
    this.field.validation = createValidation.email(processedLabel, required);

    return this;
  }

  /**
   * Campo numérico
   */
  number(options: NumberFieldOptions = {}) {
    const { 
      label, 
      placeholder, 
      helpText, 
      required = false, 
      disabled = false, 
      hidden = false,
      section,
      width = 'full',
      autoFocus = false,
      defaultValue,
      min,
      max,
      useDecimal = false,
      numberFormat = 'integer',
      conditionalRules
    } = options;

    this.field = {
      ...this.field,
      ...this._createFieldObject({
        type: 'number',
        label: this._processTranslation(label),
        placeholder: this._processTranslation(placeholder),
        helpText: this._processTranslation(helpText),
        disabled,
        hidden,
        section,
        autoFocus,
        defaultValue,
        useDecimal,
        numberFormat,
        conditionalRules
      }),
      // ✅ Agregar propiedades de validación en el nivel principal para atributos HTML
      ...(min !== undefined && { min }),
      ...(max !== undefined && { max })
    };

    this._applyWidth(width);

    // ✅ Validación numérica con TODAS las reglas
    if (required || min !== undefined || max !== undefined) {
      const processedLabel = this._processTranslation(label) || this.field.name!;
      const validation: Record<string, any> = {};
      
      if (required) {
        validation['required'] = `${processedLabel} es obligatorio`;
      }
      
      if (min !== undefined) {
        validation['min'] = {
          value: min,
          message: `${processedLabel} debe ser mayor o igual a ${min}`
        };
      }
      
      if (max !== undefined) {
        validation['max'] = {
          value: max,
          message: `${processedLabel} debe ser menor o igual a ${max}`
        };
      }
      
      this.field.validation = validation;
    }

    return this;
  }

  /**
   * Campo select
   */
  select(options: SelectFieldOptions = {}) {
    const { 
      label, 
      placeholder, 
      helpText, 
      required = false, 
      disabled = false, 
      hidden = false,
      section,
      width = 'full',
      defaultValue,
      options: selectOptions,
      endpoint,
      fieldType,
      keyField,
      labelKey,
      isClearable = true,
      isMulti = false,
      loadOptions,
      isCompositeKey = false,
      compositeKeys,
      dependentFields,
      conditionalRules
    } = options;

    this.field = {
      ...this.field,
      ...this._createFieldObject({
        type: 'select',
        label: this._processTranslation(label),
        placeholder: this._processTranslation(placeholder),
        helpText: this._processTranslation(helpText),
        disabled,
        hidden,
        section,
        defaultValue,
        options: selectOptions,
        endpoint,
        fieldType,
        keyField,
        labelKey,
        isClearable,
        isMulti,
        loadOptions,
        isCompositeKey,
        compositeKeys,
        dependentFields,
        conditionalRules
      })
    };

    this._applyWidth(width);

    // Validación de select simplificada
    const processedLabel = this._processTranslation(label) || this.field.name!;
    this.field.validation = createValidation.select(processedLabel, required);

    return this;
  }

  /**
   * Campo textarea
   */
  textarea(options: TextAreaOptions = {}) {
    const { 
      label, 
      placeholder, 
      helpText, 
      required = false, 
      disabled = false, 
      hidden = false,
      section,
      width = 'full',
      defaultValue,
      rows = 3,
      minRows,
      maxRows,
      maxLength,
      conditionalRules
    } = options;

    this.field = {
      ...this.field,
      ...this._createFieldObject({
        type: 'textarea',
        label: this._processTranslation(label),
        placeholder: this._processTranslation(placeholder),
        helpText: this._processTranslation(helpText),
        disabled,
        hidden,
        section,
        defaultValue,
        rows,
        minRows,
        maxRows,
        maxLength,
        conditionalRules
      })
    };

    this._applyWidth(width);

    // Validación básica
    if (required) {
      const processedLabel = this._processTranslation(label) || this.field.name!;
      this.field.validation = { required: `${processedLabel} es obligatorio` };
    }

    return this;
  }

  /**
   * Campo radio group
   */
  radioGroup(options: RadioOptions) {
    const { 
      label, 
      helpText, 
      required = false, 
      disabled = false, 
      hidden = false,
      section,
      width = 'full',
      defaultValue,
      options: radioOptions,
      orientation = 'vertical'
    } = options;

    this.field = {
      ...this.field,
      ...this._createFieldObject({
        type: 'radiogroup',
        label: this._processTranslation(label),
        helpText: this._processTranslation(helpText),
        disabled,
        hidden,
        section,
        defaultValue,
        options: radioOptions,
        orientation,
      })
    };

    this._applyWidth(width);

    // Validación de radio
    if (required) {
      const processedLabel = this._processTranslation(label) || this.field.name!;
      this.field.validation = { required: `${processedLabel} es obligatorio` };
    }

    return this;
  }

  /**
   * Campo checkbox
   */
  checkbox(options: BaseFieldOptions = {}) {
    const { label, helpText, disabled = false, hidden = false, section, width = 'full', defaultValue = false } = options;

    this.field = {
      ...this.field,
      ...this._createFieldObject({
        type: 'checkbox',
        label: this._processTranslation(label),
        helpText: this._processTranslation(helpText),
        disabled,
        hidden,
        section,
        defaultValue,
      })
    };

    this._applyWidth(width);

    return this;
  }

  /**
   * Campo de fecha
   */
  date(options: BaseFieldOptions = {}) {
    const { label, placeholder, helpText, required = false, disabled = false, hidden = false, section, width = 'full', defaultValue } = options;

    this.field = {
      ...this.field,
      ...this._createFieldObject({
        type: 'date',
        label: this._processTranslation(label),
        placeholder: this._processTranslation(placeholder),
        helpText: this._processTranslation(helpText),
        disabled,
        hidden,
        section,
        defaultValue,
      })
    };

    this._applyWidth(width);

    // Validación de fecha
    if (required) {
      const processedLabel = this._processTranslation(label) || this.field.name!;
      this.field.validation = { required: `${processedLabel} es obligatorio` };
    }

    return this;
  }

  /**
   * Aplicar ancho inteligente
   */
  private _applyWidth(width: FieldWidth) {
    // Agregar clase CSS para el ancho
    const widthClasses = {
      'full': 'col-span-12',
      '1/2': 'col-span-6',
      '1/3': 'col-span-4',
      '2/3': 'col-span-8',
      '1/4': 'col-span-3',
      '3/4': 'col-span-9',
      '1/6': 'col-span-2',
      '5/6': 'col-span-10',
    };

    // Almacenar el ancho en una propiedad específica y también en section para compatibilidad
    this.field.fieldWidth = width;
    
    // Si ya hay una sección, agregar la clase de ancho
    if (this.field.section) {
      // Remover clases de ancho existentes y agregar la nueva
      const sectionWithoutWidth = this.field.section.replace(/col-span-\d+/g, '').trim();
      this.field.section = `${sectionWithoutWidth} ${widthClasses[width]}`.trim();
    } else {
      // Si no hay sección, crear una con solo la clase de ancho
      this.field.section = widthClasses[width];
    }
  }

  /**
   * Helper para crear objeto field sin propiedades undefined
   */
  private _createFieldObject(baseProps: any) {
    const cleanProps: any = {};
    
    Object.keys(baseProps).forEach(key => {
      if (baseProps[key] !== undefined) {
        cleanProps[key] = baseProps[key];
      }
    });
    
    return cleanProps;
  }

  // ============================================================================
  // CAMPOS CONDICIONALES
  // ============================================================================

  /**
   * Agrega una regla condicional al campo
   * 
   * Permite controlar la visibilidad, estado habilitado y requerimiento
   * del campo basándose en el valor de otro campo.
   * 
   * @param rule - Regla condicional a aplicar
   * @returns this (para encadenamiento)
   * 
   * @example
   * // Mostrar campo solo cuando tipo es 'SELECT' o 'RADIO'
   * builder.when({
   *   watchField: 'forFieTyp',
   *   condition: { operator: 'in', value: ['SELECT', 'RADIO'] },
   *   actions: { show: true, require: true, clearValue: true }
   * })
   * 
   * @example
   * // Deshabilitar cuando otro campo es true
   * builder.when({
   *   watchField: 'isLocked',
   *   condition: { operator: 'equals', value: true },
   *   actions: { enable: false }
   * })
   */
  when(rule: ConditionalRule) {
    if (!this.field.conditionalRules) {
      this.field.conditionalRules = [];
    }
    this.field.conditionalRules.push(rule);
    return this;
  }

  /**
   * Helper: Mostrar campo solo cuando otro campo tiene un valor específico
   * 
   * @param watchField - Campo a observar
   * @param value - Valor que debe tener el campo observado
   * @param clearValue - Si true, limpia el valor cuando se oculta
   * @returns this (para encadenamiento)
   * 
   * @example
   * builder.showWhen('forFieTyp', 'SELECT', true)
   */
  showWhen(watchField: string, value: any, clearValue = true) {
    return this.when({
      watchField,
      condition: { operator: 'equals', value },
      actions: { show: true, clearValue }
    });
  }

  /**
   * Helper: Mostrar campo cuando otro campo tiene uno de varios valores
   * 
   * @param watchField - Campo a observar
   * @param values - Array de valores posibles
   * @param clearValue - Si true, limpia el valor cuando se oculta
   * @returns this (para encadenamiento)
   * 
   * @example
   * builder.showWhenIn('forFieTyp', ['SELECT', 'RADIO'], true)
   */
  showWhenIn(watchField: string, values: any[], clearValue = true) {
    return this.when({
      watchField,
      condition: { operator: 'in', value: values },
      actions: { show: true, clearValue }
    });
  }

  /**
   * Helper: Hacer campo requerido cuando otro campo tiene un valor específico
   * 
   * @param watchField - Campo a observar
   * @param value - Valor que debe tener el campo observado
   * @returns this (para encadenamiento)
   * 
   * @example
   * builder.requireWhen('forFieTyp', 'SELECT')
   */
  requireWhen(watchField: string, value: any) {
    return this.when({
      watchField,
      condition: { operator: 'equals', value },
      actions: { require: true }
    });
  }

  /**
   * Helper: Hacer campo requerido cuando otro campo tiene uno de varios valores
   * 
   * @param watchField - Campo a observar
   * @param values - Array de valores posibles
   * @returns this (para encadenamiento)
   * 
   * @example
   * builder.requireWhenIn('forFieTyp', ['SELECT', 'RADIO'])
   */
  requireWhenIn(watchField: string, values: any[]) {
    return this.when({
      watchField,
      condition: { operator: 'in', value: values },
      actions: { require: true }
    });
  }

  /**
   * Helper: Deshabilitar campo cuando otro campo tiene un valor específico
   * 
   * @param watchField - Campo a observar
   * @param value - Valor que debe tener el campo observado
   * @returns this (para encadenamiento)
   * 
   * @example
   * builder.disableWhen('status', 'LOCKED')
   */
  disableWhen(watchField: string, value: any) {
    return this.when({
      watchField,
      condition: { operator: 'equals', value },
      actions: { enable: false }
    });
  }

  /**
   * Construir el campo final
   */
  build(): Field {
    return this.field as Field;
  }
}

// ============================================================================
// API SIMPLIFICADA
// ============================================================================

/**
 * Función principal para crear campos con soporte automático para traducciones
 * 
 * @example
 * const field = createField('carNom', {
 *   type: 'text',
 *   label: ['Nombre del Cargo', 'Position Name'],
 *   placeholder: ['Ej: Analista', 'Ex: Analyst'],
 *   required: true,
 *   minLength: 3,
 *   maxLength: 100
 * });
 */
export function createField(name: string, config: any): Field {
  // Crear campo directamente con traducciones
  const { type = 'text', label, placeholder, helpText, patternMessage, width, ...otherOptions } = config;
  
  // Procesar traducciones dinámicamente
  const translatedLabel = label ? useDirectTranslation(label) : undefined;
  const translatedPlaceholder = placeholder ? useDirectTranslation(placeholder) : undefined;
  const translatedHelpText = helpText ? useDirectTranslation(helpText) : undefined;
  const translatedPatternMessage = patternMessage ? useDirectTranslation(patternMessage) : undefined;
  
  // Crear configuración limpia (sin undefined)
  const cleanConfig: any = { ...otherOptions };
  if (translatedLabel) cleanConfig.label = translatedLabel;
  if (translatedPlaceholder) cleanConfig.placeholder = translatedPlaceholder;
  if (translatedHelpText) cleanConfig.helpText = translatedHelpText;
  if (translatedPatternMessage) cleanConfig.patternMessage = translatedPatternMessage;
  if (width) cleanConfig.width = width; // Preservar width para el builder
  
  // Crear campo usando FieldBuilder
  const builder = new FieldBuilder(name);
  
  let builtField: Field;
  switch (type) {
    case 'text':
      builtField = builder.text(cleanConfig).build();
      break;
    case 'email':
      builtField = builder.email(cleanConfig).build();
      break;
    case 'number':
      builtField = builder.number(cleanConfig).build();
      break;
    case 'select':
      builtField = builder.select(cleanConfig).build();
      break;
    case 'textarea':
      builtField = builder.textarea(cleanConfig).build();
      break;
    case 'radiogroup':
      builtField = builder.radioGroup(cleanConfig).build();
      break;
    case 'checkbox':
      builtField = builder.checkbox(cleanConfig).build();
      break;
    case 'date':
      builtField = builder.date(cleanConfig).build();
      break;
    default:
      builtField = builder.text(cleanConfig).build();
  }
  
  // Preservar width en el objeto final para compatibilidad con SmartFormLayout
  if (width) {
    (builtField as any).width = width;
  }
  
  return builtField;
}