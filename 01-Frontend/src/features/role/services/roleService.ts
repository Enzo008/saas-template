/**
 * Servicio completo para gestión de roles
 * Incluye operaciones CRUD + funcionalidades específicas (menús, permisos)
 */
import { ApiResponse } from '@/shared/types';
import { CrudService } from '@/shared/services/api';
import { Role } from '../types';

class RoleService extends CrudService<Role> {
  constructor() {
    super('Role', {
      idField: ['rolCod'] // Role tiene un solo campo ID
    });
  }

  /**
   * Obtiene todos los menús y permisos disponibles del sistema
   * Para ser usado en la gestión de roles
   * @param rol Rol para marcar menús/permisos asignados (opcional)
   */
  async getAllMenusAndPermissions(rol?: { rolCod?: string }): Promise<ApiResponse<{ menus: any[] }>> {
    try {
      console.log('🔄 rolService.getAllMenusAndPermissions - Rol recibido:', rol);
      const url = this.buildUrl('menus-permisos-disponibles');
      console.log('🔍 rolService.getAllMenusAndPermissions - URL construida:', url);
      
      // POST para enviar rol en el body
      const response = await this.post<{ menus: any[] }>(url, rol || {});
      console.log('✅ rolService.getAllMenusAndPermissions - Respuesta recibida:', response);
      
      return response;
    } catch (error) {
      console.error('❌ rolService.getAllMenusAndPermissions - Error:', error);
      throw error;
    }
  }
}

// Instancia única del servicio
export const roleService = new RoleService();
