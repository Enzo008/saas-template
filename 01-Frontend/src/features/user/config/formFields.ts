/**
 * Field configuration for user form
 */
import { Field } from '@/shared/components/forms/components/FormContent';
import { createField } from '@/shared/schemas/fieldBuilder';

export function userFormFields(): Field[] {
  return [
    createField('ideDocCod', {
      type: 'select',
      label: ['Tipo de Documento', 'Document Type'],
      placeholder: ['Seleccione el tipo de documento', 'Select document type'],
      endpoint: 'IdentityDocument',
      fieldType: 'simple',
      keyField: 'ideDocCod',
      labelKey: 'ideDocNam',
      required: true,
      width: '1/2',
      isClearable: true,
      dependentFields: [{
        sourceField: 'ideDocNam',
        targetField: 'ideDocNam'
      }]
    }),

    createField('useNumDoc', {
      type: 'text',
      label: ['Número de Documento', 'Document Number'],
      placeholder: ['Ej: 12345678', 'Ex: 12345678'],
      required: true,
      width: '1/2',
      // Validaciones por defecto (se sobrescriben con reglas condicionales)
      minLength: 8,
      maxLength: 12,
      pattern: /^[0-9]{8,12}$/,
      patternMessage: ['Ingrese un número de documento válido (8-12 dígitos)', 'Enter a valid document number (8-12 digits)'],
      // Validaciones condicionales según tipo de documento
      conditionalRules: [
        // 01 - DNI (solo números, 8 dígitos)
        {
          watchField: 'ideDocCod',
          condition: { operator: 'equals', value: '01' },
          actions: {
            setValidation: {
              pattern: /^[0-9]{8}$/,
              patternMessage: ['DNI debe tener 8 dígitos numéricos', 'DNI must have 8 numeric digits'],
              minLength: 8,
              maxLength: 8
            }
          }
        },
        // 02 - Carnet de Extranjería (alfanumérico, 9-12 caracteres)
        {
          watchField: 'ideDocCod',
          condition: { operator: 'equals', value: '02' },
          actions: {
            setValidation: {
              pattern: /^[A-Z0-9]{9,12}$/,
              patternMessage: ['Carnet debe tener 9-12 caracteres alfanuméricos', 'Card must have 9-12 alphanumeric characters'],
              minLength: 9,
              maxLength: 12
            }
          }
        },
        // 03 - Pasaporte (alfanumérico, 7-12 caracteres)
        {
          watchField: 'ideDocCod',
          condition: { operator: 'equals', value: '03' },
          actions: {
            setValidation: {
              pattern: /^[A-Z0-9]{7,12}$/,
              patternMessage: ['Pasaporte debe tener 7-12 caracteres alfanuméricos', 'Passport must have 7-12 alphanumeric characters'],
              minLength: 7,
              maxLength: 12
            }
          }
        },
        // 04 - RUC (solo números, 11 dígitos)
        {
          watchField: 'ideDocCod',
          condition: { operator: 'equals', value: '04' },
          actions: {
            setValidation: {
              pattern: /^[0-9]{11}$/,
              patternMessage: ['RUC debe tener 11 dígitos numéricos', 'RUC must have 11 numeric digits'],
              minLength: 11,
              maxLength: 11
            }
          }
        },
        // 05 - Cédula de Identidad (solo números, 10 dígitos)
        {
          watchField: 'ideDocCod',
          condition: { operator: 'equals', value: '05' },
          actions: {
            setValidation: {
              pattern: /^[0-9]{10}$/,
              patternMessage: ['Cédula debe tener 10 dígitos numéricos', 'ID must have 10 numeric digits'],
              minLength: 10,
              maxLength: 10
            }
          }
        },
        // 06 - Licencia de Conducir (alfanumérico, 9-10 caracteres)
        {
          watchField: 'ideDocCod',
          condition: { operator: 'equals', value: '06' },
          actions: {
            setValidation: {
              pattern: /^[A-Z0-9]{9,10}$/,
              patternMessage: ['Licencia debe tener 9-10 caracteres alfanuméricos', 'License must have 9-10 alphanumeric characters'],
              minLength: 9,
              maxLength: 10
            }
          }
        },
        // 07 - Partida de Nacimiento (solo números, 12 dígitos)
        {
          watchField: 'ideDocCod',
          condition: { operator: 'equals', value: '07' },
          actions: {
            setValidation: {
              pattern: /^[0-9]{12}$/,
              patternMessage: ['Partida debe tener 12 dígitos numéricos', 'Birth certificate must have 12 numeric digits'],
              minLength: 12,
              maxLength: 12
            }
          }
        },
        // 08 - Documento Tributario (alfanumérico, 11-15 caracteres)
        {
          watchField: 'ideDocCod',
          condition: { operator: 'equals', value: '08' },
          actions: {
            setValidation: {
              pattern: /^[A-Z0-9]{11,15}$/,
              patternMessage: ['Documento tributario debe tener 11-15 caracteres alfanuméricos', 'Tax document must have 11-15 alphanumeric characters'],
              minLength: 11,
              maxLength: 15
            }
          }
        },
        // 09 - Documento Militar (alfanumérico, 8-10 caracteres)
        {
          watchField: 'ideDocCod',
          condition: { operator: 'equals', value: '09' },
          actions: {
            setValidation: {
              pattern: /^[A-Z0-9]{8,10}$/,
              patternMessage: ['Documento militar debe tener 8-10 caracteres alfanuméricos', 'Military document must have 8-10 alphanumeric characters'],
              minLength: 8,
              maxLength: 10
            }
          }
        },
        // 10 - Otro Documento (alfanumérico, 5-20 caracteres)
        {
          watchField: 'ideDocCod',
          condition: { operator: 'equals', value: '10' },
          actions: {
            setValidation: {
              pattern: /^[A-Z0-9]{5,20}$/,
              patternMessage: ['Documento debe tener 5-20 caracteres alfanuméricos', 'Document must have 5-20 alphanumeric characters'],
              minLength: 5,
              maxLength: 20
            }
          }
        }
      ]
    }),

    createField('useNam', {
      type: 'text',
      label: ['Nombres', 'First Names'],
      placeholder: ['Ej: Juan Carlos', 'Ex: John Charles'],
      required: true,
      width: '1/2',
      minLength: 2,
      maxLength: 50,
      pattern: /^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/,
      patternMessage: ['El nombre solo puede contener letras y espacios', 'Name can only contain letters and spaces'],
      autoFocus: true
    }),

    createField('useLas', {
      type: 'text',
      label: ['Apellidos', 'Last Names'],
      placeholder: ['Ej: Pérez García', 'Ex: Smith Johnson'],
      required: true,
      width: '1/2',
      minLength: 2,
      maxLength: 50,
      pattern: /^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/,
      patternMessage: ['El apellido solo puede contener letras y espacios', 'Last name can only contain letters and spaces']
    }),

    createField('useEma', {
      type: 'email',
      label: ['Correo Electrónico', 'Email Address'],
      placeholder: ['Ej: usuario@empresa.com', 'Ex: user@company.com'],
      required: true,
      width: 'full'
    }),

    createField('usePho', {
      type: 'phone',
      label: ['Teléfono', 'Phone Number'],
      placeholder: ['Ingrese número telefónico', 'Enter phone number'],
      required: true,
      width: '1/2'
    }),

    createField('useBir', {
      type: 'date',
      label: ['Fecha de Nacimiento', 'Birth Date'],
      placeholder: ['Seleccione la fecha', 'Select date'],
      required: true,
      width: '1/2'
    }),

    createField('useSex', {
      type: 'radiogroup',
      label: ['Sexo', 'Gender'],
      required: true,
      width: 'full',
      orientation: 'horizontal',
      options: [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' }
      ]
    }),

    createField('posCod', {
      type: 'select',
      label: ['Position', 'Position'],
      placeholder: ['Seleccione el cargo', 'Select position'],
      endpoint: 'Position',
      fieldType: 'simple',
      keyField: 'posCod',
      labelKey: 'posNam',
      required: true,
      width: '1/2',
      isClearable: true,
      dependentFields: [{
        sourceField: 'posNam',
        targetField: 'posNam'
      }]
    }),

    createField('rolCod', {
      type: 'select',
      label: ['Rol', 'Role'],
      placeholder: ['Seleccione el rol', 'Select role'],
      endpoint: 'Role',
      fieldType: 'simple',
      keyField: 'rolCod',
      labelKey: 'rolNam',
      required: true,
      width: '1/2',
      isClearable: true,
      dependentFields: [{
        sourceField: 'rolNam',
        targetField: 'rolNam'
      }]
    }),

    createField('location', {
      type: 'select',
      label: ['Ubicación', 'Location'],
      placeholder: ['Seleccione la ubicación', 'Select location'],
      endpoint: 'Location',
      fieldType: 'composite',
      keyField: ['locYea', 'locCod'],
      labelKey: 'locNam',
      required: true,
      width: '1/2',
      isClearable: true,
      isCompositeKey: true,
      compositeKeys: ['locYea', 'locCod'],
      dependentFields: [{
        sourceField: 'locNam',
        targetField: 'locNam'
      }]
    }),

    createField('repository', {
      type: 'select',
      label: ['Repository', 'Repository'],
      placeholder: ['Seleccione el repositorio', 'Select repository'],
      endpoint: 'Repository',
      fieldType: 'composite',
      keyField: ['repYea', 'repCod'],
      labelKey: 'repNam',
      required: true,
      width: '1/2',
      isClearable: true,
      isCompositeKey: true,
      compositeKeys: ['repYea', 'repCod'],
      dependentFields: [{
        sourceField: 'repNam',
        targetField: 'repNam'
      }]
    }),

    createField('usePas', {
      type: 'text',
      label: ['Contraseña', 'Password'],
      placeholder: ['Ingrese la contraseña', 'Enter password'],
      required: true,
      width: 'full',
      minLength: 8,
      helpText: ['Mínimo 8 caracteres', 'Minimum 8 characters']
    }),

    createField('useSta', {
      type: 'radiogroup',
      label: ['Estado del Usuario', 'User Status'],
      required: true,
      width: 'full',
      orientation: 'horizontal',
      options: [
        { value: 'A', label: 'Activo' },
        { value: 'I', label: 'Inactivo' }
      ]
    })
  ];
}
