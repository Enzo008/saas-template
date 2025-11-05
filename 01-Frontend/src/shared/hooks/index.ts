/**
 * Hooks Compartidos - Exports optimizados
 * Organizados por categoría para mejor tree-shaking
 */

// ===== HOOKS CRUD =====
export * from './crud';

// ===== HOOKS DE API =====
export * from './api';

// ===== HOOKS DE BROWSER =====
export * from './browser';

// ===== HOOKS DE UI =====
export * from './ui';

// ===== HOOKS DE PERFORMANCE =====
export * from './performance';

// ===== HOOKS DE FORMULARIOS =====
export * from './forms';

// ===== HOOKS DE TEMA =====
export * from './theme';

// ===== HOOKS DE FECHA/TIEMPO =====
export * from './datetime';

// ===== HOOKS DE EMAIL =====
export * from './email';

// ===== HOOKS DE DATOS =====
// useTableHelpers removido - usar createTableDataHook en su lugar

// ===== HOOKS DE NAVEGACIÓN =====  
export { useNavigation } from '../../navigation/hooks/useNavigation';
export { useEncryptedParams, useEncryptedParamsWithOriginal } from './useEncryptedParams';
export { useSecureNavigate, useSecureNavigation, encryptUrlPath } from './useSecureNavigate';

// ===== HOOKS UTILITARIOS =====
export * from './utilities';

// ===== TRADUCCIÓN DIRECTA =====
export {
  useDirectTranslation,
  useDirectFieldTranslation,
  getDirectTranslation
} from '../utils/directTranslation';
export type {
  DirectTranslation,
  DirectFieldConfig
} from '../utils/directTranslation';

// ===== TYPES =====
export type { StandardTableProps } from './ui/useStandardTable';
export type { StandardModalProps } from './ui/useStandardModal';