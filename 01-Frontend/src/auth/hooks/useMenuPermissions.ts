/**
 * Hook para gestión de permisos basado en menús y permisos del usuario
 * Trabaja con la estructura real del backend: Menu[] con Permission[]
 * Los permisos se cargan dinámicamente desde la BD al hacer login
 */

import { useMemo, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { Menu, Permission } from '@/features/user/types';

/**
 * Códigos de permisos estándar del sistema (REFERENCIA)
 * NOTA: Estos códigos se usan como referencia en el código.
 * Los permisos reales se cargan dinámicamente desde la BD.
 * Si agregas un nuevo permiso en la BD, agrégalo aquí también para tipado.
 */
export const PERMISSION_CODES = {
  CREATE: '01',   // Crear nuevos registros
  UPDATE: '02',   // Editar registros existentes
  DELETE: '03',   // Eliminar registros
  READ: '04',     // Leer/Ver registros
  EXPORT: '05',   // Exportar datos
  IMPORT: '06',   // Importar datos
  PRINT: '07',    // Imprimir reportes
  APPROVE: '08',  // Aprobar registros
} as const;

export type PermissionCode = typeof PERMISSION_CODES[keyof typeof PERMISSION_CODES];

/**
 * Hook principal para verificar permisos del usuario
 */
export const useMenuPermissions = () => {
  const user = useAuthStore((state) => state.user);
  
  // Obtener todos los menús del usuario con sus permisos
  const userMenus = useMemo(() => user?.menus || [], [user?.menus]);
  
  /**
   * Verificar si el usuario tiene acceso a un menú específico
   * @param menuRef - Referencia del menú (ej: 'position', 'user')
   */
  const hasMenuAccess = useCallback((menuRef: string): boolean => {
    if (!user || !userMenus.length) return false;
    
    return userMenus.some(menu => 
      menu.menRef?.toLowerCase() === menuRef.toLowerCase() && 
      menu.hasActive !== false
    );
  }, [user, userMenus]);
  
  /**
   * Obtener un menú específico por su referencia
   * @param menuRef - Referencia del menú
   */
  const getMenu = useCallback((menuRef: string): Menu | undefined => {
    return userMenus.find(menu => 
      menu.menRef?.toLowerCase() === menuRef.toLowerCase()
    );
  }, [userMenus]);
  
  /**
   * Verificar si el usuario tiene un permiso específico en un menú
   * @param menuRef - Referencia del menú (ej: 'position')
   * @param permissionCode - Código del permiso (ej: '01' para CREATE)
   * 
   * NOTA: Los permisos se cargan dinámicamente desde la BD al hacer login.
   * El backend devuelve cada permiso con su flag hasActive.
   */
  const hasPermission = useCallback((
    menuRef: string, 
    permissionCode: PermissionCode | string
  ): boolean => {
    if (!user || !userMenus.length) return false;
    
    const menu = getMenu(menuRef);
    if (!menu || menu.hasActive === false) return false;
    
    // Si el menú no tiene permisos definidos, denegar acceso
    if (!menu.permissions || menu.permissions.length === 0) return false;
    
    // Verificar si el permiso existe y está activo
    return menu.permissions.some(permission => 
      permission.perCod === permissionCode && 
      permission.hasActive !== false
    );
  }, [user, userMenus, getMenu]);
  
  /**
   * Verificar si el usuario tiene ALGUNO de los permisos especificados
   * @param menuRef - Referencia del menú
   * @param permissionCodes - Array de códigos de permisos
   */
  const hasAnyPermission = useCallback((
    menuRef: string,
    permissionCodes: (PermissionCode | string)[]
  ): boolean => {
    return permissionCodes.some(code => hasPermission(menuRef, code));
  }, [hasPermission]);
  
  /**
   * Verificar si el usuario tiene TODOS los permisos especificados
   * @param menuRef - Referencia del menú
   * @param permissionCodes - Array de códigos de permisos
   */
  const hasAllPermissions = useCallback((
    menuRef: string,
    permissionCodes: (PermissionCode | string)[]
  ): boolean => {
    return permissionCodes.every(code => hasPermission(menuRef, code));
  }, [hasPermission]);
  
  /**
   * Obtener todos los permisos de un menú
   * @param menuRef - Referencia del menú
   */
  const getMenuPermissions = useCallback((menuRef: string): Permission[] => {
    const menu = getMenu(menuRef);
    return menu?.permissions?.filter(p => p.hasActive !== false) || [];
  }, [getMenu]);
  
  // ========== HELPERS ESPECÍFICOS PARA PERMISOS COMUNES ==========
  
  /**
   * Verificar si puede CREAR en un menú
   */
  const canCreate = useCallback((menuRef: string): boolean => {
    return hasPermission(menuRef, PERMISSION_CODES.CREATE);
  }, [hasPermission]);
  
  /**
   * Verificar si puede ACTUALIZAR en un menú
   */
  const canUpdate = useCallback((menuRef: string): boolean => {
    return hasPermission(menuRef, PERMISSION_CODES.UPDATE);
  }, [hasPermission]);
  
  /**
   * Verificar si puede ELIMINAR en un menú
   */
  const canDelete = useCallback((menuRef: string): boolean => {
    return hasPermission(menuRef, PERMISSION_CODES.DELETE);
  }, [hasPermission]);
  
  /**
   * Verificar si puede LEER en un menú
   */
  const canRead = useCallback((menuRef: string): boolean => {
    return hasPermission(menuRef, PERMISSION_CODES.READ);
  }, [hasPermission]);
  
  /**
   * Verificar si puede EXPORTAR en un menú
   */
  const canExport = useCallback((menuRef: string): boolean => {
    return hasPermission(menuRef, PERMISSION_CODES.EXPORT);
  }, [hasPermission]);
  
  /**
   * Verificar si puede IMPORTAR en un menú
   */
  const canImport = useCallback((menuRef: string): boolean => {
    return hasPermission(menuRef, PERMISSION_CODES.IMPORT);
  }, [hasPermission]);
  
  /**
   * Verificar si puede IMPRIMIR en un menú
   */
  const canPrint = useCallback((menuRef: string): boolean => {
    return hasPermission(menuRef, PERMISSION_CODES.PRINT);
  }, [hasPermission]);
  
  /**
   * Verificar si puede APROBAR en un menú
   */
  const canApprove = useCallback((menuRef: string): boolean => {
    return hasPermission(menuRef, PERMISSION_CODES.APPROVE);
  }, [hasPermission]);
  
  /**
   * Obtener objeto con todos los permisos CRUD de un menú
   */
  const getCRUDPermissions = useCallback((menuRef: string) => {
    return {
      canCreate: canCreate(menuRef),
      canRead: canRead(menuRef),
      canUpdate: canUpdate(menuRef),
      canDelete: canDelete(menuRef),
    };
  }, [canCreate, canRead, canUpdate, canDelete]);
  
  return {
    // Estado
    user,
    userMenus,
    isAuthenticated: !!user,
    
    // Verificación de menús
    hasMenuAccess,
    getMenu,
    getMenuPermissions,
    
    // Verificación de permisos
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Helpers CRUD
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
    canImport,
    canPrint,
    canApprove,
    getCRUDPermissions,
  } as const;
};
