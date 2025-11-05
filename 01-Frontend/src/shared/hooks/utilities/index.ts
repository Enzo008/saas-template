/**
 * Utility Hooks - Hooks utilitarios y de propósito general  
 * Solo exports de hooks que realmente existen
 */

// Configuración de app
export { useAppSettings } from './useAppSettings';

// Persistencia inteligente
export { 
  useSmartPersistence
} from './useSmartPersistence';

export type {
  SmartPersistenceConfig,
  SmartPersistenceState,
  SmartPersistenceActions
} from './useSmartPersistence';

// Estado asíncrono avanzado
export {
  useAdvancedAsyncState
} from './useAdvancedAsyncState';

export type {
  AsyncOperationConfig,
  AsyncState,
  AsyncActions
} from './useAdvancedAsyncState';