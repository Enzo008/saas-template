/**
 * Shared Resources Index - Tree-Shaking Optimized
 * 
 * Solo exportaciones esenciales. Para mejor performance, importa específicamente:
 * import { createCrudHook } from '@/shared/hooks/crud'
 * import { Button } from '@/shared/components/ui/button'
 * import { apiClient } from '@/shared/services/apiClient'
 */

// ===== TIPOS ESENCIALES =====
export * from './types';

// ===== MANAGERS CRÍTICOS =====
export { Logger, ErrorManager } from './managers';

// ===== PROVIDERS PRINCIPALES =====
export { AppConfigProvider, useAppConfig } from './providers/AppConfigProvider';
export { ThemeProvider, useTheme } from './providers/ThemeProvider';
export { LanguageProvider, useLanguage } from './providers/LanguageProvider';

// ===== HOOKS MÁS USADOS =====
export { useDebounce } from './hooks/performance/useDebounce';
export { useLocalStorage } from './hooks/browser/useLocalStorage';

// ===== COMPONENTES CRÍTICOS =====
export { ErrorBoundary, LoadingScreen } from './components';

// ===== CONFIGURACIÓN =====
export { createQueryClient, QUERY_PRESETS } from './config/reactQuery';