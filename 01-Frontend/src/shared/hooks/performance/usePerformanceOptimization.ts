/**
 * Hook para optimizaciones de performance
 * Proporciona memoización estratégica y utilidades de rendimiento
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useDebouncedCallback } from './useDebounce';

// Interfaz para configuración de memoización
export interface MemoizationConfig {
  deps?: any[];
  maxAge?: number; // Tiempo en ms antes de invalidar cache
  maxSize?: number; // Máximo número de entradas en cache
}

// Hook para memoización avanzada con TTL
export function useAdvancedMemo<T>(
  factory: () => T,
  config: MemoizationConfig = {}
): T {
  const { deps = [], maxAge = 5 * 60 * 1000, maxSize = 100 } = config;
  
  const cacheRef = useRef(new Map<string, { value: T; timestamp: number }>());
  const depsKey = JSON.stringify(deps);

  return useMemo(() => {
    const cache = cacheRef.current;
    const now = Date.now();
    
    // Limpiar entradas expiradas
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        cache.delete(key);
      }
    }
    
    // Limpiar cache si excede el tamaño máximo
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    
    // Verificar si tenemos valor en cache
    const cached = cache.get(depsKey);
    if (cached && now - cached.timestamp <= maxAge) {
      return cached.value;
    }
    
    // Calcular nuevo valor y guardarlo en cache
    const value = factory();
    cache.set(depsKey, { value, timestamp: now });
    
    return value;
  }, deps);
}

// Hook para callbacks con memoización inteligente
export function useSmartCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[],
  options: {
    debounce?: number;
    throttle?: number;
    maxCalls?: number;
    resetInterval?: number;
  } = {}
): T {
  const { debounce, throttle, maxCalls, resetInterval = 60000 } = options;
  
  const callCountRef = useRef(0);
  const lastResetRef = useRef(Date.now());
  const lastCallRef = useRef(0);

  // Reset del contador de llamadas
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastResetRef.current >= resetInterval) {
        callCountRef.current = 0;
        lastResetRef.current = now;
      }
    }, resetInterval);

    return () => clearInterval(interval);
  }, [resetInterval]);

  const memoizedCallback = useCallback(callback, deps);

  const optimizedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      // Verificar límite de llamadas
      if (maxCalls && callCountRef.current >= maxCalls) {
        return;
      }
      
      // Aplicar throttling
      if (throttle && now - lastCallRef.current < throttle) {
        return;
      }
      
      callCountRef.current++;
      lastCallRef.current = now;
      
      return memoizedCallback(...args);
    },
    [memoizedCallback, throttle, maxCalls]
  ) as T;

  // Aplicar debounce si está configurado
  if (debounce) {
    const [debouncedCallback] = useDebouncedCallback(optimizedCallback, debounce);
    return debouncedCallback;
  }

  return optimizedCallback;
}

// Hook para lazy loading de componentes pesados
export function useLazyComponent<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType,
  deps: any[] = []
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component) return Component;
    
    setLoading(true);
    setError(null);
    
    try {
      const module = await importFn();
      setComponent(module.default);
      return module.default;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load component');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, deps);

  return {
    Component,
    loading,
    error,
    loadComponent,
    Fallback: fallback
  };
}

// Hook para optimización de listas grandes
export function useVirtualizedList<T>(
  items: T[],
  options: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
    getItemKey?: (item: T, index: number) => string;
  }
) {
  const { itemHeight, containerHeight, overscan = 5, getItemKey } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      key: getItemKey ? getItemKey(item, visibleRange.startIndex + index) : visibleRange.startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (visibleRange.startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, visibleRange, itemHeight, getItemKey]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange
  };
}

// Hook para batch de operaciones
export function useBatchOperations<T>(
  batchSize: number = 10,
  delay: number = 100
) {
  const batchRef = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processBatch = useCallback(async (
    processor: (batch: T[]) => Promise<void>
  ) => {
    if (batchRef.current.length === 0) return;

    setIsProcessing(true);
    const currentBatch = [...batchRef.current];
    batchRef.current = [];

    try {
      await processor(currentBatch);
    } catch (error) {
      // Re-agregar items fallidos al batch
      batchRef.current.unshift(...currentBatch);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const addToBatch = useCallback((
    item: T,
    processor: (batch: T[]) => Promise<void>
  ) => {
    batchRef.current.push(item);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Procesar inmediatamente si alcanzamos el tamaño del batch
    if (batchRef.current.length >= batchSize) {
      processBatch(processor);
      return;
    }

    // Programar procesamiento con delay
    timeoutRef.current = setTimeout(() => {
      processBatch(processor);
    }, delay);
  }, [batchSize, delay, processBatch]);

  const flushBatch = useCallback((
    processor: (batch: T[]) => Promise<void>
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return processBatch(processor);
  }, [processBatch]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    addToBatch,
    flushBatch,
    isProcessing,
    batchSize: batchRef.current.length
  };
}

// Hook para intersection observer (lazy loading de imágenes, infinite scroll)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setElement = useCallback((element: Element | null) => {
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }

    elementRef.current = element;

    if (element) {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(([entry]) => {
          setIsIntersecting(entry?.isIntersecting || false);
          setEntry(entry || null);
        }, options);
      }
      observerRef.current.observe(element);
    }
  }, [options]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    isIntersecting,
    entry,
    setElement
  };
}

// Hook para performance monitoring
export function usePerformanceMonitor(name: string) {
  const startTimeRef = useRef<number | null>(null);
  const metricsRef = useRef<{
    renderCount: number;
    averageRenderTime: number;
    maxRenderTime: number;
    minRenderTime: number;
  }>({
    renderCount: 0,
    averageRenderTime: 0,
    maxRenderTime: 0,
    minRenderTime: Infinity
  });

  const startMeasure = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endMeasure = useCallback(() => {
    if (!startTimeRef.current) return;

    const duration = performance.now() - startTimeRef.current;
    const metrics = metricsRef.current;

    metrics.renderCount++;
    metrics.maxRenderTime = Math.max(metrics.maxRenderTime, duration);
    metrics.minRenderTime = Math.min(metrics.minRenderTime, duration);
    metrics.averageRenderTime = (
      (metrics.averageRenderTime * (metrics.renderCount - 1) + duration) / 
      metrics.renderCount
    );
    startTimeRef.current = null;
  }, [name]);

  const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      averageRenderTime: 0,
      maxRenderTime: 0,
      minRenderTime: Infinity
    };
  }, []);

  // Auto-measure en cada render
  useEffect(() => {
    startMeasure();
    return endMeasure;
  });

  return {
    startMeasure,
    endMeasure,
    getMetrics,
    resetMetrics
  };
}