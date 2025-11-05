/**
 * Hook unificado para operaciones CRUD
 * Maneja 2 modos: 'modal' (páginas con tabla) y 'page' (formularios dedicados)
 * Incluye paginación del servidor, actualizaciones optimistas y manejo de errores
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CrudService, PaginationParams } from '@/shared/services/api/CrudService';
import { useErrorManager } from '@/shared/managers';
import { ErrorType } from '@/shared/managers/ErrorManager';
import { useNotifications } from '@/shared/hooks/ui/useNotifications';
import { useConfirmationDialog } from '@/shared/components/overlays/dialogs';
import { ApiResponse } from '@/shared/types';
import logger from '@/shared/managers/Logger';
import { useEncryptedParams } from '@/shared/hooks/useEncryptedParams';

// Opciones de configuración del hook
export interface UseCrudOptions<T> {
  /** Servicio CRUD específico (userService, formService, etc.) */
  service: CrudService<T>;
  /** Nombre para cache keys y logs (ej: 'Usuario', 'Formulario') */
  entityName: string;
  /** Filtros iniciales para la búsqueda */
  initialFilters?: Partial<T>;
  /** Configuración inicial de paginación */
  initialPagination?: Partial<PaginationParams>;
  /** 
   * MODO DEL HOOK:
   * - 'modal': Carga lista + permite crear/editar en modals
   * - 'page': Solo carga item por URL, ideal para multi-paso
   * - 'table': Carga lista + navegación externa (sin modal)
   */
  mode?: 'modal' | 'page' | 'table';
  /** Habilita actualizaciones optimistas para mejor UX */
  enableOptimisticUpdates?: boolean;
  /** Tiempo de caché personalizado (React Query) */
  cacheTime?: number;
  /** Tiempo de datos frescos personalizado (React Query) */
  staleTime?: number;
}

// Interface de retorno con todos los métodos y estados disponibles
export interface UseCrudReturn<T> {
  // ===== DATOS DE LA LISTA (Solo en modo 'modal') =====
  /** Array de elementos cargados (vacío en modo 'page') */
  data: T[];
  /** Número total de registros en el servidor */
  totalCount: number;
  /** Página actual (1-based) */
  pageNumber: number;
  /** Tamaño de página actual */
  pageSize: number;
  /** Número total de páginas */
  totalPages: number;
  /** Indica si hay página siguiente */
  hasNextPage: boolean;
  /** Indica si hay página anterior */
  hasPreviousPage: boolean;
  
  // ===== ESTADOS GLOBALES =====
  /** Carga inicial de datos (lista o item por ID) */
  isLoading: boolean;
  /** Recarga manual de datos */
  isRefreshing: boolean;
  /** Error en cualquier operación */
  error: Error | null;
  
  // ===== ESTADOS GRANULARES DE ACCIONES =====
  /** Eliminando elemento */
  isDeleting: boolean;
  /** Cargando elemento específico por ID (modo 'page') */
  isLoadingById: boolean;
  
  // ===== CONFIGURACIÓN DE FILTROS Y PAGINACIÓN =====
  /** Filtros actuales aplicados */
  filters: Partial<T>;
  /** Configuración actual de paginación */
  pagination: PaginationParams;
  
  // ===== ACCIONES DE FILTROS Y PAGINACIÓN =====
  /** Actualizar filtros de búsqueda */
  updateFilters: (newFilters: Partial<T>) => void;
  /** Limpiar todos los filtros */
  clearFilters: () => void;
  /** Actualizar configuración de paginación */
  updatePagination: (newPagination: Partial<PaginationParams>) => void;
  /** Ir a página específica */
  goToPage: (pageNumber: number) => void;
  /** Cambiar tamaño de página */
  setPageSize: (pageSize: number) => void;
  /** Recargar datos actuales */
  refresh: () => Promise<any>;
  
  // ===== ACCIONES CRUD PRINCIPALES =====
  /** Crear elemento (retorna ApiResponse para manejo manual) */
  create: (data: T) => Promise<ApiResponse<T>>;
  /** Actualizar elemento (retorna ApiResponse para manejo manual) */
  update: (data: T) => Promise<ApiResponse<T>>;
  /** Eliminar elemento (llamada directa al servicio) */
  remove: (data: T) => Promise<void>;
  /** Cargar elemento específico por ID */
  getById: (id: Record<string, any>) => Promise<ApiResponse<T>>;
  
  // ===== GESTIÓN DE MODAL (Solo modo 'modal') =====
  /** Estado del modal (cerrado en modo 'page') */
  isModalOpen: boolean;
  /** Tipo de operación en modal */
  modalMode: 'create' | 'edit' | null;
  /** Item actualmente seleccionado (para edición o desde URL) */
  selectedItem: T | null;
  
  // ===== ACCIONES DE MODAL =====
  /** Abrir modal para crear elemento */
  openCreateModal: () => void;
  /** Abrir modal para editar elemento específico */
  openEditModal: (item: T) => void;
  /** Cerrar modal y limpiar selección */
  closeModal: () => void;
  /** Eliminar elemento con confirmación automática via DialogProvider */
  deleteItem: (item: T) => Promise<void>;
  
  // ===== UTILIDADES AVANZADAS =====
  /** Invalidar queries de React Query para forzar recarga */
  invalidateQueries: () => void;
  /** Resetear todas las mutaciones al estado inicial */
  resetMutations: () => void;
}

// Hook principal que implementa toda la lógica CRUD
export function useCrud<T>(
  options: UseCrudOptions<T>
): UseCrudReturn<T> {
  // Extraer configuración con valores por defecto
  const {
    service,
    entityName,
    initialFilters = {},
    initialPagination = { pageNumber: 1, pageSize: 10 },
    mode = 'modal', // 📌 Por defecto 'modal' para compatibilidad
    enableOptimisticUpdates = true,
    cacheTime = 10 * 60 * 1000, // 10 minutos
    staleTime = 5 * 60 * 1000   // 5 minutos
  } = options;

  // ===== DEPENDENCIAS DEL HOOK =====
  const queryClient = useQueryClient();
  const errorManager = useErrorManager();
  const toast = useNotifications();
  const { confirm } = useConfirmationDialog();
  const navigate = useNavigate();
  
  // ===== DETECCIÓN AUTOMÁTICA DE ID DESDE URL (Modo 'page') =====
  // ✅ Usar hook de parámetros encriptados - desencripta automáticamente el ID
  const { id: urlId } = useEncryptedParams<{ id: string }>();
  const location = useLocation();
  const [autoLoadTriggered, setAutoLoadTriggered] = useState(false);
  
  // ===== ESTADOS LOCALES =====
  const [filters, setFilters] = useState<Partial<T>>(initialFilters);
  const [pagination, setPagination] = useState<PaginationParams>({
    pageNumber: initialPagination.pageNumber || 1,
    pageSize: initialPagination.pageSize || 10,
    sortBy: initialPagination.sortBy || undefined,
    sortOrder: initialPagination.sortOrder || 'asc'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // ===== ESTADOS DE MODAL (Solo usado en modo 'modal') =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  // ===== CONFIGURACIÓN DE REACT QUERY =====
  const queryKey = [entityName, filters, pagination];

  // 🔑 DECISIÓN CLAVE: Cargamos lista en modos 'modal' y 'table'
  // En modo 'page' solo cargamos item individual por URL
  const shouldFetchList = mode === 'modal' || mode === 'table';
  
  const {
    data: queryData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      logger.debug(`Fetching ${entityName}`, {
        filters: Object.keys(filters).length,
        page: pagination.pageNumber
      });

      const startTime = performance.now();
      const response = await service.searchPaginated(filters, pagination);
      
      const duration = performance.now() - startTime;
      logger.performance(`Query ${entityName}`, duration, 'ms', {
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        resultCount: response.data?.data?.length || 0
      });

      return response.data;
    },
    staleTime,
    gcTime: cacheTime,
    enabled: shouldFetchList, // Solo ejecutar la query cuando sea necesario
    // retry: (failureCount, error: any) => {
    //   if (error?.status >= 400 && error?.status < 500) {
    //     return error.status === 408 || error.status === 429 ? failureCount < 2 : false;
    //   }
    //   return failureCount < 3;
    // },
    retry: false,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Datos derivados
  const paginatedData = queryData || {
    data: [],
    totalCount: 0,
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };

  // Función para invalidar queries
  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [entityName] });
  }, [queryClient, entityName]);

  // Función para actualización optimista
  const performOptimisticUpdate = useCallback((
    data: T,
    operation: 'create' | 'update' | 'delete'
  ) => {
    if (!enableOptimisticUpdates) return () => {};

    const previousData = queryClient.getQueryData(queryKey);

    if (previousData) {
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.data) return old;
        const items = [...old.data];

        switch (operation) {
          case 'create':
            return {
              ...old,
              data: [data, ...items],
              totalCount: old.totalCount + 1
            };
          case 'update':
            const updateIndex = items.findIndex(item =>
              service.getIdFields().every(field => 
                (item as any)[field] === (data as any)[field]
              )
            );
            if (updateIndex !== -1) {
              items[updateIndex] = { ...items[updateIndex], ...data };
            }
            return { ...old, data: items };
          case 'delete':
            const filteredItems = items.filter(item =>
              !service.getIdFields().every(field => 
                (item as any)[field] === (data as any)[field]
              )
            );
            return {
              ...old,
              data: filteredItems,
              totalCount: old.totalCount - 1
            };
          default:
            return old;
        }
      });

      return () => queryClient.setQueryData(queryKey, previousData);
    }

    return () => {};
  }, [queryClient, queryKey, service, enableOptimisticUpdates]);

  // Mutaciones CRUD
  const createMutation = useMutation({
    mutationFn: async (data: T) => {
      const rollback = performOptimisticUpdate(data, 'create');
      try {
        return await service.create(data);
      } catch (error) {
        rollback();
        throw error;
      }
    },
    onSuccess: (response) => {
      invalidateQueries();
      toast.success(response.message || `${entityName} creado exitosamente`);
      if (mode === 'modal') {
        closeModal();
      }
    },
    onError: (error: any) => {
      errorManager.handleError(error, ErrorType.API, { entityName, action: 'create' });
    },
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: T) => {
      const rollback = performOptimisticUpdate(data, 'update');
      try {
        return await service.update(data);
      } catch (error) {
        rollback();
        throw error;
      }
    },
    onSuccess: (response) => {
      invalidateQueries();
      toast.success(response.message || `${entityName} actualizado exitosamente`);
      if (mode === 'modal') {
        closeModal();
      }
    },
    onError: (error: any) => {
      errorManager.handleError(error, ErrorType.API, { entityName, action: 'update' });
    },
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: T) => {
      const rollback = performOptimisticUpdate(data, 'delete');
      try {
        return await service.remove(data);
      } catch (error) {
        rollback();
        throw error;
      }
    },
    onSuccess: (response) => {
        invalidateQueries();
        toast.success(response.message || `${entityName} eliminado exitosamente`);
    },
    onError: (error: any) => {
      errorManager.handleError(error, ErrorType.API, { entityName, action: 'delete' });
    },
    retry: false,
  });

  const getByIdMutation = useMutation({
    mutationFn: async (id: Record<string, any>) => {
      const response = await service.getById(id);
      if (response.success && response.data) {
        setSelectedItem(response.data);
        return response;
      }
      throw new Error(response.message || `Error al obtener ${entityName.toLowerCase()}`);
    },
    onError: (error: any) => {
      errorManager.handleError(error, ErrorType.API, { entityName, action: 'getById' });
      
      if (mode === 'page') {
        // Extraer la ruta base desde la URL actual
        const pathSegments = location.pathname.split('/').filter(s => s);
        if (pathSegments.length >= 2) {
          const basePath = `/${pathSegments[0]}`;
          logger.info(`Redirigiendo a ${basePath} por ID inválido`, { entityName });
          navigate(basePath, { replace: true });
        }
      }
    },
    retry: false,
  });

  // Funciones de filtros y paginación
  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > paginatedData.totalPages) return;
    updatePagination({ pageNumber });
  }, [updatePagination, paginatedData.totalPages]);

  const setPageSize = useCallback((pageSize: number) => {
    if (pageSize < 1 || pageSize > 100) return;
    updatePagination({ pageSize, pageNumber: 1 });
  }, [updatePagination]);

  // Función de refresh
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await refetch();
      return result;
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Funciones de modal
  const openCreateModal = useCallback(() => {
    setModalMode('create');
    setSelectedItem(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: T) => {
    setModalMode('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalMode(null);
    setSelectedItem(null);
  }, []);

  // Función para eliminar con confirmación usando DialogProvider
  const deleteItem = useCallback(async (item: T) => {
    confirm(
      `Confirmar eliminación`,
      `¿Está seguro que deseas eliminar este ${entityName}?`,
      () => {
        // Obtener el ID del item para la mutación
        const idFields = service.getIdFields();
        const id: Record<string, any> = {};
        
        idFields.forEach(field => {
          id[field] = item[field as keyof T];
        });
        
        deleteMutation.mutate(item);
      },
      {
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
        variant: 'destructive'
      }
    );
  }, [entityName, service, deleteMutation, confirm]);

  // Funciones wrapper para las acciones CRUD
  const create = useCallback(async (data: T): Promise<ApiResponse<T>> => {
    return await createMutation.mutateAsync(data);
  }, [createMutation]);

  const update = useCallback(async (data: T): Promise<ApiResponse<T>> => {
    return await updateMutation.mutateAsync(data);
  }, [updateMutation]);

  const remove = useCallback(async (data: T): Promise<void> => {
    await deleteMutation.mutateAsync(data);
  }, [deleteMutation]);

  const getById = useCallback(async (id: Record<string, any>): Promise<ApiResponse<T>> => {
    return await getByIdMutation.mutateAsync(id);
  }, [getByIdMutation]);

  const resetMutations = useCallback(() => {
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
    getByIdMutation.reset();
  }, [createMutation, updateMutation, deleteMutation, getByIdMutation]);

  // Carga automática por ID de la URL en modo página
  useEffect(() => {
    if (mode === 'page' && urlId && !autoLoadTriggered && !selectedItem) {
      setAutoLoadTriggered(true);
      
      // Parsear ID según el tipo (simple o compuesto)
      const idFields = service.getIdFields();
      
      if (idFields.length === 0) {
        // Servicio sin configuración de campos ID - usar como string simple
        getByIdMutation.mutate({ id: urlId });
      } else if (idFields.length === 1 && idFields[0]) {
        // ID simple - crear objeto con el campo correspondiente
        const idObj: Record<string, any> = {};
        idObj[idFields[0]] = urlId;
        getByIdMutation.mutate(idObj);
      } else if (idFields.length > 1) {
        // ID compuesto - parsear formato "value1-value2-..."
        const parts = urlId.split('-');
        if (parts.length === idFields.length) {
          const compositeId: Record<string, any> = {};
          idFields.forEach((field, index) => {
            compositeId[field] = parts[index];
          });
          getByIdMutation.mutate(compositeId);
        } else if (idFields[0]) {
          // Fallback: usar el primer campo ID
          const idObj: Record<string, any> = {};
          idObj[idFields[0]] = urlId;
          getByIdMutation.mutate(idObj);
        }
      }
    }
  }, [mode, urlId, autoLoadTriggered, selectedItem, service]);

  // Reset cuando cambie la ruta
  useEffect(() => {
    setAutoLoadTriggered(false);
    setSelectedItem(null); // Limpiar item seleccionado al cambiar de ruta
  }, [location.pathname]);

  return {
    // Datos
    data: paginatedData.data,
    totalCount: paginatedData.totalCount,
    pageNumber: paginatedData.pageNumber,
    pageSize: paginatedData.pageSize,
    totalPages: paginatedData.totalPages,
    hasNextPage: paginatedData.hasNextPage,
    hasPreviousPage: paginatedData.hasPreviousPage,
    
    // Estados
    isLoading: isLoading || isRefreshing,
    isRefreshing,
    error: error as Error | null,
    
    // Estados de acciones
    isDeleting: deleteMutation.isPending,
    isLoadingById: getByIdMutation.isPending,
    
    // Filtros y paginación
    filters,
    pagination,
    
    // Acciones de datos
    updateFilters,
    clearFilters,
    updatePagination,
    goToPage,
    setPageSize,
    refresh,
    
    // Acciones CRUD
    create,
    update,
    remove,
    getById,
    
    // Estado de modal
    isModalOpen,
    modalMode,
    selectedItem,
    
    // Acciones de modal
    openCreateModal,
    openEditModal,
    closeModal,
    deleteItem,
    
    // Utilidades
    invalidateQueries,
    resetMutations
  };
}
