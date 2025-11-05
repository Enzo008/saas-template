/**
 * Tipos para el módulo de formularios dinámicos
 */

import { BaseEntity } from '@/shared/types';

// ============================================================================
// TIPOS BÁSICOS Y ENUMS
// ============================================================================

export type FormStatus = 'A' | 'I';
export type FormType = 'GENERAL' | 'ENCUESTA' | 'EVALUACION' | 'REGISTRO' | 'SOLICITUD';
export type FieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'EMAIL' | 'PASSWORD' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'DATE' | 'TIME' | 'DATETIME' | 'FILE' | 'HIDDEN';

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

// Interfaz para opciones de campos (SELECT, RADIO, CHECKBOX)
export interface FieldOption {
  value: string;
  label: string;
  selected?: boolean;
}

// Formulario principal
export interface Form extends BaseEntity {
  forMasYea: string;
  forMasCod: string;
  forMasNam: string;
  forMasDes?: string;
  forMasTyp: FormType;
  forMasSta: FormStatus;
  forMasMul?: boolean;
  forMasDatSta?: string;
  forMasDatEnd?: string;
  forMasOrd?: number;
  fields?: FormField[];
}

// Campo de formulario (consistente con TM_FORMULARIO_CAMPO)
export interface FormField {
  // Identificadores principales (clave compuesta)
  forMasYea: string;
  forMasCod: string;
  forFieYea: string;
  forFieCod: string;
  
  // Información básica del campo
  forFieNam: string;
  forFieLab: string;
  forFieTyp: FieldType;
  forFieReq: boolean;
  forFieOrd: number;
  
  // Configuración avanzada del campo
  forFieOpt?: string;
  forFieVal?: string;
  forFiePla?: string;
  forFieHel?: string;
  forFieCol?: number;
  
  // Validaciones y restricciones
  forFieMin?: number;
  forFieMax?: number;
  forFiePat?: string;
  forFieErr?: string;
  
  // Estado y configuración
  forFieSta?: FormStatus;
  forFieVis?: boolean;
  forFieEdi?: boolean;
  
  // Opciones parseadas (para uso interno)
  options?: FieldOption[];
  
  // Campos temporales para la UI
  isNew?: boolean;
  isEditing?: boolean;
  isDeleted?: boolean;
}

// Campo en creación (antes de tener PKs de BD)
export interface FormFieldDraft extends Omit<FormField, 'forMasYea' | 'forMasCod' | 'forFieYea' | 'forFieCod'> {
  // ID temporal para manejo interno en la UI
  id: string;
}

// Datos de campo para formularios (sin PKs de relación, usado en modales)
export interface FieldFormData extends Omit<FormField, 'forMasYea' | 'forMasCod' | 'forFieYea' | 'forFieCod' | 'options' | 'isNew' | 'isEditing' | 'isDeleted'> {}

// ============================================================================
// TIPOS PARA FORMULARIOS Y FILTROS
// ============================================================================

// Filtros para búsqueda
export interface FormFilters {
  forMasNam?: string;
  forMasTyp?: FormType;
  forMasSta?: FormStatus;
}

// Opciones para selects
export interface FormTypeOption {
  value: FormType;
  label: string;
}

export interface FormStatusOption {
  value: FormStatus;
  label: string;
}

export interface FieldTypeOption {
  value: FieldType;
  label: string;
}

// ============================================================================
// TIPOS PARA FLUJO MULTI-PASO
// ============================================================================

// Datos del paso 1 (información básica)
export interface Step1Data {
  forMasNam: string;
  forMasDes?: string;
  forMasTyp: FormType;
  forMasSta: FormStatus;
  forMasMul?: boolean;
  forMasDatSta?: string;
  forMasDatEnd?: string;
  forMasOrd?: number;
}

// Estado completo del formulario multi-paso
export interface FormStepData {
  basicInfo: Step1Data | null;
  fields: FormFieldDraft[];
}

// ============================================================================
// TIPOS PARA FUNCIONALIDADES AVANZADAS
// ============================================================================

// Lógica condicional de campos (para futuras implementaciones)
export interface ConditionalLogic {
  dependsOn: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string | number | boolean;
  action: 'show' | 'hide' | 'require' | 'optional';
}

// Validación de campos (para futuras implementaciones)
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  customMessage?: string;
}
