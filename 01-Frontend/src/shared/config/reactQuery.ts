/**
 * Configuración simplificada de React Query
 * Configuración única y entendible para toda la aplicación
 */

import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

/**
 * Configuración por defecto para todas las queries
 * Optimizada para datos que cambian frecuentemente (REALTIME)
 */
const DEFAULT_QUERY_CONFIG = {
  staleTime: 0,                    // Siempre considerar datos como stale
  cacheTime: 30 * 1000,          // 30 segundos en memoria (cacheTime)
  refetchOnWindowFocus: true,      // Refetch al volver a la ventana
  refetchOnMount: true,            // Refetch al montar componente
  refetchOnReconnect: true,        // Refetch al reconectar
  retry: 1,                        // Solo 1 reintento
  retryDelay: 1000,               // 1 segundo entre reintentos
  networkMode: 'online' as const, // Solo funcionar online
};

/**
 * Configuración para mutaciones
 */
const DEFAULT_MUTATION_CONFIG = {
  retry: 1,                        // Solo 1 reintento para mutaciones
  retryDelay: 1000,               // 1 segundo entre reintentos
  networkMode: 'online' as const, // Solo funcionar online
};

/**
 * Presets opcionales que pueden usar los desarrolladores
 * cuando necesiten comportamiento diferente al por defecto
 */
export const QUERY_PRESETS = {
  /**
   * Para datos en tiempo real (configuración por defecto)
   */
  REALTIME: {
    staleTime: 0,
    cacheTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },

  /**
   * Para datos que cambian ocasionalmente
   */
  DYNAMIC: {
    staleTime: 2 * 60 * 1000,      // 2 minutos
    cacheTime: 5 * 60 * 1000,         // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },

  /**
   * Para datos estáticos (catálogos, configuraciones)
   */
  STATIC: {
    staleTime: 30 * 60 * 1000,     // 30 minutos
    cacheTime: 60 * 60 * 1000,        // 1 hora
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },

  /**
   * Para formularios multi-paso (datos temporales)
   */
  MULTISTEP: {
    staleTime: 10 * 60 * 1000,     // 10 minutos
    cacheTime: 20 * 60 * 1000,        // 20 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },
} as const;

// ============================================================================
// CLIENTE DE REACT QUERY
// ============================================================================

/**
 * Crea el cliente de React Query con configuración optimizada
 * Configuración única y simple para toda la aplicación
 */
export function createQueryClient(): QueryClient {
  const config: QueryClientConfig = {
    defaultOptions: {
      queries: {
        ...DEFAULT_QUERY_CONFIG,
        
        // Función inteligente de reintentos
        retry: (failureCount, error: any) => {
          // No reintentar errores 4xx (excepto timeout y rate limit)
          if (error?.status >= 400 && error?.status < 500) {
            return error.status === 408 || error.status === 429 ? failureCount < 1 : false;
          }
          // Reintentar errores de red y 5xx solo 1 vez
          return failureCount < 1;
        },
      },
      
      mutations: {
        ...DEFAULT_MUTATION_CONFIG,
        
        // Log de errores de mutación para debugging
        onError: (error: any, variables: any, context: any) => {
          if (process.env['NODE_ENV'] === 'development') {
            console.error('Mutation error:', { error, variables, context });
          }
        },
      },
    },
  };

  return new QueryClient(config);
}

// ============================================================================
// UTILIDADES OPCIONALES
// ============================================================================

/**
 * Hook opcional para aplicar preset específico a una query
 * Solo usar cuando necesites comportamiento diferente al por defecto
 * 
 * @example
 * const { data } = useQuery({
 *   queryKey: ['catalogos'],
 *   queryFn: fetchCatalogos,
 *   ...useQueryPreset('STATIC') // Para datos que no cambian
 * });
 */
export function useQueryPreset(preset: keyof typeof QUERY_PRESETS) {
  return QUERY_PRESETS[preset];
}

/**
 * Función para invalidar queries por patrón
 * Útil para invalidar múltiples queries relacionadas
 */
export function invalidateQueriesByPattern(
  queryClient: QueryClient, 
  pattern: string
) {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey;
      return Array.isArray(queryKey) && 
        queryKey.some(key => 
          typeof key === 'string' && 
          key.toLowerCase().includes(pattern.toLowerCase())
        );
    }
  });
}
