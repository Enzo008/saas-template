/**
 * Tipos estrictos para reemplazar el uso de 'any' en el proyecto
 * Proporciona alternativas tipadas más seguras
 */

// Tipo para objetos con claves string y valores desconocidos
export type UnknownRecord = Record<string, unknown>;

// Tipo para arrays de elementos desconocidos
export type UnknownArray = unknown[];

// Tipo para funciones con parámetros y retorno desconocidos
export type UnknownFunction = (...args: unknown[]) => unknown;

// Tipo para datos de formulario genéricos
export interface FormData<T = UnknownRecord> {
  [key: string]: T[keyof T];
}

// Tipo para respuestas de API genéricas
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Tipo para opciones de select genéricas
export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

// Tipo para filtros de tabla genéricos
export interface TableFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number | boolean | Date;
}

// Tipo para configuración de columnas de tabla
export interface ColumnConfig<T = UnknownRecord> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

// Tipo para eventos de formulario
export interface FormEvent<T = UnknownRecord> {
  type: 'change' | 'submit' | 'reset' | 'validate';
  field?: keyof T;
  value?: T[keyof T];
  data?: Partial<T>;
}

// Tipo para configuración de validación
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

// Tipo para errores de validación
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Tipo para estado de carga
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  data?: unknown;
}

// Tipo para paginación
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Tipo para ordenamiento
export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// Tipo para configuración de componentes
export interface ComponentConfig {
  id: string;
  type: string;
  props?: UnknownRecord;
  children?: ComponentConfig[];
}

// Tipo para metadatos de entidad
export interface EntityMetadata {
  id: string | number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
  updatedBy?: string;
}

// Tipo para entidad base
export interface BaseEntity extends EntityMetadata {
  [key: string]: unknown;
}

// Tipo para operaciones CRUD
export type CrudOperation = 'create' | 'read' | 'update' | 'delete';

// Tipo para permisos
export interface Permission {
  resource: string;
  actions: CrudOperation[];
}

// Tipo para usuario con permisos
export interface UserWithPermissions {
  id: string | number;
  name: string;
  email?: string;
  permissions: Permission[];
}

// Tipo para configuración de tema
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor?: string;
  secondaryColor?: string;
  customProperties?: Record<string, string>;
}

// Tipo para configuración de idioma
export interface LanguageConfig {
  code: string;
  name: string;
  flag?: string;
  rtl?: boolean;
}
