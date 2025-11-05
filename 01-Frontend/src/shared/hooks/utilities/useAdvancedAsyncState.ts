/**
 * Hook de Estado Asíncrono Avanzado
 * Mejora sobre useAsyncState existente con funcionalidades adicionales
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNotifications } from '../ui/useNotifications';

// ========================
// TIPOS Y INTERFACES
// ========================

export interface AsyncOperationConfig<T, P extends any[] = any[]> {
  /** Función asíncrona a ejecutar */
  operation: (...args: P) => Promise<T>;
  /** Datos iniciales */
  initialData?: T | null;
  /** Si debe ejecutar inmediatamente al montar */
  immediate?: boolean;
  /** Argumentos para ejecución inmediata */
  immediateArgs?: P;
  /** Número de reintentos automáticos */
  retryCount?: number;
  /** Delay entre reintentos (ms) */
  retryDelay?: number;
  /** Timeout para la operación (ms) */
  timeout?: number;
  /** Callback cuando se completa exitosamente */
  onSuccess?: (data: T) => void;
  /** Callback cuando hay error */
  onError?: (error: Error) => void;
  /** Callback al iniciar */
  onStart?: () => void;
  /** Callback al finalizar (éxito o error) */
  onFinish?: () => void;
  /** Si debe mostrar notificaciones automáticas */
  showNotifications?: boolean;
  /** Mensajes para notificaciones */
  notifications?: {
    success?: string;
    error?: string;
    loading?: string;
  };
}

export interface AsyncState<T> {
  /** Datos actuales */
  data: T | null;
  /** Si está ejecutando */
  isLoading: boolean;
  /** Error actual */
  error: Error | null;
  /** Si la operación fue exitosa */
  isSuccess: boolean;
  /** Si hubo error */
  isError: boolean;
  /** Número de intentos realizados */
  attemptCount: number;
  /** Si está reintentando */
  isRetrying: boolean;
  /** Timestamp de última ejecución */
  lastExecuted: Date | null;
}

export interface AsyncActions<T, P extends any[] = any[]> {
  /** Ejecuta la operación */
  execute: (...args: P) => Promise<T>;
  /** Reinicia el estado */
  reset: () => void;
  /** Establece datos manualmente */
  setData: (data: T | null) => void;
  /** Establece error manualmente */
  setError: (error: Error | null) => void;
  /** Reintenta la última operación */
  retry: () => Promise<T>;
  /** Cancela la operación en curso */
  cancel: () => void;
}

// ========================
// HOOK PRINCIPAL
// ========================

/**
 * Hook avanzado para manejo de operaciones asíncronas
 * Con reintentos, timeout, notificaciones automáticas y más
 */
export function useAdvancedAsyncState<T, P extends any[] = any[]>(
  config: AsyncOperationConfig<T, P>
): [AsyncState<T>, AsyncActions<T, P>] {
  const {
    operation,
    initialData = null,
    immediate = false,
    immediateArgs = [] as unknown as P,
    retryCount = 0,
    retryDelay = 1000,
    timeout = 30000,
    onSuccess,
    onError,
    onStart,
    onFinish,
    showNotifications = false,
    notifications = {}
  } = config;

  const toast = useNotifications();

  // ========================
  // ESTADO LOCAL
  // ========================

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false,
    attemptCount: 0,
    isRetrying: false,
    lastExecuted: null
  });

  // Referencias
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastArgsRef = useRef<P | null>(null);
  const isMountedRef = useRef(true);

  // ========================
  // FUNCIONES AUXILIARES
  // ========================

  const createTimeout = useCallback((timeoutMs: number) => {
    return new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });
  }, []);

  const delay = useCallback((ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }, []);

  const updateState = useCallback((updates: Partial<AsyncState<T>>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // ========================
  // FUNCIÓN PRINCIPAL DE EJECUCIÓN
  // ========================

  const executeOperation = useCallback(
    async (...args: P): Promise<T> => {
      // Cancelar operación anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();
      lastArgsRef.current = args;

      // Estado inicial
      updateState({
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false,
        attemptCount: 0,
        isRetrying: false,
        lastExecuted: new Date()
      });

      if (onStart) {
        onStart();
      }

      if (showNotifications && notifications.loading) {
        toast.info(notifications.loading);
      }

      let currentAttempt = 0;
      let lastError: Error;

      while (currentAttempt <= retryCount) {
        try {
          updateState({ 
            attemptCount: currentAttempt + 1,
            isRetrying: currentAttempt > 0 
          });

          // Crear promesa con timeout
          const operationPromise = operation(...args);
          const timeoutPromise = createTimeout(timeout);

          // Ejecutar con timeout
          const result = await Promise.race([operationPromise, timeoutPromise]);

          // Verificar si fue cancelado
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Operation cancelled');
          }

          // Éxito
          updateState({
            data: result,
            isLoading: false,
            isSuccess: true,
            isRetrying: false
          });

          if (onSuccess) {
            onSuccess(result);
          }

          if (showNotifications && notifications.success) {
            toast.success(notifications.success);
          }

          if (onFinish) {
            onFinish();
          }

          return result;

        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Si es el último intento o la operación fue cancelada
          if (currentAttempt >= retryCount || lastError.message === 'Operation cancelled') {
            updateState({
              error: lastError,
              isLoading: false,
              isError: true,
              isRetrying: false
            });

            if (onError) {
              onError(lastError);
            }

            if (showNotifications && notifications.error) {
              toast.error(notifications.error);
            }

            if (onFinish) {
              onFinish();
            }

            throw lastError;
          }

          // Esperar antes del siguiente intento
          currentAttempt++;
          if (retryDelay > 0) {
            await delay(retryDelay * currentAttempt); // Backoff exponencial
          }
        }
      }

      // Esta línea nunca debería ejecutarse, pero TypeScript lo requiere
      throw lastError!;
    },
    [
      operation,
      retryCount,
      retryDelay,
      timeout,
      onStart,
      onSuccess,
      onError,
      onFinish,
      showNotifications,
      notifications,
      toast,
      createTimeout,
      delay,
      updateState
    ]
  );

  // ========================
  // ACCIONES
  // ========================

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    updateState({
      data: initialData,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
      attemptCount: 0,
      isRetrying: false,
      lastExecuted: null
    });
  }, [initialData, updateState]);

  const setData = useCallback((data: T | null) => {
    updateState({ data });
  }, [updateState]);

  const setError = useCallback((error: Error | null) => {
    updateState({ error, isError: Boolean(error) });
  }, [updateState]);

  const retry = useCallback(async (): Promise<T> => {
    if (!lastArgsRef.current) {
      throw new Error('No previous operation to retry');
    }
    return executeOperation(...lastArgsRef.current);
  }, [executeOperation]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    updateState({ isLoading: false });
  }, [updateState]);

  // ========================
  // EFECTOS
  // ========================

  // Ejecución inmediata
  useEffect(() => {
    if (immediate) {
      executeOperation(...immediateArgs);
    }
  }, [immediate, immediateArgs, executeOperation]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ========================
  // RETORNO
  // ========================

  const actions: AsyncActions<T, P> = {
    execute: executeOperation,
    reset,
    setData,
    setError,
    retry,
    cancel
  };

  return [state, actions];
}

// ========================
// HOOKS ESPECIALIZADOS
// ========================

/**
 * Hook para operaciones simples sin parámetros
 */
export function useSimpleAsync<T>(
  operation: () => Promise<T>,
  options: Omit<AsyncOperationConfig<T, []>, 'operation'> = {}
) {
  return useAdvancedAsyncState({
    operation,
    ...options
  });
}

/**
 * Hook para operaciones con reintentos automáticos
 */
export function useRetryableAsync<T, P extends any[] = any[]>(
  operation: (...args: P) => Promise<T>,
  retryConfig: {
    retries: number;
    delay?: number;
    showNotifications?: boolean;
  }
) {
  return useAdvancedAsyncState({
    operation,
    retryCount: retryConfig.retries,
    retryDelay: retryConfig.delay || 1000,
    showNotifications: retryConfig.showNotifications || true,
    notifications: {
      error: 'Error en la operación. Reintentando...'
    }
  });
}

/**
 * Hook para operaciones con notificaciones automáticas
 */
export function useNotifiedAsync<T, P extends any[] = any[]>(
  operation: (...args: P) => Promise<T>,
  messages: {
    loading?: string;
    success?: string;
    error?: string;
  }
) {
  return useAdvancedAsyncState({
    operation,
    showNotifications: true,
    notifications: messages
  });
}

