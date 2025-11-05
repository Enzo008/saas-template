/**
 * Hook de Persistencia Inteligente
 * Combina auto-save, localStorage y sincronización entre tabs
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../browser/useLocalStorage';
import { useDebounce } from '../performance/useDebounce';

// ========================
// TIPOS Y INTERFACES
// ========================

export interface SmartPersistenceConfig<T> {
  /** Clave única para el almacenamiento */
  key: string;
  /** Datos a persistir */
  data: T;
  /** Intervalo de auto-save en ms (default: 3000) */
  autoSaveInterval?: number;
  /** Si debe hacer auto-save (default: true) */
  enableAutoSave?: boolean;
  /** Si debe usar localStorage (default: true) */
  enableLocalStorage?: boolean;
  /** Si debe sincronizar entre tabs (default: true) */
  enableCrossTabSync?: boolean;
  /** Callback cuando se guardan los datos */
  onSave?: (data: T) => void;
  /** Callback cuando se restauran los datos */
  onRestore?: (data: T) => void;
  /** Callback cuando se limpian los datos */
  onClear?: () => void;
  /** Función para validar datos antes de guardar */
  validator?: (data: T) => boolean;
  /** Función para transformar datos antes de guardar */
  transformer?: (data: T) => T;
  /** Limpiar automáticamente después de cierto tiempo (en ms) */
  autoCleanupAfter?: number;
}

export interface SmartPersistenceState {
  /** Si hay datos guardados disponibles */
  hasPersistedData: boolean;
  /** Si se está guardando actualmente */
  isSaving: boolean;
  /** Última fecha de guardado */
  lastSaved: Date | null;
  /** Si hay un auto-save pendiente */
  hasPendingSave: boolean;
}

export interface SmartPersistenceActions<T> {
  /** Guarda los datos inmediatamente */
  save: () => void;
  /** Restaura los datos guardados */
  restore: () => T | null;
  /** Limpia todos los datos guardados */
  clear: () => void;
  /** Fuerza un auto-save inmediato */
  forceSave: () => void;
  /** Pausa/reanuda el auto-save */
  toggleAutoSave: (enabled?: boolean) => void;
}

// ========================
// HOOK PRINCIPAL
// ========================

/**
 * Hook de persistencia inteligente con auto-save y sincronización
 */
export function useSmartPersistence<T extends Record<string, any>>(
  config: SmartPersistenceConfig<T>
): [SmartPersistenceState, SmartPersistenceActions<T>] {
  const {
    key,
    data,
    autoSaveInterval = 3000,
    enableAutoSave = true,
    enableLocalStorage = true,
    enableCrossTabSync = true,
    onSave,
    onRestore,
    onClear,
    validator,
    transformer,
    autoCleanupAfter
  } = config;

  // ========================
  // ESTADO LOCAL
  // ========================

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(enableAutoSave);
  
  // Referencias
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<T>(data);

  // ========================
  // HOOKS DE ALMACENAMIENTO
  // ========================

  const [storedData, setStoredData, removeStoredData] = useLocalStorage<{
    data: T;
    timestamp: number;
  } | null>(`smart-persistence-${key}`, null);

  // Debounce de los datos para auto-save
  const debouncedData = useDebounce(data, autoSaveInterval);

  // ========================
  // ESTADOS DERIVADOS
  // ========================

  const hasPersistedData = Boolean(storedData?.data);
  const hasPendingSave = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);

  // ========================
  // FUNCIONES DE PERSISTENCIA
  // ========================

  const saveData = useCallback((dataToSave: T) => {
    if (!enableLocalStorage) return;

    // Validación
    if (validator && !validator(dataToSave)) {
      return;
    }

    // Transformación
    const finalData = transformer ? transformer(dataToSave) : dataToSave;

    setIsSaving(true);

    try {
      const persistenceData = {
        data: finalData,
        timestamp: Date.now()
      };

      setStoredData(persistenceData);
      setLastSaved(new Date());
      lastDataRef.current = dataToSave;

      // Callback de guardado
      if (onSave) {
        onSave(finalData);
      }

      // Auto-cleanup si está configurado
      if (autoCleanupAfter) {
        if (cleanupTimeoutRef.current) {
          clearTimeout(cleanupTimeoutRef.current);
        }
        cleanupTimeoutRef.current = setTimeout(() => {
          removeStoredData();
        }, autoCleanupAfter);
      }

    } finally {
      setIsSaving(false);
    }
  }, [
    enableLocalStorage,
    validator,
    transformer,
    setStoredData,
    onSave,
    autoCleanupAfter,
    removeStoredData
  ]);

  const restoreData = useCallback((): T | null => {
    if (!storedData?.data) return null;

    const restoredData = storedData.data;
    
    if (onRestore) {
      onRestore(restoredData);
    }

    return restoredData;
  }, [storedData, onRestore]);

  const clearData = useCallback(() => {
    removeStoredData();
    setLastSaved(null);
    lastDataRef.current = {} as T;

    // Limpiar timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }

    if (onClear) {
      onClear();
    }
  }, [removeStoredData, onClear]);

  const forceSave = useCallback(() => {
    saveData(data);
  }, [saveData, data]);

  const toggleAutoSave = useCallback((enabled?: boolean) => {
    const newEnabled = enabled !== undefined ? enabled : !autoSaveEnabled;
    setAutoSaveEnabled(newEnabled);
  }, [autoSaveEnabled]);

  // ========================
  // EFECTOS
  // ========================

  // Auto-save cuando los datos cambian (debounced)
  useEffect(() => {
    if (!autoSaveEnabled || !debouncedData) return;

    // Solo guardar si los datos han cambiado realmente
    if (JSON.stringify(debouncedData) !== JSON.stringify(lastDataRef.current)) {
      saveData(debouncedData);
    }
  }, [debouncedData, autoSaveEnabled, saveData]);

  // Sincronización entre tabs
  useEffect(() => {
    if (!enableCrossTabSync) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `smart-persistence-${key}`) {
        // Los datos han cambiado en otra tab
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        
        if (newData?.data && onRestore) {
          onRestore(newData.data);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, enableCrossTabSync, onRestore]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  // ========================
  // RETORNO
  // ========================

  const state: SmartPersistenceState = {
    hasPersistedData,
    isSaving,
    lastSaved,
    hasPendingSave
  };

  const actions: SmartPersistenceActions<T> = {
    save: forceSave,
    restore: restoreData,
    clear: clearData,
    forceSave,
    toggleAutoSave
  };

  return [state, actions];
}

// ========================
// HOOKS ESPECIALIZADOS
// ========================

/**
 * Hook para persistencia de formularios
 */
export function useFormPersistence<T extends Record<string, any>>(
  formKey: string,
  formData: T,
  options: Partial<SmartPersistenceConfig<T>> = {}
) {
  return useSmartPersistence({
    key: `form-${formKey}`,
    data: formData,
    autoSaveInterval: 2000, // Más frecuente para formularios
    validator: (data) => {
      // No guardar formularios vacíos
      return Object.values(data).some(value => 
        value !== '' && value !== null && value !== undefined
      );
    },
    ...options
  });
}

/**
 * Hook para persistencia de configuraciones de usuario
 */
export function useSettingsPersistence<T extends Record<string, any>>(
  settingsKey: string,
  settings: T
) {
  return useSmartPersistence({
    key: `settings-${settingsKey}`,
    data: settings,
    autoSaveInterval: 1000, // Guardado rápido para configuraciones
    enableAutoSave: true,
    enableCrossTabSync: true,
    autoCleanupAfter: 30 * 24 * 60 * 60 * 1000 // 30 días
  });
}

/**
 * Hook para persistencia de estado temporal de página
 */
export function usePageStatePersistence<T extends Record<string, any>>(
  pageKey: string,
  pageState: T
) {
  return useSmartPersistence({
    key: `page-state-${pageKey}`,
    data: pageState,
    autoSaveInterval: 5000,
    autoCleanupAfter: 24 * 60 * 60 * 1000 // 24 horas
  });
}
