/**
 * Performance Hooks - Hooks de optimización y rendimiento
 */

export { useDebounce } from './useDebounce';
export { useOptimisticUpdates } from './useOptimisticUpdates';

// Hooks de optimización específicos
export {
  useAdvancedMemo,
  useSmartCallback,
  useLazyComponent,
  useVirtualizedList,
  useBatchOperations,
  usePerformanceMonitor
} from './usePerformanceOptimization';

// Re-export con alias para evitar conflictos
export { useIntersectionObserver as usePerformanceIntersectionObserver } from './usePerformanceOptimization';

// Tipos
export type { MemoizationConfig } from './usePerformanceOptimization';
