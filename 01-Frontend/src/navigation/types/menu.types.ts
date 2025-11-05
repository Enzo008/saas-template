/**
 * Tipos relacionados con menús y navegación
 */

import { AuditableEntity } from "@/shared/types/utility.types";


/**
 * Interface base del menú (matching backend Menu model)
 */
export interface Menu extends AuditableEntity {
  menYea?: string;    // Menu Year
  menCod?: string;    // Menu Code
  menNam?: string;    // Menu Name
  menRef?: string;    // Menu Reference
  menIco?: string;    // Menu Icon
  menYeaPar?: string | null; // Menu Year Parent
  menCodPar?: string | null; // Menu Code Parent
}

/**
 * Menú con jerarquía (incluye hijos)
 */
export interface MenuHierarchy extends Menu {
  children: MenuHierarchy[];
  level: number;
}

/**
 * Item de navegación para UI
 */
export interface NavigationItem {
  key: string;
  label: string;
  path?: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  hidden?: boolean;
  children?: NavigationItem[];
  onClick?: () => void;
}

/**
 * Configuración de breadcrumb
 */
export interface BreadcrumbItem {
  label?: string;
  path?: string;
  icon?: string;
  active?: boolean;
  isClickable?: boolean;
}

/**
 * Estado del menú
 */
export interface MenuState {
  availableMenus: Menu[];
  hierarchicalMenus: MenuHierarchy[];
  currentPath?: string;
  expandedItems: string[];
}

/**
 * Filtros para búsqueda de menús
 */
export interface MenuFilters {
  menNam?: string;    // Menu Name 
  menRef?: string;    // Menu Reference
  menYeaPar?: string; // Menu Year Parent
  menCodPar?: string; // Menu Code Parent
  staRec?: string;    // Status Record
}
