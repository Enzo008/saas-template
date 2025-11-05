/**
 * Types for user management (matching backend Usuario model)
 * Includes types for CRUD and multi-step operations
 */

import { AuditableEntity } from '@/shared/types/common/base.types';

export interface User extends AuditableEntity {
  useYea: string;     // User Year
  useCod: string;     // User Code
  useNam: string;     // User Name
  useLas: string;     // User Last Name
  useSta: string;     // User Status
  useBir?: string;    // User Birth Date
  useEma: string;     // User Email
  usePho?: string;    // User Phone
  usePas?: string;    // User Password
  useImg?: string;    // User Image
  useSig?: string;    // User Signature
  useNumDoc?: string; // User Document Number
  useSex?: string;    // User Gender
  useUse?: string;    // Username
  useIp?: string;     // User IP
  useSes?: string;    // User Session
  useAva?: string;    // User Avatar
  
  // Related fields
  posCod?: string;    // Position Code
  posNam?: string;    // Position Name
  rolCod?: string;    // Role Code
  rolNam?: string;    // Role Name
  locYea?: string;    // Location Year
  locCod?: string;    // Location Code
  locNam?: string;    // Location Name
  IdeDocCod?: string; // Identity Document Code (3 chars per word: Ide-Doc-Cod)
  IdeDocNam?: string; // Identity Document Name (3 chars per word: Ide-Doc-Nam)
  IdeDocAbr?: string; // Identity Document Abbreviation (3 chars per word: Ide-Doc-Abr)
  repYea?: string;    // Repository Year
  repCod?: string;    // Repository Code
  repNam?: string;    // Repository Name
  
  // Pagination
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  
  // Multi-step specific
  includeMenusPermissions?: boolean;
  menus?: Menu[];
}

/**
 * Basic user data for step 1 of multi-step process
 */
export interface UserBasicInfo {
  useNam: string;     // User Name
  useLas: string;     // User Last Name
  useEma: string;     // User Email
  usePho?: string;    // User Phone
  useBir?: string;    // User Birth Date
  posCod?: string;    // Position Code
  rolCod?: string;    // Role Code
  locYea?: string;    // Location Year
  locCod?: string;    // Location Code
  IdeDocCod?: string; // Identity Document Code (3 chars per word: Ide-Doc-Cod)
  useSta: string;     // User Status
}

/**
 * Menu and permissions data for step 2 of multi-step process
 */
export interface UserMenusPermissions {
  selectedMenus: string[];
  permissions: Record<string, boolean>;
}

/**
 * User menu permission structure for multi-step form
 */
export interface UserMenuPermission {
  menu: Menu;
  hasActive: boolean;
  permissions: {
    permission: Permission;
    hasActive: boolean;
  }[];
}

/**
 * Menu interface (matching backend Menu model)
 */
export interface Menu {
  menYea?: string;    // Menu Year
  menCod?: string;    // Menu Code
  menYeaPar?: string; // Menu Year Parent
  menCodPar?: string; // Menu Code Parent
  menNam?: string;    // Menu Name
  menRef?: string;    // Menu Reference
  menIco?: string;    // Menu Icon
  hasActive?: boolean;
  permissions?: Permission[];
}

/**
 * Permission interface (matching backend Permiso model)
 */
export interface Permission {
  perCod?: string;    // Permission Code
  perNam?: string;    // Permission Name
  perRef?: string;    // Permission Reference
  hasActive?: boolean;
}
