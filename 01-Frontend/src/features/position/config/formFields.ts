/**
 * Configuración de campos para formulario de cargos
 */
import { Field } from '@/shared/components/forms/components/FormContent';
import { createField } from '@/shared/schemas/fieldBuilder';

/**
 * Campos para formulario de cargos
 * @returns Array de configuración de campos
 */
export function positionFormFields(): Field[] {
  return [
    createField('posNam', {
      type: 'text',
      label: ['Nombre del Cargo', 'Position Name'],
      placeholder: ['Ej: Analista de Sistemas', 'Ex: Systems Analyst'],
      helpText: ['Nombre completo y descriptivo del cargo', 'Complete and descriptive position name'],
      patternMessage: ['El nombre solo puede contener letras y espacios', 'Name can only contain letters and spaces'],
      required: true,
      width: 'full',
      minLength: 3,
      maxLength: 100,
      pattern: /^[A-Za-zñÑáéíóúÁÉÍÓÚ0-9\s\-\.]+$/,
      autoFocus: true
    }),
  ];
}