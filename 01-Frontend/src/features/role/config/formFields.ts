/**
 * Field configuration for role form
 * Simple fields: ROLCOD, ROLNOM (no multi-step)
 */
import { Field } from '@/shared/components/forms/components/FormContent';
import { createField } from '@/shared/schemas/fieldBuilder';

/**
 * Fields for role form - simple structure
 * NOTE: rolCod is auto-generated, not in the form
 */
export function roleFormFields(): Field[] {
  return [
    createField('rolNam', { 
      type: 'text',
      label: 'Role Name',
      placeholder: 'e.g: Administrator, User, Supervisor',
      required: true,
      section: 'basic-information',
      width: 'full',
      validation: {
        maxLength: 100,
        minLength: 3
      }
    })
  ];
}
