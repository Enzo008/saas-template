/**
 * Navigation Services - Exportaciones centralizadas
 * NavigationManager fue eliminado - ahora se usa directamente useNavigation hook
 */

// Re-export tipos desde el hook
export type {
  NavigationRoute,
  SidebarMenu
} from '../hooks/useNavigation';

// Legacy type para compatibilidad (si es necesario)
import type { SidebarMenu } from '../hooks/useNavigation';
export type NavigationMenu = SidebarMenu;
