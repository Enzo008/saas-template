/**
 * Tipos para la gestión de roles
 * Basado en las tablas: TB_ROL, TV_ROL_MENU, TV_ROL_PERMISO
 */

import { AuditableEntity } from "@/shared/types/utility.types";

// Tipo base para Role (similar a User)
export interface Role extends AuditableEntity {
  rolCod: string;
  rolNam: string;
}

// Tipo para formulario de rol
export interface RoleFormData {
  rolCod?: string;
  rolNam: string;
  menus?: RoleMenuPermission[];
}

// Tipo para la relación rol-menú-permiso (similar a UserMenuPermission)
export interface RoleMenuPermission {
  menu: {
    menYea: string;
    menCod: string;
    menNam: string;
    menIco?: string;
    menRut?: string;
    menYeaPar?: string | null;
    menCodPar?: string | null;
    menOrd?: string;
  };
  permissions: {
    permission: {
      perCod: string;
      perNam: string;
      perIco?: string;
      perDes?: string;
    };
    hasActive: boolean;
  }[];
  hasActive: boolean; // Si el menú está activo para este rol
}
