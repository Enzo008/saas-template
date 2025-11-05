/**
 * Hook utilitario para configuración estándar de tablas CRUD
 * Elimina código repetitivo en páginas de mantenimiento
 */
export interface StandardTableProps<T> {
  data: T[];
  columns: any[];
  columnIds: string[];
  initialColumnVisibility: Record<string, boolean>;
  totalCount: number;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  onFilterChange: (filters: any) => void;
  onRefresh: () => void;
  isInitialLoading: boolean;
}

/**
 * Hook que genera props estándar para el componente Table
 * Maneja automáticamente la conversión de paginación y configuración común
 */
export function useStandardTable<T>(
  crudHook: {
    data: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    isLoading: boolean;
    updatePagination: (pagination: { pageNumber: number; pageSize: number }) => void;
    updateFilters: (filters: any) => void;
    refresh: () => void;
  },
  tableHook: {
    columns: any[];
    columnIds: string[];
    initialColumnVisibility: Record<string, boolean>;
  }
): StandardTableProps<T> {
  return {
    // Datos de la tabla
    data: crudHook.data,
    columns: tableHook.columns,
    columnIds: tableHook.columnIds,
    initialColumnVisibility: tableHook.initialColumnVisibility,
    
    // Paginación (conversión automática 0-based/1-based)
    totalCount: crudHook.totalCount,
    pageCount: crudHook.totalPages,
    pageIndex: crudHook.pageNumber - 1, // Convertir a 0-based para la tabla
    pageSize: crudHook.pageSize,
    onPaginationChange: ({ pageIndex, pageSize }) => {
      // Convertir de 0-based a 1-based para nuestro hook
      crudHook.updatePagination({
        pageNumber: pageIndex + 1,
        pageSize
      });
    },
    
    // Filtros y acciones
    onFilterChange: crudHook.updateFilters,
    onRefresh: crudHook.refresh,
    
    // Estados
    isInitialLoading: crudHook.isLoading
  };
}