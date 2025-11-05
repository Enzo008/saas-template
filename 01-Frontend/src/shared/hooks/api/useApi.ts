import { useState, useCallback, useRef, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retries?: number;
  retryDelay?: number;
}

/**
 * Hook genérico para llamadas a API con manejo de estado
 * Útil para cualquier operación asíncrona con API
 */
export function useApi<T = any, P extends any[] = any[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions = {}
) {
  const {
    immediate = false,
    onSuccess,
    onError,
    retries = 0,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retriesRef = useRef(0);

  const execute = useCallback(async (...args: P): Promise<T | null> => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    retriesRef.current = 0;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false
    }));

    const attemptRequest = async (): Promise<T | null> => {
      try {
        const result = await apiFunction(...args);
        
        setState({
          data: result,
          loading: false,
          error: null,
          success: true
        });

        onSuccess?.(result);
        return result;
      } catch (error) {
        const apiError = error as Error;
        
        // Retry logic
        if (retriesRef.current < retries && apiError.name !== 'AbortError') {
          retriesRef.current++;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptRequest();
        }

        setState({
          data: null,
          loading: false,
          error: apiError,
          success: false
        });

        onError?.(apiError);
        return null;
      }
    };

    return attemptRequest();
  }, [apiFunction, onSuccess, onError, retries, retryDelay]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        loading: false
      }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as P));
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
    cancel
  } as const;
}

/**
 * Hook para múltiples llamadas a API en paralelo
 */
export function useParallelApi<T extends Record<string, any>>(
  apiCalls: {
    [K in keyof T]: () => Promise<T[K]>;
  }
) {
  const [state, setState] = useState<{
    data: Partial<T>;
    loading: boolean;
    errors: Partial<Record<keyof T, Error>>;
    completed: Partial<Record<keyof T, boolean>>;
  }>({
    data: {},
    loading: false,
    errors: {},
    completed: {}
  });

  const execute = useCallback(async () => {
    setState({
      data: {},
      loading: true,
      errors: {},
      completed: {}
    });

    const promises = Object.entries(apiCalls).map(async ([key, apiCall]) => {
      try {
        const result = await (apiCall as () => Promise<any>)();
        return { key, result, error: null };
      } catch (error) {
        return { key, result: null, error: error as Error };
      }
    });

    const results = await Promise.all(promises);

    const newData: Partial<T> = {};
    const newErrors: Partial<Record<keyof T, Error>> = {};
    const newCompleted: Partial<Record<keyof T, boolean>> = {};

    results.forEach(({ key, result, error }) => {
      const typedKey = key as keyof T;
      newCompleted[typedKey] = true;
      
      if (error) {
        newErrors[typedKey] = error;
      } else {
        newData[typedKey] = result;
      }
    });

    setState({
      data: newData,
      loading: false,
      errors: newErrors,
      completed: newCompleted
    });
  }, [apiCalls]);

  return {
    ...state,
    execute
  } as const;
}