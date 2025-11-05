/**
 * AuthController - Controlador optimizado para autenticación
 * Maneja la coordinación entre servicio, store y navegación
 */

import { LoginRequest } from '@/auth/types';
import { authService } from '@/auth/services/authService';
import { useAuthStore } from '@/auth/store/authStore';
import { useMenuStore } from '@/navigation/store/menuStore';
import { storage } from '@/auth/utils/storage.utils';

export const authController = {
  /**
   * Iniciar sesión
   */
  login: async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    
    // Actualizar stores
    useMenuStore.getState().setMenus(response.user.menus || []);
    useAuthStore.getState().setAuth({
      user: response.user,
      isAuthenticated: true,
      lastActivity: Date.now()
    });
    
    return response;
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    try {
      await authService.logout();
    } finally {
      // Siempre limpiar el estado, incluso si falla el logout en el backend
      useMenuStore.getState().clearMenus();
      useAuthStore.getState().clearAuth();
    }
  },

  /**
   * Validar token actual
   */
  validateToken: async () => {
    try {
      const response = await authService.validateToken();
      
      if (response.success && response.data?.user) {
        // Actualizar stores con datos frescos
        useMenuStore.getState().setMenus(response.data.user.menus || []);
        useAuthStore.getState().setAuth({
          user: response.data.user,
          isAuthenticated: true,
          lastActivity: Date.now()
        });
        
        return response;
      } else {
        // Si no hay datos válidos, cerrar sesión
        await authController.logout();
        throw new Error('Token inválido');
      }
    } catch (error) {
      // En caso de error, limpiar sesión
      await authController.logout();
      throw error;
    }
  },

  /**
   * Renovar token automáticamente
   */
  renewToken: async (): Promise<boolean> => {
    try {
      await authController.validateToken();
      return true;
    } catch (error) {
      console.warn('Error al renovar token:', error);
      return false;
    }
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (newPassword: string) => {
    const response = await authService.changePassword(newPassword);
    
    if (response.success) {
      // Después de cambiar la contraseña exitosamente, cerrar sesión
      await authController.logout();
    }
    
    return response;
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated: (): boolean => {
    return authService.isAuthenticated() && useAuthStore.getState().isAuthenticated;
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: () => {
    return useAuthStore.getState().user || authService.getStoredUser();
  },

  /**
   * Verificar si el token necesita renovación
   */
  shouldRenewToken: (): boolean => {
    return authService.isTokenExpiringSoon();
  },

  /**
   * Actualizar última actividad
   */
  updateActivity: () => {
    storage.setLastActivity();
    useAuthStore.getState().setAuth({
      lastActivity: Date.now()
    });
  },

  /**
   * Inicializar autenticación desde storage
   */
  initializeAuth: async (): Promise<boolean> => {
    try {
      const token = storage.getToken();
      const user = storage.getUser();
      
      if (!token || !user) {
        return false;
      }

      // Validar token con el servidor
      await authController.validateToken();
      return true;
    } catch (error) {
      console.warn('Error al inicializar autenticación:', error);
      return false;
    }
  }
};
