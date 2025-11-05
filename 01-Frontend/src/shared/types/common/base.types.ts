/**
 * Tipos base y comunes para toda la aplicación
 */

/**
 * Campos de auditoría estándar
 */
export interface AuditFields {
  useCre?: string;
  datCre?: string | Date;
  zonCre?: string;
  useUpd?: string;
  datUpd?: string | Date;
  zonUpd?: string;
  staRec?: 'M' | 'I'; // Modificado/Ingresado
}

/**
 * Entidad base con auditoría
 */
export interface AuditableEntity extends AuditFields {
  [key: string]: any;
}

/**
 * Entidad base con ID
 */
export interface BaseEntity extends AuditableEntity {
  id?: string | number;
}

/**
 * Tipos de ID comunes
 */
export type EntityId = string | number;
export type CompositeId = {
  ano: string;
  cod: string;
};

/**
 * Timestamps comunes
 */
export type Timestamp = string | Date;

/**
 * Estados de registro
 */
export type RecordStatus = 'M' | 'I'; // Modificado/Ingresado

/**
 * Tipos de operación CRUD
 */
export type CrudOperation = 'create' | 'read' | 'update' | 'delete';

/**
 * Configuración de entidad
 */
export interface EntityConfig<T = any> {
  name: string;
  displayName: string;
  primaryKey: keyof T | ((item: T) => string);
  displayField?: keyof T;
  searchFields?: (keyof T)[];
  sortField?: keyof T;
  defaultFilters?: Partial<T>;
}

/**
 * Metadatos de entidad
 */
export interface EntityMetadata {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  lastModified?: Timestamp;
  createdBy?: string;
  modifiedBy?: string;
}

/**
 * Configuración de campo
 */
export interface FieldConfig<T = any> {
  key: keyof T;
  label: string;
  type: FieldType;
  required?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
  validate?: (value: any) => boolean | string;
}

/**
 * Tipos de campo
 */
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url'
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'radio' 
  | 'checkbox' 
  | 'switch'
  | 'date' 
  | 'datetime' 
  | 'time'
  | 'file' 
  | 'image'
  | 'color'
  | 'range'
  | 'hidden';

/**
 * Opciones para campos select
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: string;
}

/**
 * Configuración de componente
 */
export interface ComponentConfig {
  size?: ComponentSize;
  variant?: ComponentVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Tamaños de componente
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Variantes de componente
 */
export type ComponentVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'success'
  | 'warning'
  | 'error'
  | 'destructive' 
  | 'outline' 
  | 'ghost'
  | 'link';

/**
 * Estados de componente
 */
export type ComponentState = 'idle' | 'loading' | 'success' | 'error' | 'warning';

/**
 * Configuración de tema
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  borderRadius: number;
  fontSize: number;
}