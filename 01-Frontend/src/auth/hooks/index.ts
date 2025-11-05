/**
 * Auth Hooks - Hooks optimizados para autenticación
 */

// Hook principal de autenticación
export { useAuth } from './useAuth';

// Hook completo de manejo de sesión
export { useSession } from './useSession';

// Hook de permisos basado en menús
export { useMenuPermissions, PERMISSION_CODES } from './useMenuPermissions';
export type { PermissionCode } from './useMenuPermissions';