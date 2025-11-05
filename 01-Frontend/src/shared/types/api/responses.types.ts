/**
 * Tipos unificados para respuestas de API
 */

/**
 * Respuesta base de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  messageType?: 'success' | 'error' | 'warning' | 'info';
  data?: T;
  totalCount?: number;
}

/**
 * Respuesta exitosa de API
 */
export interface ApiSuccess<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
  messageType?: 'success' | 'info';
}

/**
 * Respuesta de error de API
 */
export interface ApiError extends ApiResponse<never> {
  success: false;
  message: string;
  messageType?: 'error' | 'warning';
  errors?: Record<string, string[]>;
  statusCode?: number;
  details?: any;
  field?: string;
}

/**
 * Respuesta paginada de API
 */
export interface ApiPaginatedResponse<T> extends ApiSuccess<T[]> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Respuesta de operación CRUD
 */
export interface CrudResponse<T> extends ApiResponse<T> {
  operation: 'create' | 'read' | 'update' | 'delete';
  entityId?: string | number;
  affectedRows?: number;
}

/**
 * Respuesta de validación
 */
export interface ValidationResponse {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

/**
 * Error de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

/**
 * Advertencia de validación
 */
export interface ValidationWarning {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

// NOTA: AuthResponse movido a auth/types/auth.types.ts
// Para usar: import { AuthResponse } from '@/auth/types';

/**
 * Respuesta de archivo
 */
export interface FileResponse extends ApiResponse {
  fileName: string;
  originalFileName?: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType?: string;
  isImage?: boolean;
}

/**
 * Respuesta de estadísticas
 */
export interface StatsResponse<T = Record<string, number>> extends ApiResponse<T> {
  period?: string;
  generatedAt: string;
}

/**
 * Type guards para respuestas de API
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}

export function isApiError(response: ApiResponse): response is ApiError {
  return response.success === false;
}

export function isValidationError(error: any): error is ValidationError {
  return error && typeof error.field === 'string' && typeof error.message === 'string';
}