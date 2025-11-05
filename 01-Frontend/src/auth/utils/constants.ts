/**
 * Constantes del módulo de autenticación
 */

export const API_ENDPOINTS = {
  AUTH: {
    BASE: '/Authentication',
    LOGIN: '/login',
    VALIDATE: '/validate',
    LOGOUT: '/logout',
    CHANGE_PASSWORD: '/change-password',
    FORGOT_PASSWORD: '/forgot-password',
    CHECK_EMAIL: '/check-email',
    RESET_PASSWORD: '/reset-password',
    REQUEST_RESET: '/request-reset',
    VERIFY_TOKEN: '/verify-token'
  }
} as const;

// Tiempos de sesión en milisegundos
export const SESSION_TIMES = {
  NORMAL_SESSION: 8 * 60 * 60 * 1000,      // 8 horas
  EXTENDED_SESSION: 30 * 24 * 60 * 60 * 1000, // 30 días
  WARNING_TIME: 5 * 60 * 1000,             // 5 minutos antes de expirar
  RENEWAL_THRESHOLD: 15 * 60 * 1000,       // Renovar si quedan menos de 15 min
  CHECK_INTERVAL: 60 * 1000,               // Verificar cada minuto
  RENEWAL_INTERVAL: 10 * 60 * 1000         // Intentar renovar cada 10 minutos
} as const;

// Mensajes de error (mantenidos para compatibilidad)
export const ERROR_MESSAGES = {
  NO_TOKEN: 'No hay token de sesión',
  LOGIN_ERROR: 'Error al iniciar sesión',
  LOGOUT_ERROR: 'Error al cerrar sesión',
  VALIDATION_ERROR: 'Error al validar el token',
  CHANGE_PASSWORD_ERROR: 'Error al cambiar contraseña',
  SESSION_EXPIRED: 'Tu sesión ha expirado',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  NETWORK_ERROR: 'Error de conexión',
  EMAIL_NOT_FOUND: 'El correo electrónico no está registrado',
  RESET_TOKEN_INVALID: 'El token de restablecimiento es inválido o ha expirado',
  RESET_PASSWORD_ERROR: 'Error al restablecer la contraseña'
} as const;

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  LOGIN: 'Inicio de sesión exitoso',
  LOGOUT: 'Sesión cerrada exitosamente',
  CHANGE_PASSWORD: 'Contraseña cambiada exitosamente',
  TOKEN_RENEWED: 'Sesión renovada automáticamente',
  RESET_EMAIL_SENT: 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña',
  PASSWORD_RESET: 'Contraseña restablecida exitosamente'
} as const;

// Configuración de validación
export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: 'El correo electrónico es requerido',
    INVALID: 'Formato de correo electrónico inválido'
  },
  PASSWORD: {
    REQUIRED: 'La contraseña es requerida',
    MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres',
    MAX_LENGTH: 'La contraseña no puede tener más de 50 caracteres',
    UPPERCASE: 'La contraseña debe tener al menos una letra mayúscula',
    LOWERCASE: 'La contraseña debe tener al menos una letra minúscula',
    NUMBER: 'La contraseña debe tener al menos un número',
    SPECIAL: 'La contraseña debe tener al menos un carácter especial',
    MATCH: 'Las contraseñas no coinciden'
  }
} as const;
