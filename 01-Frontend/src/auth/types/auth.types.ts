/**
 * Tipos relacionados con autenticación
 * Centraliza todas las interfaces de auth
 */

import { User } from '@/auth/types';
import { ApiResponse } from '@/shared/types';

/**
 * Datos de solicitud de login
 */
export interface LoginRequest {
  useEma: string;
  usePas: string;
  keepSession?: boolean;
}

/**
 * Respuesta de login exitoso
 */
export interface LoginResponse {
  token: string;
  user: User;
  expiresAt?: string;
  sessionType?: string;
}

/**
 * Estado de autenticación
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  lastActivity: number;
}

/**
 * Datos de sesión
 */
export interface SessionData {
  token: string;
  user: User;
  expiresAt: Date;
  sessionType: 'temporary' | 'persistent';
}

/**
 * Configuración de autenticación
 */
export interface AuthConfig {
  sessionTimeout: number; // minutos
  maxInactivity: number; // minutos
  rememberMeDuration: number; // días
  requirePasswordChange: boolean;
  maxLoginAttempts: number;
}

/**
 * Datos de validación de credenciales
 */
export interface CredentialsValidation {
  useEma: string;
  usePas: string;
}

/**
 * Resultado de validación de credenciales
 */
export interface CredentialsValidationResult {
  isValid: boolean;
  user?: User;
  message?: string;
  requiresPasswordChange?: boolean;
  attemptsRemaining?: number;
}

/**
 * Respuesta de autenticación de API
 * Movido desde shared/types/api/responses.types.ts
 */
export interface AuthResponse extends ApiResponse {
  token?: string;
  refreshToken?: string;
  expiresAt?: string;
  user?: User; // Tipado específico en lugar de any
}