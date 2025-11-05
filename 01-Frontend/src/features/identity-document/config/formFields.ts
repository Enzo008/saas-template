/**
 * Field configuration for identity document form
 */
import { Field } from '@/shared/components/forms/components/FormContent';
import { createField } from '@/shared/schemas/fieldBuilder';

export function identityDocumentFormFields(): Field[] {
  return [
  createField('IdeDocNam', {
    type: 'text',
    label: 'Document Name',
    placeholder: 'e.g: National Identity Document, Foreign ID Card',
    required: true,
    width: 'full',
    minLength: 3,
    maxLength: 100,
    pattern: /^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/,
    patternMessage: 'Name can only contain letters and spaces',
    helpText: 'Complete and descriptive name of the document type',
    autoFocus: true
  }),

  createField('IdeDocAbr', {
    type: 'text',
    label: 'Abbreviation',
    placeholder: 'e.g: DNI, CE, PAS, RUC',
    required: true,
    width: 'full',
    minLength: 2,
    maxLength: 10,
    pattern: /^[A-Z0-9]+$/,
    patternMessage: 'Only uppercase letters and numbers, no spaces',
    helpText: 'Standard document abbreviation (2-10 characters)'
  }),
  ];
}
