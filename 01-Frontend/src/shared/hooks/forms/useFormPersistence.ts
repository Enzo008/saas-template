import { useEffect, useCallback } from 'react';
import { useLocalStorage } from '../browser/useLocalStorage';

interface UseFormPersistenceOptions {
  key: string;
  exclude?: string[];
  debounceMs?: number;
  clearOnSubmit?: boolean;
}

/**
 * Hook para persistir datos de formularios en localStorage
 * Útil para formularios largos, drafts, recuperación de datos
 */
export function useFormPersistence<T extends Record<string, any>>(
  formData: T,
  options: UseFormPersistenceOptions
) {
  const {
    key,
    exclude = [],
    debounceMs = 500
  } = options;

  const [persistedData, setPersistedData] = useLocalStorage<Partial<T>>(`form_${key}`, {});

  // Filtrar campos excluidos
  const getFilteredData = useCallback((data: T): Partial<T> => {
    const filtered: Partial<T> = {};
    Object.keys(data).forEach(fieldKey => {
      if (!exclude.includes(fieldKey)) {
        filtered[fieldKey as keyof T] = data[fieldKey];
      }
    });
    return filtered;
  }, [exclude]);

  // Guardar datos con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filteredData = getFilteredData(formData);
      setPersistedData(filteredData);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [formData, getFilteredData, setPersistedData, debounceMs]);

  const clearPersistedData = useCallback(() => {
    setPersistedData({});
  }, [setPersistedData]);

  const restoreData = useCallback(() => {
    return persistedData;
  }, [persistedData]);

  const hasPersistedData = useCallback(() => {
    return Object.keys(persistedData).length > 0;
  }, [persistedData]);

  return {
    persistedData,
    clearPersistedData,
    restoreData,
    hasPersistedData
  } as const;
}

/**
 * Hook para auto-save de formularios
 */
export function useAutoSave<T extends Record<string, any>>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options: {
    interval?: number;
    enabled?: boolean;
    onSave?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const {
    interval = 30000, // 30 segundos
    enabled = true,
    onSave,
    onError
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(async () => {
      try {
        await saveFunction(data);
        onSave?.();
      } catch (error) {
        onError?.(error as Error);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [data, saveFunction, interval, enabled, onSave, onError]);
}