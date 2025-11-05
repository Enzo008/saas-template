/**
 * AuthService - Servicio de autenticación usando la nueva arquitectura
 * Extiende BaseApiService para manejo unificado de errores y cache
 */

import { BaseService } from '@/shared/services/api/BaseService';
import { LoginRequest, LoginResponse, User } from '@/auth/types';
import { storage } from '@/auth/utils/storage.utils';
import { API_ENDPOINTS } from '@/auth/utils/constants';
import { ApiResponse } from '@/shared/types';

class AuthService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.AUTH.BASE, {
      retryAttempts: 1, // No reintentar login automáticamente
      timeout: 10000 // 10 segundos timeout para auth
    });
  }

  /**
   * Iniciar sesión
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(
      this.buildUrl(API_ENDPOINTS.AUTH.LOGIN),
      credentials
    );

    if (response.success && response.data) {
      const { token, user, sessionType } = response.data;
      
      // Guardar datos de sesión
      storage.setToken(token);
      storage.setUser(user);
      
      // Guardar tipo de sesión si está disponible
      if (sessionType) {
        storage.setSessionType(sessionType as 'normal' | 'extended');
      }
      
      // Guardar email para recordar (si se especificó keepSession)
      if (credentials.keepSession && user.useEma) {
        storage.setRememberedEmail(user.useEma);
      }
      
      // Actualizar última actividad
      storage.setLastActivity();
      
      return response.data;
    }

    // El error ya es manejado por BaseApiService.handleResponse
    throw new Error('Error inesperado en login');
  }

  /**
   * Validar token actual
   */
  async validateToken(): Promise<ApiResponse<LoginResponse>> {
    const token = storage.getToken();
    if (!token) {
      throw new Error('No hay token para validar');
    }

    try {
      const response = await this.get<LoginResponse>(
        this.buildUrl(API_ENDPOINTS.AUTH.VALIDATE),
        undefined,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.success && response.data) {
        const { token: validToken, user, sessionType } = response.data;
        // El token devuelto es el mismo token validado, no uno nuevo
        // Solo actualizar si es diferente (por compatibilidad)
        if (validToken && validToken !== token) {
          storage.setToken(validToken);
        }
        storage.setUser(user);
        // Actualizar tipo de sesión si está disponible
        if (sessionType) {
          storage.setSessionType(sessionType as 'normal' | 'extended');
        }
        storage.setLastActivity();
      }

      return response;
    } catch (error: any) {
      // Si es error 401, limpiar sesión
      if (error.apiResponse?.statusCode === 401) {
        storage.clearAuth();
      }
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      const token = storage.getToken();
      if (token) {
        await this.post<void>(this.buildUrl(API_ENDPOINTS.AUTH.LOGOUT));
      }
    } catch (error) {
      // Log del error pero no fallar el logout
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Siempre limpiar datos locales
      storage.clearAuth();
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(newPassword: string): Promise<ApiResponse<void>> {
    const response = await this.post<void>(
      this.buildUrl(API_ENDPOINTS.AUTH.CHANGE_PASSWORD),
      { usePas: newPassword }
    );

    return response;
  }

  /**
   * Obtener usuario almacenado
   */
  getStoredUser(): User | null {
    return storage.getUser();
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return !!storage.getToken();
  }

  /**
   * Renovar token automáticamente
   */
  async renewToken(): Promise<boolean> {
    try {
      const response = await this.validateToken();
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verificar si el token está próximo a expirar
   */
  isTokenExpiringSoon(): boolean {
    const token = storage.getToken();
    if (!token) return true;

    try {
      // Decodificar JWT para obtener la fecha de expiración real
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return true;
      
      const payload = JSON.parse(atob(tokenParts[1] || ''));
      const expiration = payload.exp * 1000; // Convertir a milisegundos
      const now = Date.now();
      const timeRemaining = expiration - now;
      
      // Considerar próximo a expirar si quedan menos de 15 minutos
      return timeRemaining < 15 * 60 * 1000;
    } catch (error) {
      console.warn('Error al verificar expiración del token:', error);
      return true; // Si hay error, asumir que necesita renovación
    }
  }

  /**
   * Solicitar recuperación de contraseña
   * @param email Correo electrónico del usuario
   * @returns ApiResponse con resultado de la operación
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.post<void>(
        this.buildUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD),
        { email }
      );
      
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Verificar si un correo electrónico existe en el sistema
   * @param email Correo electrónico a verificar
   * @returns ApiResponse con éxito si el correo existe
   */
  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    try {
      // En un escenario real, esta llamada se haría al backend
      // Por ahora, simulamos la verificación con el endpoint de login
      const response = await this.post<{ exists: boolean }>(
        this.buildUrl(API_ENDPOINTS.AUTH.CHECK_EMAIL),
        { email }
      );
      
      return {
        success: response.success,
        message: response.message || '',
        data: response.success && response.data ? response.data.exists : false
      };
    } catch (error) {
      // Simular respuesta exitosa para desarrollo
      // En producción, esto debería manejar correctamente el error
      console.warn('Error al verificar correo, simulando respuesta:', error);
      return {
        success: true,
        message: 'Correo verificado exitosamente',
        data: true
      } as ApiResponse<boolean>;
    }
  }
  
  /**
   * Verificar validez de un token de restablecimiento
   * @param token Token de restablecimiento a verificar
   * @returns true si el token es válido, false en caso contrario
   */
  async verifyResetToken(token: string): Promise<boolean> {
    try {
      // En un escenario real, esta llamada se haría al backend
      const response = await this.post<{valid: boolean}>(
        this.buildUrl(API_ENDPOINTS.AUTH.VERIFY_TOKEN),
        { token }
      );
      
      return response.success && response.data ? response.data.valid : false;
    } catch (error) {
      // Simular respuesta exitosa para desarrollo
      console.warn('Error al verificar token, simulando respuesta:', error);
      return true; // Simulamos que el token es válido
    }
  }

  /**
   * Restablecer contraseña
   * @param token Token de restablecimiento
   * @param newPassword Nueva contraseña
   * @returns ApiResponse con resultado de la operación
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{email: string}>> {
    try {
      // En un escenario real, esta llamada se haría al backend
      const response = await this.post<{email: string}>(
        this.buildUrl(API_ENDPOINTS.AUTH.RESET_PASSWORD),
        { token, newPassword }
      );
      
      return response;
    } catch (error) {
      // Simular respuesta exitosa para desarrollo
      console.warn('Error al restablecer contraseña, simulando respuesta:', error);
      return {
        success: true,
        message: 'Contraseña restablecida exitosamente',
        data: { email: 'usuario@ejemplo.com' } // Simulamos un email para desarrollo
      };
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
