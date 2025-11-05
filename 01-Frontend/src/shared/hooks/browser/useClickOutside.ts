import { useEffect, useRef } from 'react';

/**
 * Hook para detectar clicks fuera de un elemento
 * Útil para cerrar modales, dropdowns, tooltips, etc.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  enabled: boolean = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler, enabled]);

  return ref;
}

/**
 * Hook para detectar clicks fuera de múltiples elementos
 */
export function useMultiClickOutside(
  handler: () => void,
  enabled: boolean = true
) {
  const refs = useRef<(HTMLElement | null)[]>([]);

  const addRef = (element: HTMLElement | null) => {
    if (element && !refs.current.includes(element)) {
      refs.current.push(element);
    }
  };

  const removeRef = (element: HTMLElement | null) => {
    refs.current = refs.current.filter(ref => ref !== element);
  };

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.current.every(ref => 
        !ref || !ref.contains(event.target as Node)
      );
      
      if (isOutside && refs.current.length > 0) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler, enabled]);

  return { addRef, removeRef };
}