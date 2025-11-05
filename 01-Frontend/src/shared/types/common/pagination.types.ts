/**
 * Tipos relacionados con paginación
 */

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Metadatos de paginación
 */
export interface PaginationMeta {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Configuración de paginación
 */
export interface PaginationConfig {
  defaultPageSize: number;
  pageSizeOptions: number[];
  maxPageSize: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal: boolean;
}

/**
 * Información de página
 */
export interface PageInfo {
  current: number;
  size: number;
  total: number;
  pages: number;
}

/**
 * Opciones de ordenamiento
 */
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label?: string;
}

/**
 * Estado de paginación para hooks
 */
export interface PaginationState {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Acciones de paginación
 */
export interface PaginationActions {
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setSort: (field: string, direction?: 'asc' | 'desc') => void;
}