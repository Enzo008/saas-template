/**
 * UI Hooks - Hooks relacionados con interfaz de usuario
 * Solo exports de hooks que realmente existen
 */

// Interacción y eventos
export { useClickOutside } from '../browser/useClickOutside';

// Media queries y responsive
export { useMediaQuery } from '../browser/useMediaQuery';
export { useIsMobile } from './useMobile';

// Notificaciones y feedback
export { useNotifications } from './useNotifications';

// Observadores
export { useIntersectionObserver } from '../browser/useIntersectionObserver';

// Tablas y modales
export { useStandardTable } from './useStandardTable';
export { useStandardModal } from './useStandardModal';