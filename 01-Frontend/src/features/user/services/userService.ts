/**
 * Servicio completo para gestión de usuarios
 * Incluye operaciones CRUD + funcionalidades específicas (menús, permisos)
 */
import { ApiResponse } from '@/shared/types';
import { CrudService } from '@/shared/services/api';
import { User } from '../types/user.types';

class UserService extends CrudService<User> {
  constructor() {
    super('User', {
      idField: ['useYea', 'useCod']
    });
  }

  /**
   * Obtiene todos los menús y permisos disponibles del sistema
   * Para ser usado en el paso 2 tanto en nuevo usuario como en edición
   * @param user Usuario para marcar menús/permisos asignados (opcional)
   *             - En modo edición: { useYea, useCod } para cargar permisos del usuario
   *             - En modo creación: { rolCod } para pre-seleccionar según rol
   */
  async getAllMenusAndPermissions(user?: { useYea?: string; useCod?: string; rolCod?: string }): Promise<ApiResponse<{ menus: any[] }>> {
    try {
      const url = this.buildUrl('menus-permisos-disponibles');
      
      // Cambio de GET a POST para enviar parámetros en el body
      const response = await this.post<{ menus: any[] }>(url, user || {});
      
      return response;
    } catch (error) {
      console.error('❌ userService.getAllMenusAndPermissions - Error capturado:', error);
      throw error;
    }
  }

  /**
   * Valida las credenciales de un usuario (para login)
   * @param email Correo electrónico
   * @param password Contraseña
   */
  async validateCredentials(email: string, password: string): Promise<ApiResponse<User>> {
    const url = this.buildUrl('validate');
    return this.post<User>(url, { email, password });
  }
  
  /**
   * Cambia la contraseña de un usuario
   * @param userId ID del usuario
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse<boolean>> {
    const url = this.buildUrl('change-password');
    return this.post<boolean>(url, {
      userId,
      currentPassword,
      newPassword
    });
  }
  
  /**
   * Actualiza el avatar de un usuario
   * @param userId ID del usuario
   * @param avatarData Datos del avatar (base64)
   */
  async updateAvatar(userId: string, avatarData: string): Promise<ApiResponse<User>> {
    const url = this.buildUrl('update-avatar');
    return this.post<User>(url, {
      userId,
      avatarData
    });
  }

  /**
   * Crea un usuario con flujo multi-paso (incluye menús y permisos)
   */
  async createMultiStep(userData: User): Promise<ApiResponse<User>> {
    const url = this.buildUrl('multistep');
    return this.post<User>(url, userData);
  }

  /**
   * Actualiza un usuario con flujo multi-paso (incluye menús y permisos)
   */
  async updateMultiStep(userData: User): Promise<ApiResponse<User>> {
    const url = this.buildUrl('multistep');
    return this.put<User>(url, userData);
  }
}

// Exportamos una instancia única del servicio
export const userService = new UserService();
