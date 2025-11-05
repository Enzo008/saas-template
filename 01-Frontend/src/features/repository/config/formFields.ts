/**
 * Field configuration for repository form
 */
import { Field } from '@/shared/components/forms/components/FormContent';
import { createField } from '@/shared/schemas/fieldBuilder';

export function repositoryFormFields(): Field[] {
  return [
    createField('repNam', {
      type: 'text',
      label: ['Nombre del Repositorio', 'Repository Name'],
      placeholder: ['Ej: Programa Regional','Ex: Regional Program'],
      required: true,
      width: 'full',
      validationLevel: 'strict',
      minLength: 3,
      maxLength: 100,
      pattern: /^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/,
      patternMessage: ['El nombre solo puede contener letras y espacios','The name can only contain letters and spaces'],
      helpText: ['Nombre completo y descriptivo del repositorio','Complete and descriptive repository name'],
      autoFocus: true
    }),
    createField('location', {
      type: 'select',
      label: ['Ubicación del Repositorio', 'Repository Location'],
      placeholder: ['Seleccione una ubicación','Select a location'],
      endpoint: 'Location',
      fieldType: 'composite',
      keyField: ['locYea', 'locCod'],
      labelKey: 'locNam',
      required: true,
      width: 'full',
      isClearable: true,
      isCompositeKey: true,
      compositeKeys: ['locYea', 'locCod'],
      dependentFields: [{
        sourceField: 'locNam',
        targetField: 'locNam'
      }]
    }),
  ]; 
}
