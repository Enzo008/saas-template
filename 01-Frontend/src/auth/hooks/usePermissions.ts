import { useState, useEffect, useCallback, useMemo } from 'react';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface User {
  id: string;
  roles: string[];
  permissions?: string[];
}

interface UsePermissionsOptions {
  user?: User;
  roles?: Role[];
  permissions?: Permission[];
  onPermissionDenied?: (permission: string, resource?: string, action?: string) => void;
}

/**
 * Hook para manejar permisos y autorización
 * Útil para control de acceso, roles, permisos granulares
 */
export function usePermissions(options: UsePermissionsOptions = {}) {
  const {
    user,
    roles = [],
    permissions = [],
    onPermissionDenied
  } = options;

  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  // Calcular permisos del usuario basado en roles
  useEffect(() => {
    if (!user) {
      setUserPermissions([]);
      return;
    }

    const rolePermissions = user.roles.flatMap(roleId => {
      const role = roles.find(r => r.id === roleId);
      return role ? role.permissions : [];
    });

    const allPermissions = [
      ...rolePermissions,
      ...(user.permissions || [])
    ];

    // Eliminar duplicados
    setUserPermissions([...new Set(allPermissions)]);
  }, [user, roles]);

  const hasPermission = useCallback((
    permissionId: string,
    resource?: string,
    action?: string,
    context?: Record<string, any>
  ): boolean => {
    if (!user) return false;

    // Verificar si el usuario tiene el permiso específico
    if (userPermissions.includes(permissionId)) {
      const permission = permissions.find(p => p.id === permissionId);
      
      // Si no hay condiciones, permitir
      if (!permission?.conditions) return true;
      
      // Evaluar condiciones si existen
      return evaluateConditions(permission.conditions, context || {});
    }

    // Verificar permisos por recurso y acción
    if (resource && action) {
      const resourcePermission = permissions.find(p => 
        p.resource === resource && 
        p.action === action &&
        userPermissions.includes(p.id)
      );

      if (resourcePermission) {
        return !resourcePermission.conditions || 
               evaluateConditions(resourcePermission.conditions, context || {});
      }
    }

    return false;
  }, [user, userPermissions, permissions]);

  const hasAnyPermission = useCallback((
    permissionIds: string[],
    resource?: string,
    action?: string,
    context?: Record<string, any>
  ): boolean => {
    return permissionIds.some(permissionId => 
      hasPermission(permissionId, resource, action, context)
    );
  }, [hasPermission]);

  const hasAllPermissions = useCallback((
    permissionIds: string[],
    resource?: string,
    action?: string,
    context?: Record<string, any>
  ): boolean => {
    return permissionIds.every(permissionId => 
      hasPermission(permissionId, resource, action, context)
    );
  }, [hasPermission]);

  const checkPermission = useCallback((
    permissionId: string,
    resource?: string,
    action?: string,
    context?: Record<string, any>
  ): boolean => {
    const allowed = hasPermission(permissionId, resource, action, context);
    
    if (!allowed) {
      onPermissionDenied?.(permissionId, resource, action);
    }
    
    return allowed;
  }, [hasPermission, onPermissionDenied]);

  const canAccess = useCallback((resource: string, action: string = 'read'): boolean => {
    return hasPermission('', resource, action);
  }, [hasPermission]);

  const getPermissionsForResource = useCallback((resource: string): Permission[] => {
    return permissions.filter(p => 
      p.resource === resource && userPermissions.includes(p.id)
    );
  }, [permissions, userPermissions]);

  const userRoles = useMemo(() => {
    if (!user) return [];
    return roles.filter(role => user.roles.includes(role.id));
  }, [user, roles]);

  return {
    userPermissions,
    userRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    canAccess,
    getPermissionsForResource,
    isAuthenticated: !!user
  } as const;
}

/**
 * Hook para manejar permisos de UI (mostrar/ocultar elementos)
 */
export function useUIPermissions(permissions: ReturnType<typeof usePermissions>) {
  const checkPermission = useCallback((
    permission?: string,
    resource?: string,
    action?: string,
    context?: Record<string, any>
  ): boolean => {
    return permission 
      ? permissions.hasPermission(permission, resource, action, context)
      : permissions.canAccess(resource || '', action || 'read');
  }, [permissions]);

  const shouldShow = useCallback((
    permission?: string,
    resource?: string,
    action?: string,
    context?: Record<string, any>
  ): boolean => {
    return checkPermission(permission, resource, action, context);
  }, [checkPermission]);

  return {
    checkPermission,
    shouldShow
  } as const;
}

// Helper function para evaluar condiciones
function evaluateConditions(
  conditions: Record<string, any>,
  context: Record<string, any>
): boolean {
  return Object.entries(conditions).every(([key, expectedValue]) => {
    const contextValue = context[key];
    
    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(contextValue);
    }
    
    if (typeof expectedValue === 'object' && expectedValue !== null) {
      // Operadores especiales
      if (expectedValue.$gt !== undefined) {
        return contextValue > expectedValue.$gt;
      }
      if (expectedValue.$lt !== undefined) {
        return contextValue < expectedValue.$lt;
      }
      if (expectedValue.$in !== undefined) {
        return expectedValue.$in.includes(contextValue);
      }
      if (expectedValue.$nin !== undefined) {
        return !expectedValue.$nin.includes(contextValue);
      }
    }
    
    return contextValue === expectedValue;
  });
}