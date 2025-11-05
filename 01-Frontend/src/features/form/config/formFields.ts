/**
 * Field configuration for dynamic forms
 * Refactored to use direct API (concise style)
 */

import { Field } from '@/shared/components/forms/components/FormContent';
import { createField } from '@/shared/schemas/fieldBuilder';
import { FormType, FormStatus, FieldType } from '../types';

// ============================================================================
// FIELDS FOR BASIC FORM INFORMATION
// ============================================================================

/**
 * Fields for step 1: Basic form information
 */
export function basicInfoFields(): Field[] {
  return [
  // SECTION: Main Information
  createField('forMasNam', {
    type: 'text',
    label: ['Nombre del Formulario', 'Form Name'],
    placeholder: ['Ej: Encuesta de Satisfacción, Registro de Usuario', 'e.g: Satisfaction Survey, User Registration'],
    required: true,
    width: '1/2',
    section: 'main-information',
    minLength: 3,
    maxLength: 100,
    pattern: /^[A-Za-zñÑáéíóúÁÉÍÓÚ0-9\s\-_().,]+$/,
    patternMessage: ['Solo letras, números, espacios y caracteres básicos', 'Only letters, numbers, spaces and basic characters'],
    helpText: ['Nombre descriptivo que identifique claramente el propósito del formulario', 'Descriptive name that clearly identifies the form purpose']
  }),

  createField('forMasDes', {
    type: 'textarea',
    label: ['Descripción', 'Description'],
    placeholder: ['Describe el propósito y uso del formulario...', 'Describe the purpose and use of the form...'],
    required: false,
    width: '1/2',
    section: 'main-information',
    rows: 3,
    maxLength: 500,
    helpText: ['Descripción opcional que explica el contexto y uso del formulario', 'Optional description explaining the context and use of the form']
  }),

  // SECTION: Configuration
  createField('forMasTyp', {
    type: 'select',
    label: ['Tipo de Formulario', 'Form Type'],
    placeholder: ['Seleccione el tipo de formulario', 'Select form type'],
    required: true,
    width: '1/2',
    section: 'configuration',
    options: [
      { value: 'GENERAL', label: 'General' },
      { value: 'ENCUESTA', label: 'Encuesta' },
      { value: 'EVALUACION', label: 'Evaluación' },
      { value: 'REGISTRO', label: 'Registro' },
      { value: 'SOLICITUD', label: 'Solicitud' }
    ],
    helpText: ['Categoría que define el propósito del formulario', 'Category that defines the form purpose']
  }),

  createField('forMasSta', {
    type: 'radiogroup',
    label: ['Estado', 'Status'],
    required: true,
    width: '1/2',
    section: 'configuration',
    orientation: 'horizontal',
    defaultValue: 'A',
    options: [
      { value: 'A', label: 'Active' },
      { value: 'I', label: 'Inactive' }
    ],
    helpText: ['Estado actual del formulario en el sistema', 'Current form status in the system']
  }),

  // SECTION: Advanced Configuration
  createField('forMasOrd', {
    type: 'number',
    label: ['Orden de Visualización', 'Display Order'],
    placeholder: ['1', '1'],
    required: false,
    width: '1/2',
    section: 'advanced-configuration',
    min: 1,
    max: 999,
    numberFormat: 'integer',
    defaultValue: 1,
    helpText: ['Orden en que aparecerá en los listados (opcional)', 'Order in which it will appear in listings (optional)']
  }),

  createField('forMasDatSta', {
    type: 'date',
    label: ['Fecha de Inicio', 'Start Date'],
    required: false,
    width: '1/2',
    section: 'advanced-configuration',
    helpText: ['Fecha desde la cual estará disponible (opcional)', 'Date from which it will be available (optional)']
  }),

  createField('forMasDatEnd', {
    type: 'date',
    label: ['Fecha de Fin', 'End Date'],
    required: false,
    width: '1/2',
    section: 'advanced-configuration',
    helpText: ['Fecha hasta la cual estará disponible (opcional)', 'Date until which it will be available (optional)']
  }),
  ];
}

// ============================================================================
// FIELDS FOR DYNAMIC FIELD EDITOR
// ============================================================================

/**
 * Fields for dynamic field editor
 */
export function fieldEditorFields(): Record<string, Field> {
  return {
  // BASIC FIELD INFORMATION
  forFieNam: createField('forFieNam', {
    type: 'text',
    label: ['Nombre del Campo', 'Field Name'],
    placeholder: ['e.g: user_name, contact_email', 'e.g: user_name, contact_email'],
    required: true,
    width: '1/2',
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
    patternMessage: ['Solo letras, números y guiones bajos', 'Must start with letter, only letters, numbers and underscores'],
    helpText: ['Identificador único del campo (usado internamente)', 'Unique field identifier (used internally)']
  }),

  forFieLab: createField('forFieLab', {
    type: 'text',
    label: ['Etiqueta a Mostrar', 'Label to Display'],
    placeholder: ['e.g: User Name, Email Address', 'e.g: User Name, Email Address'],
    required: true,
    width: '1/2',
    minLength: 2,
    maxLength: 100,
    helpText: ['Texto que el usuario verá como etiqueta del campo', 'Text that the user will see as field label']
  }),

  forFieTyp: createField('forFieTyp', {
    type: 'select',
    label: ['Tipo de Campo', 'Field Type'],
    placeholder: ['Seleccione el tipo de campo', 'Select field type'],
    required: true,
    width: '1/2',
    options: [
      { value: 'TEXT', label: 'Text' },
      { value: 'EMAIL', label: 'Email' },
      { value: 'PASSWORD', label: 'Password' },
      { value: 'NUMBER', label: 'Number' },
      { value: 'TEXTAREA', label: 'Text Area' },
      { value: 'SELECT', label: 'Dropdown List' },
      { value: 'RADIO', label: 'Radio Buttons' },
      { value: 'CHECKBOX', label: 'Checkbox' },
      { value: 'DATE', label: 'Date' },
      { value: 'TIME', label: 'Time' },
      { value: 'DATETIME', label: 'Date and Time' },
      { value: 'FILE', label: 'File' },
      { value: 'HIDDEN', label: 'Hidden Field' }
    ],
    helpText: ['Determina cómo se renderizará y validará el campo', 'Determines how the field will be rendered and validated']
  }),

  forFieReq: createField('forFieReq', {
    type: 'checkbox',
    label: ['Campo Obligatorio', 'Required Field'],
    width: '1/2',
    defaultValue: false,
    helpText: ['Si está marcado, el campo será obligatorio para el usuario', 'If checked, the field will be mandatory for the user']
  }),

  // LAYOUT CONFIGURATION
  forFieCol: createField('forFieCol', {
    type: 'select',
    label: ['Ancho del Campo', 'Field Width'],
    placeholder: ['Seleccione el ancho del campo', 'Select width'],
    width: '1/2',
    defaultValue: '12',
    options: [
      { value: '12', label: 'Full Width (100%)' },
      { value: '6', label: 'Half Width (50%)' },
      { value: '4', label: 'One Third (33%)' },
      { value: '8', label: 'Two Thirds (67%)' },
      { value: '3', label: 'One Quarter (25%)' },
      { value: '9', label: 'Three Quarters (75%)' }
    ],
    helpText: ['Ancho que ocupará el campo en el formulario', 'Width that the field will occupy in the form']
  }),

  // CONTENT CONFIGURATION
  forFiePla: createField('forFiePla', {
    type: 'text',
    label: ['Placeholder', 'Placeholder'],
    placeholder: ['e.g: Enter your full name', 'e.g: Enter your full name'],
    required: false,
    width: '1/2',
    maxLength: 100,
    helpText: ['Texto que aparecerá dentro del campo vacío', 'Help text that appears inside the empty field']
  }),

  forFieVal: createField('forFieVal', {
    type: 'text',
    label: ['Valor por defecto', 'Default Value'],
    placeholder: ['e.g: Not specified', 'e.g: Not specified'],
    required: false,
    width: '1/2',
    maxLength: 200,
    helpText: ['Valor inicial que tendrá el campo (opcional)', 'Initial value that the field will have (optional)']
  }),

  forFieHel: createField('forFieHel', {
    type: 'textarea',
    label: ['Texto de Ayuda', 'Help Text'],
    placeholder: ['Descripción adicional para ayudar al usuario...', 'Additional description to help the user...'],
    required: false,
    width: '1/2',
    rows: 2,
    maxLength: 300,
    helpText: ['Texto explicativo que aparecerá debajo del campo', 'Explanatory text that will appear below the field']
  }),

  // NUMERIC VALIDATIONS
  // CAMPO CONDICIONAL: Solo visible cuando forFieTyp es 'NUMBER'
  forFieMin: createField('forFieMin', {
    type: 'number',
    label: ['Valor Mínimo', 'Minimum Value'],
    placeholder: '0',
    required: false,
    width: '1/2',
    numberFormat: 'decimal',
    helpText: ['Valor mínimo permitido para el campo', 'For numeric fields: minimum allowed value'],
    // Reglas condicionales: Mostrar solo para campos numéricos
    conditionalRules: [{
      watchField: 'forFieTyp',
      condition: { operator: 'equals', value: 'NUMBER' },
      actions: { show: true, clearValue: true }
    }],
    hidden: true
  }),

  // CAMPO CONDICIONAL: Solo visible cuando forFieTyp es 'NUMBER'
  forFieMax: createField('forFieMax', {
    type: 'number',
    label: ['Valor Máximo', 'Maximum Value'],
    placeholder: '100',
    required: false,
    width: '1/2',
    numberFormat: 'decimal',
    helpText: ['Valor máximo permitido para el campo', 'For numeric fields: maximum allowed value'],
    // Reglas condicionales: Mostrar solo para campos numéricos
    conditionalRules: [{
      watchField: 'forFieTyp',
      condition: { operator: 'equals', value: 'NUMBER' },
      actions: { show: true, clearValue: true }
    }],
    hidden: true
  }),

  // ADVANCED VALIDATIONS
  // CAMPO CONDICIONAL: Solo visible para campos de texto que soportan regex
  forFiePat: createField('forFiePat', {
    type: 'text',
    label: ['Patrón de Validación (Regex)', 'Validation Pattern (Regex)'],
    placeholder: '^[a-zA-Z0-9]+$',
    required: false,
    width: '1/2',
    maxLength: 200,
    helpText: ['Expresión regular para validar el formato del campo', 'Regular expression to validate field format'],
    // Reglas condicionales: Mostrar solo para TEXT, EMAIL, PASSWORD
    conditionalRules: [{
      watchField: 'forFieTyp',
      condition: { operator: 'in', value: ['TEXT', 'EMAIL', 'PASSWORD'] },
      actions: { show: true, clearValue: true }
    }],
    hidden: true
  }),

  forFieErr: createField('forFieErr', {
    type: 'text',
    label: ['Mensaje de Error Personalizado', 'Custom Error Message'],
    placeholder: ['e.g: Please enter a valid value', 'e.g: Please enter a valid value'],
    required: false,
    width: '1/2',
    maxLength: 150,
    helpText: ['Mensaje que se mostrará cuando la validación falle', 'Message that will be shown when validation fails']
  }),

  // VISIBILITY CONFIGURATION
  forFieVis: createField('forFieVis', {
    type: 'checkbox',
    label: ['Campo Visible', 'Visible Field'],
    width: '1/2',
    defaultValue: true,
    helpText: ['Si está marcado, el campo será visible', 'If unchecked, the field will be hidden']
  }),

  forFieEdi: createField('forFieEdi', {
    type: 'checkbox',
    label: ['Campo Editable', 'Editable Field'],
    width: '1/2',
    defaultValue: true,
    helpText: ['Si está marcado, el campo será editable', 'If unchecked, the field will be read-only']
  }),

  // OPTIONS FOR SELECT/RADIO
  // CAMPO CONDICIONAL: Solo visible cuando forFieTyp es 'SELECT' o 'RADIO'
  forFieOpt: createField('forFieOpt', {
    type: 'textarea',
    label: ['Opciones (para SELECT/RADIO)', 'Options (for SELECT/RADIO)'],
    placeholder: 'Option 1, Option 2, Option 3\nor in JSON format:\n[{"value":"1","label":"Option 1"}]',
    required: false,
    width: 'full',
    rows: 4,
    maxLength: 1000,
    helpText: ['Opciones para SELECT/RADIO fields: options separated by commas or in JSON format', 'For SELECT/RADIO fields: options separated by commas or in JSON format'],
    // Reglas condicionales: Mostrar y hacer requerido solo para SELECT/RADIO
    conditionalRules: [{
      watchField: 'forFieTyp',
      condition: { operator: 'in', value: ['SELECT', 'RADIO'] },
      actions: { show: true, require: true, clearValue: true }
    }],
    // Por defecto oculto (se muestra solo cuando la condición se cumple)
    hidden: true
  })
  };
}

// ============================================================================
// OPTIONS AND CONSTANTS
// ============================================================================

export const formTypeOptions = [
  { value: 'GENERAL' as FormType, label: 'General' },
  { value: 'ENCUESTA' as FormType, label: 'Survey' },
  { value: 'EVALUACION' as FormType, label: 'Evaluation' },
  { value: 'REGISTRO' as FormType, label: 'Registration' },
  { value: 'SOLICITUD' as FormType, label: 'Request' }
];

export const formStatusOptions = [
  { value: 'A' as FormStatus, label: 'Active' },
  { value: 'I' as FormStatus, label: 'Inactive' }
];

export const fieldTypeOptions = [
  { value: 'TEXT' as FieldType, label: 'Text' },
  { value: 'EMAIL' as FieldType, label: 'Email' },
  { value: 'PASSWORD' as FieldType, label: 'Password' },
  { value: 'NUMBER' as FieldType, label: 'Number' },
  { value: 'TEXTAREA' as FieldType, label: 'Text Area' },
  { value: 'SELECT' as FieldType, label: 'Dropdown List' },
  { value: 'RADIO' as FieldType, label: 'Radio Buttons' },
  { value: 'CHECKBOX' as FieldType, label: 'Checkbox' },
  { value: 'DATE' as FieldType, label: 'Date' },
  { value: 'TIME' as FieldType, label: 'Time' },
  { value: 'DATETIME' as FieldType, label: 'Date and Time' },
  { value: 'FILE' as FieldType, label: 'File' },
  { value: 'HIDDEN' as FieldType, label: 'Hidden Field' }
];

export const columnWidthOptions = [
  { value: 12, label: 'Full Width (100%)' },
  { value: 6, label: 'Half Width (50%)' },
  { value: 4, label: 'One Third (33%)' },
  { value: 8, label: 'Two Thirds (67%)' },
  { value: 3, label: 'One Quarter (25%)' },
  { value: 9, label: 'Three Quarters (75%)' }
];

// ============================================================================
// UTILITIES AND HELPERS
// ============================================================================

export const getFieldValidationRules = (fieldType: FieldType) => {
  const needsOptions = ['SELECT', 'RADIO'].includes(fieldType);
  const needsValidation = ['TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'PASSWORD'].includes(fieldType);
  const needsMinMax = ['NUMBER', 'TEXT', 'TEXTAREA'].includes(fieldType);
  const needsPattern = ['TEXT', 'EMAIL', 'PASSWORD'].includes(fieldType);
  
  return {
    needsOptions,
    needsValidation,
    needsMinMax,
    needsPattern,
    config: {
      TEXT: { placeholder: true, pattern: true, minMax: true },
      EMAIL: { placeholder: true, pattern: false, minMax: false },
      PASSWORD: { placeholder: true, pattern: true, minMax: true },
      NUMBER: { placeholder: true, pattern: false, minMax: true },
      TEXTAREA: { placeholder: true, pattern: false, minMax: true },
      SELECT: { options: true, placeholder: true },
      RADIO: { options: true, orientation: true },
      CHECKBOX: { defaultValue: true },
      DATE: { placeholder: false, minMax: false },
      TIME: { placeholder: false, minMax: false },
      DATETIME: { placeholder: false, minMax: false },
      FILE: { accept: true, maxSize: true },
      HIDDEN: { defaultValue: true }
    }
  };
};

export const getNextFieldOrder = (existingFields: Array<{ fieOrd?: number }>) => {  // Updated field name
  const maxOrder = Math.max(0, ...existingFields.map(f => f.fieOrd || 0));
  return maxOrder + 1;
};

export const convertLegacyWidth = (legacyWidth: number | string): string => {
  const width = typeof legacyWidth === 'string' ? parseInt(legacyWidth) : legacyWidth;
  
  switch (width) {
    case 12: return 'full';
    case 6: return '1/2';
    case 4: return '1/3';
    case 8: return '2/3';
    case 3: return '1/4';
    case 9: return '3/4';
    case 2: return '1/6';
    case 10: return '5/6';
    default: return 'full';
  }
};

export const validateFieldOptions = (options: string): { isValid: boolean; parsed?: any[]; error?: string } => {
  if (!options.trim()) {
    return { isValid: false, error: 'Options are required for this field type' };
  }

  try {
    const parsed = JSON.parse(options);
    if (Array.isArray(parsed)) {
      return { isValid: true, parsed };
    } else {
      return { isValid: false, error: 'JSON must be an array of options' };
    }
  } catch {
    const items = options.split(',').map(item => item.trim()).filter(item => item);
    if (items.length > 0) {
      const parsed = items.map((item, index) => ({
        value: (index + 1).toString(),
        label: item
      }));
      return { isValid: true, parsed };
    } else {
      return { isValid: false, error: 'Invalid format. Use JSON or comma-separated list' };
    }
  }
};
