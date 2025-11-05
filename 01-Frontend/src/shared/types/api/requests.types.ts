/**
 * Tipos para peticiones de API
 */

import { PaginationParams } from '../common/pagination.types';

/**
 * Petición base
 */
export interface BaseRequest {
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Petición con filtros
 */
export interface FilteredRequest<T = any> extends BaseRequest {
  filters?: Partial<T>;
  search?: string;
  searchFields?: (keyof T)[];
}

/**
 * Petición paginada
 */
export interface PaginatedRequest<T = any> extends FilteredRequest<T> {
  pagination: PaginationParams;
}

/**
 * Petición de búsqueda avanzada
 */
export interface AdvancedSearchRequest<T = any> extends BaseRequest {
  filters: SearchFilter<T>[];
  logic?: 'AND' | 'OR';
  pagination?: PaginationParams;
}

/**
 * Filtro de búsqueda
 */
export interface SearchFilter<T = any> {
  field: keyof T;
  operator: FilterOperator;
  value: any;
}

/**
 * Operadores de filtro
 */
export type FilterOperator = 
  | 'eq'      // igual
  | 'ne'      // no igual
  | 'gt'      // mayor que
  | 'gte'     // mayor o igual que
  | 'lt'      // menor que
  | 'lte'     // menor o igual que
  | 'like'    // contiene
  | 'ilike'   // contiene (case insensitive)
  | 'in'      // en lista
  | 'nin'     // no en lista
  | 'between' // entre valores
  | 'null'    // es nulo
  | 'nnull';  // no es nulo

/**
 * Petición de creación
 */
export interface CreateRequest<T> extends BaseRequest {
  data: Omit<T, 'id' | 'fecIng' | 'usuIng' | 'fecMod' | 'usuMod'>;
}

/**
 * Petición de actualización
 */
export interface UpdateRequest<T> extends BaseRequest {
  id: string | number;
  data: Partial<Omit<T, 'id' | 'fecIng' | 'usuIng'>>;
}

/**
 * Petición de eliminación
 */
export interface DeleteRequest extends BaseRequest {
  id: string | number;
  force?: boolean; // true para hard delete
}

/**
 * Petición de archivo
 */
export interface FileUploadRequest extends BaseRequest {
  file: File;
  fileType?: string;
  customDirectory?: string;
  maxFileSize?: number;
  allowedExtensions?: string[];
}

/**
 * Petición de exportación
 */
export interface ExportRequest<T = any> extends FilteredRequest<T> {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  fields?: (keyof T)[];
  maxRecords?: number;
}

/**
 * Petición de importación
 */
export interface ImportRequest<T = any> extends BaseRequest {
  data: T[];
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
}

/**
 * Petición batch
 */
export interface BatchRequest<T = any> extends BaseRequest {
  operations: BatchOperation<T>[];
  continueOnError?: boolean;
}

/**
 * Operación batch
 */
export interface BatchOperation<T = any> {
  operation: 'create' | 'update' | 'delete';
  data: T;
  id?: string | number;
}