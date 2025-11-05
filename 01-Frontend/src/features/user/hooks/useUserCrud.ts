/**
 * CRUD hook for users con funcionalidad completa
 * Incluye operaciones CRUD estándar + funcionalidades específicas de usuarios
 */
import { createCrudHook } from '@/shared/hooks';
import { userService } from '../services/userService';
import { User } from '../types/user.types';

/**
 * CRUD hook for users con configuración automática y métodos personalizados
 * Preset: DYNAMIC (datos que cambian frecuentemente)
 * Métodos custom: getAllMenusAndPermissions
 */
export const useUserCrud = createCrudHook<
  User,
  {
    getAllMenusAndPermissions: (
      user?: { useYea?: string; useCod?: string; rolCod?: string }
    ) => Promise<any[] | { menus: any[] } | null>;
  },
  typeof userService
>({
  entityName: 'User',
  service: userService,
  preset: 'DYNAMIC',
  customMethods: {
    /**
     * Obtener todos los menús y permisos disponibles del sistema
     * @param user Usuario para marcar menús/permisos asignados (opcional)
     */
    getAllMenusAndPermissions: (service) => async (user) => {
      try {
        const response = await service.getAllMenusAndPermissions(user);
        if (response.success && response.data) {
          return response.data;
        }
        console.warn('⚠️ getAllMenusAndPermissions - Respuesta sin datos válidos');
        return null;
      } catch (err) {
        console.error('❌ getAllMenusAndPermissions - Error:', err);
        return null;
      }
    }
  }
});