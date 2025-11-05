/**
 * Hook para manejo tipado de localStorage
 * Incluye serialización automática y manejo de errores
 */

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Función para leer del localStorage
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Función para escribir al localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        
        // Disparar evento personalizado para sincronizar entre tabs
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, newValue },
          })
        );
      } catch (error) {
      }
    },
    [key, storedValue]
  );

  // Función para remover del localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      // Disparar evento personalizado
      window.dispatchEvent(
        new CustomEvent('local-storage', {
          detail: { key, newValue: initialValue },
        })
      );
    } catch (error) {
    }
  }, [key, initialValue]);

  // Escuchar cambios en localStorage (sincronización entre tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e && e.key !== key) return;
      
      if (e instanceof CustomEvent) {
        const { key: eventKey, newValue } = e.detail;
        if (eventKey === key) {
          setStoredValue(newValue);
        }
      } else {
        setStoredValue(readValue());
      }
    };

    // Escuchar eventos nativos de storage (cambios desde otras tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar eventos personalizados (cambios desde la misma tab)
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

// Hook especializado para configuraciones de usuario
export function useUserPreferences<T extends Record<string, any>>(
  defaultPreferences: T
): [T, (key: keyof T, value: T[keyof T]) => void, () => void] {
  const [preferences, setPreferences, clearPreferences] = useLocalStorage(
    'user-preferences',
    defaultPreferences
  );

  const updatePreference = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      setPreferences(prev => ({
        ...prev,
        [key]: value,
      }));
    },
    [setPreferences]
  );

  return [preferences, updatePreference, clearPreferences];
}