/**
 * Templates de campos predefinidos para formularios dinámicos
 */

import { FieldType, FormFieldDraft } from '../types';

export interface FieldTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'basic' | 'contact' | 'personal' | 'business' | 'validation';
  template: Omit<FormFieldDraft, 'id' | 'forFieOrd'>;
}

export const fieldTemplates: FieldTemplate[] = [
  // Campos Básicos
  {
    id: 'text_basic',
    name: 'Texto Simple',
    description: 'Campo de texto básico',
    icon: '📝',
    category: 'basic',
    template: {
      forFieNam: 'texto_simple',
      forFieLab: 'Texto',
      forFieTyp: 'TEXT' as FieldType,
      forFieReq: false,
      forFiePla: 'Ingrese texto...',
      forFieHel: 'Campo de texto simple',
      forFieCol: 12,
      forFieVis: true,
      forFieEdi: true
    }
  },
  {
    id: 'textarea_basic',
    name: 'Área de Texto',
    description: 'Campo de texto multilínea',
    icon: '📄',
    category: 'basic',
    template: {
      forFieNam: 'area_texto',
      forFieLab: 'Descripción',
      forFieTyp: 'TEXTAREA' as FieldType,
      forFieReq: false,
      forFiePla: 'Ingrese descripción...',
      forFieHel: 'Campo de texto multilínea',
      forFieCol: 12,
      forFieVis: true,
      forFieEdi: true
    }
  },
  {
    id: 'number_basic',
    name: 'Número',
    description: 'Campo numérico',
    icon: '🔢',
    category: 'basic',
    template: {
      forFieNam: 'numero',
      forFieLab: 'Número',
      forFieTyp: 'NUMBER' as FieldType,
      forFieReq: false,
      forFiePla: '0',
      forFieHel: 'Ingrese un número',
      forFieCol: 6,
      forFieVis: true,
      forFieEdi: true
    }
  },
  {
    id: 'select_basic',
    name: 'Lista Desplegable',
    description: 'Campo de selección única',
    icon: '📋',
    category: 'basic',
    template: {
      forFieNam: 'lista_opciones',
      forFieLab: 'Seleccione una opción',
      forFieTyp: 'SELECT' as FieldType,
      forFieReq: false,
      forFiePla: 'Seleccione...',
      forFieHel: 'Seleccione una opción de la lista',
      forFieCol: 6,
      forFieOpt: JSON.stringify([
        { value: 'opcion1', label: 'Opción 1' },
        { value: 'opcion2', label: 'Opción 2' },
        { value: 'opcion3', label: 'Opción 3' }
      ]),
      forFieVis: true,
      forFieEdi: true
    }
  },

  // Campos de Contacto
  {
    id: 'email_contact',
    name: 'Correo Electrónico',
    description: 'Campo de email con validación',
    icon: '📧',
    category: 'contact',
    template: {
      forFieNam: 'email',
      forFieLab: 'Correo Electrónico',
      forFieTyp: 'EMAIL' as FieldType,
      forFieReq: true,
      forFiePla: 'ejemplo@correo.com',
      forFieHel: 'Ingrese un correo electrónico válido',
      forFieCol: 6,
      forFiePat: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      forFieErr: 'Por favor ingrese un correo electrónico válido',
      forFieVis: true,
      forFieEdi: true
    }
  },
  {
    id: 'phone_contact',
    name: 'Teléfono',
    description: 'Campo de teléfono',
    icon: '📞',
    category: 'contact',
    template: {
      forFieNam: 'telefono',
      forFieLab: 'Teléfono',
      forFieTyp: 'TEXT' as FieldType,
      forFieReq: false,
      forFiePla: '+1 (555) 123-4567',
      forFieHel: 'Ingrese su número de teléfono',
      forFieCol: 6,
      forFiePat: '^[\\+]?[1-9][\\d\\s\\-\\(\\)]{7,15}$',
      forFieErr: 'Por favor ingrese un número de teléfono válido',
      forFieVis: true,
      forFieEdi: true
    }
  },

  // Campos Personales
  {
    id: 'fullname_personal',
    name: 'Nombre Completo',
    description: 'Campo para nombre y apellidos',
    icon: '👤',
    category: 'personal',
    template: {
      forFieNam: 'nombre_completo',
      forFieLab: 'Nombre Completo',
      forFieTyp: 'TEXT' as FieldType,
      forFieReq: true,
      forFiePla: 'Juan Pérez García',
      forFieHel: 'Ingrese su nombre completo',
      forFieCol: 8,
      forFieMin: 2,
      forFieMax: 100,
      forFieErr: 'El nombre debe tener entre 2 y 100 caracteres',
      forFieVis: true,
      forFieEdi: true
    }
  },
  {
    id: 'birthdate_personal',
    name: 'Fecha de Nacimiento',
    description: 'Campo de fecha de nacimiento',
    icon: '🎂',
    category: 'personal',
    template: {
      forFieNam: 'fecha_nacimiento',
      forFieLab: 'Fecha de Nacimiento',
      forFieTyp: 'DATE' as FieldType,
      forFieReq: false,
      forFieHel: 'Seleccione su fecha de nacimiento',
      forFieCol: 4,
      forFieVis: true,
      forFieEdi: true
    }
  },
  {
    id: 'gender_personal',
    name: 'Género',
    description: 'Campo de selección de género',
    icon: '⚧️',
    category: 'personal',
    template: {
      forFieNam: 'Gender',
      forFieLab: 'Género',
      forFieTyp: 'RADIO' as FieldType,
      forFieReq: false,
      forFieHel: 'Seleccione su género',
      forFieCol: 6,
      forFieOpt: JSON.stringify([
        { value: 'masculino', label: 'Masculino' },
        { value: 'femenino', label: 'Femenino' },
        { value: 'otro', label: 'Otro' },
        { value: 'prefiero_no_decir', label: 'Prefiero no decir' }
      ]),
      forFieVis: true,
      forFieEdi: true
    }
  },

  // Campos de Negocio
  {
    id: 'company_business',
    name: 'Empresa',
    description: 'Campo para nombre de empresa',
    icon: '🏢',
    category: 'business',
    template: {
      forFieNam: 'empresa',
      forFieLab: 'Empresa',
      forFieTyp: 'TEXT' as FieldType,
      forFieReq: false,
      forFiePla: 'Nombre de la empresa',
      forFieHel: 'Ingrese el nombre de su empresa',
      forFieCol: 6,
      forFieVis: true,
      forFieEdi: true
    }
  },
  {
    id: 'position_business',
    name: 'Position',
    description: 'Campo para cargo o posición',
    icon: '💼',
    category: 'business',
    template: {
      forFieNam: 'Position',
      forFieLab: 'Position',
      forFieTyp: 'TEXT' as FieldType,
      forFieReq: false,
      forFiePla: 'Gerente, Desarrollador, etc.',
      forFieHel: 'Ingrese su cargo o posición',
      forFieCol: 6,
      forFieVis: true,
      forFieEdi: true
    }
  },

  // Campos de Validación
  {
    id: 'password_validation',
    name: 'Contraseña',
    description: 'Campo de contraseña con validación',
    icon: '🔒',
    category: 'validation',
    template: {
      forFieNam: 'contrasena',
      forFieLab: 'Contraseña',
      forFieTyp: 'PASSWORD' as FieldType,
      forFieReq: true,
      forFiePla: '••••••••',
      forFieHel: 'Mínimo 8 caracteres, incluya mayúsculas, minúsculas y números',
      forFieCol: 6,
      forFieMin: 8,
      forFiePat: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$',
      forFieErr: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números',
      forFieVis: true,
      forFieEdi: true
    }
  },
  {
    id: 'rating_validation',
    name: 'Calificación',
    description: 'Campo de calificación del 1 al 5',
    icon: '⭐',
    category: 'validation',
    template: {
      forFieNam: 'calificacion',
      forFieLab: 'Calificación',
      forFieTyp: 'RADIO' as FieldType,
      forFieReq: false,
      forFieHel: 'Califique del 1 al 5',
      forFieCol: 6,
      forFieOpt: JSON.stringify([
        { value: '1', label: '⭐ 1 - Muy malo' },
        { value: '2', label: '⭐⭐ 2 - Malo' },
        { value: '3', label: '⭐⭐⭐ 3 - Regular' },
        { value: '4', label: '⭐⭐⭐⭐ 4 - Bueno' },
        { value: '5', label: '⭐⭐⭐⭐⭐ 5 - Excelente' }
      ]),
      forFieVis: true,
      forFieEdi: true
    }
  }
];

// Función para obtener templates por categoría
export const getTemplatesByCategory = (category?: string) => {
  if (!category) return fieldTemplates;
  return fieldTemplates.filter(template => template.category === category);
};

// Función para obtener un template por ID
export const getTemplateById = (id: string) => {
  return fieldTemplates.find(template => template.id === id);
};

// Categorías disponibles
export const templateCategories = [
  { id: 'basic', name: 'Básicos', icon: '📝', description: 'Campos básicos de formulario' },
  { id: 'contact', name: 'Contacto', icon: '📧', description: 'Campos de información de contacto' },
  { id: 'personal', name: 'Personal', icon: '👤', description: 'Campos de información personal' },
  { id: 'business', name: 'Negocio', icon: '🏢', description: 'Campos relacionados con negocios' },
  { id: 'validation', name: 'Validación', icon: '✅', description: 'Campos con validaciones especiales' }
];