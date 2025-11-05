/**
 * Componente para proteger elementos de UI basado en permisos
 * Oculta o deshabilita elementos según los permisos del usuario
 */

import { ReactNode } from 'react';
import { useMenuPermissions, PermissionCode } from '../hooks/useMenuPermissions';

interface PermissionGuardProps {
  children: ReactNode;
  
  /** Referencia del menú (ej: 'position', 'user') */
  menuRef: string;
  
  /** Código(s) de permiso requerido */
  permission?: PermissionCode | string | (PermissionCode | string)[];
  
  /** Si true, requiere TODOS los permisos. Si false, requiere AL MENOS UNO */
  requireAll?: boolean;
  
  /** Si true, renderiza children deshabilitado en lugar de ocultarlo */
  showDisabled?: boolean;
  
  /** Mensaje a mostrar cuando no tiene permisos (tooltip, etc) */
  deniedMessage?: string;
  
  /** Componente alternativo a renderizar cuando no tiene permisos */
  fallback?: ReactNode;
}

/**
 * Guard para proteger elementos de UI basado en permisos
 * 
 * @example
 * // Ocultar botón si no tiene permiso de crear
 * <PermissionGuard menuRef="position" permission="01">
 *   <Button>Nuevo Cargo</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Deshabilitar botón si no tiene permiso de editar
 * <PermissionGuard menuRef="position" permission="02" showDisabled>
 *   <Button>Editar</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Requiere múltiples permisos (al menos uno)
 * <PermissionGuard menuRef="position" permission={["02", "03"]}>
 *   <Button>Acciones</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Requiere TODOS los permisos
 * <PermissionGuard menuRef="position" permission={["02", "03"]} requireAll>
 *   <Button>Editar y Eliminar</Button>
 * </PermissionGuard>
 */
export const PermissionGuard = ({
  children,
  menuRef,
  permission,
  requireAll = false,
  showDisabled = false,
  deniedMessage,
  fallback = null,
}: PermissionGuardProps) => {
  const { hasMenuAccess, hasPermission, hasAnyPermission, hasAllPermissions } = useMenuPermissions();
  
  // Verificar acceso al menú
  const hasAccess = hasMenuAccess(menuRef);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  // Si no se especifica permiso, solo verificar acceso al menú
  if (!permission) {
    return <>{children}</>;
  }
  
  // Verificar permisos
  let hasRequiredPermission = false;
  
  if (Array.isArray(permission)) {
    hasRequiredPermission = requireAll
      ? hasAllPermissions(menuRef, permission)
      : hasAnyPermission(menuRef, permission);
  } else {
    hasRequiredPermission = hasPermission(menuRef, permission);
  }
  
  // Si no tiene permiso
  if (!hasRequiredPermission) {
    // Mostrar fallback si está definido
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Mostrar deshabilitado
    if (showDisabled) {
      return (
        <div 
          className="opacity-50 cursor-not-allowed pointer-events-none"
          title={deniedMessage || 'No tienes permisos para esta acción'}
        >
          {children}
        </div>
      );
    }
    
    // Ocultar completamente
    return null;
  }
  
  // Tiene permiso, renderizar normalmente
  return <>{children}</>;
};

/**
 * Guard específico para botón de crear
 */
export const CreateGuard = ({ 
  children, 
  menuRef,
  showDisabled = false,
  fallback = null 
}: Omit<PermissionGuardProps, 'permission'>) => (
  <PermissionGuard 
    menuRef={menuRef} 
    permission="01" 
    showDisabled={showDisabled}
    fallback={fallback}
    deniedMessage="No tienes permiso para crear"
  >
    {children}
  </PermissionGuard>
);

/**
 * Guard específico para botón de editar
 */
export const UpdateGuard = ({ 
  children, 
  menuRef,
  showDisabled = false,
  fallback = null 
}: Omit<PermissionGuardProps, 'permission'>) => (
  <PermissionGuard 
    menuRef={menuRef} 
    permission="02" 
    showDisabled={showDisabled}
    fallback={fallback}
    deniedMessage="No tienes permiso para editar"
  >
    {children}
  </PermissionGuard>
);

/**
 * Guard específico para botón de eliminar
 */
export const DeleteGuard = ({ 
  children, 
  menuRef,
  showDisabled = false,
  fallback = null 
}: Omit<PermissionGuardProps, 'permission'>) => (
  <PermissionGuard 
    menuRef={menuRef} 
    permission="03" 
    showDisabled={showDisabled}
    fallback={fallback}
    deniedMessage="No tienes permiso para eliminar"
  >
    {children}
  </PermissionGuard>
);

/**
 * Guard para acciones de editar O eliminar (al menos una)
 */
export const EditOrDeleteGuard = ({ 
  children, 
  menuRef,
  showDisabled = false,
  fallback = null 
}: Omit<PermissionGuardProps, 'permission'>) => (
  <PermissionGuard 
    menuRef={menuRef} 
    permission={["02", "03"]} 
    requireAll={false}
    showDisabled={showDisabled}
    fallback={fallback}
    deniedMessage="No tienes permisos para editar o eliminar"
  >
    {children}
  </PermissionGuard>
);
