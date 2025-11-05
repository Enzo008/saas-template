/**
 * Utilidades de error para autenticación
 * Integradas con ErrorManager para manejo consistente
 */

import { ERROR_MESSAGES } from './constants';

/**
 * Extrae mensaje de error de diferentes tipos de error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  // Si es un error de API con apiResponse
  if (error && typeof error === 'object' && 'apiResponse' in error) {
    const apiError = error as any;
    return apiError.apiResponse?.message || ERROR_MESSAGES.LOGIN_ERROR;
  }
  
  return ERROR_MESSAGES.LOGIN_ERROR;
};

/**
 * Verifica si es un error de autenticación
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('token') ||
      message.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('sesión') ||
      message.includes('credencial')
    );
  }
  
  // Verificar por código de estado si es un error de API
  if (error && typeof error === 'object' && 'apiResponse' in error) {
    const apiError = error as any;
    const statusCode = apiError.apiResponse?.statusCode;
    return statusCode === 401 || statusCode === 403;
  }
  
  return false;
};

/**
 * Verifica si es un error de red
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('conexión') ||
      message.includes('timeout') ||
      message.includes('fetch')
    );
  }
  
  if (error && typeof error === 'object' && 'apiResponse' in error) {
    const apiError = error as any;
    return apiError.apiResponse?.statusCode === 0; // Sin respuesta del servidor
  }
  
  return false;
};

/**
 * Obtiene mensaje amigable para el usuario según el tipo de error
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  if (isNetworkError(error)) {
    return 'Problema de conexión. Verifica tu internet e intenta nuevamente.';
  }
  
  if (isAuthError(error)) {
    return 'Credenciales inválidas. Verifica tu email y contraseña.';
  }
  
  // Usar el mensaje original si está disponible
  const originalMessage = getErrorMessage(error);
  
  // Mapear mensajes técnicos a mensajes amigables
  const messageMap: Record<string, string> = {
    'Invalid credentials': 'Credenciales inválidas',
    'User not found': 'Usuario no encontrado',
    'Password incorrect': 'Contraseña incorrecta',
    'Account locked': 'Cuenta bloqueada. Contacta al administrador',
    'Token expired': 'Tu sesión ha expirado. Inicia sesión nuevamente',
    'Unauthorized': 'No tienes permisos para realizar esta acción'
  };
  
  return messageMap[originalMessage] || originalMessage || 'Error inesperado. Intenta nuevamente.';
};
