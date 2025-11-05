/**
 * Servicios compartidos
 * Exportaciones centralizadas para facilitar la importación de servicios base
 */

// Cliente API y tipos de respuesta
export * from './apiClient';

// Legacy services removed - use core services instead

// Nueva arquitectura de servicios simplificada
export { 
  BaseService,
  CrudService
} from './api';

// Tipos principales
export type { 
  ServiceOptions,
  OperationOptions,
  PaginationParams,
  PaginatedResponse,
  PaginatedSearchOptions
} from './api';

export { emailService } from './emailService';