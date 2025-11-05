/**
 * API Services - Nueva arquitectura simplificada
 * 
 * Esta es la arquitectura principal recomendada:
 * BaseService → CrudService
 * 
 * Reemplaza la arquitectura anterior:
 * BaseApiService → CrudService → PaginatedCrudService
 */

// ============================================
// NUEVA ARQUITECTURA - RECOMENDADA
// ============================================

// Servicios principales
export { BaseService } from './BaseService';
export { CrudService } from './CrudService';

// Tipos e interfaces principales
export type { ServiceOptions, OperationOptions } from './BaseService';
export type { 
  PaginationParams, 
  PaginatedResponse, 
  PaginatedSearchOptions 
} from './CrudService';