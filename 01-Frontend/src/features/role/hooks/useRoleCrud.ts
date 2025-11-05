/**
 * CRUD hook for roles con funcionalidad completa
 * Incluye operaciones CRUD estándar + funcionalidades específicas de roles
 */
import { createCrudHook } from '@/shared/hooks';
import { roleService } from '../services/roleService';
import { Role } from '../types';

/**
 * CRUD hook for roles con configuración automática y métodos personalizados
 * Preset: DYNAMIC (datos que cambian frecuentemente)
 * Métodos custom: getAllMenusAndPermissions
 */
export const useRoleCrud = createCrudHook<
  Role,
  {
    getAllMenusAndPermissions: (rol?: { rolCod?: string }) => Promise<any[] | { menus: any[] } | null>;
  },
  typeof roleService
>({
  entityName: 'Role',
  service: roleService,
  preset: 'DYNAMIC',
  customMethods: {
    /**
     * Obtener todos los menús y permisos disponibles del sistema
     * Funcionalidad específica para la gestión de roles
     * @param rol Rol para marcar menús/permisos asignados (opcional)
     */
    getAllMenusAndPermissions: (service) => async (rol) => {
      try {
        console.log('🔄 getAllMenusAndPermissions - Iniciando con rol:', rol);
        const response = await service.getAllMenusAndPermissions(rol);
        
        if (response?.success && response?.data) {
          console.log('✅ getAllMenusAndPermissions - Datos obtenidos');
          return response.data;
        } else {
          console.warn('⚠️ getAllMenusAndPermissions - Respuesta sin datos válidos');
          return null;
        }
      } catch (err) {
        console.error('❌ getAllMenusAndPermissions - Error:', err);
        return null;
      }
    }
  }
});
