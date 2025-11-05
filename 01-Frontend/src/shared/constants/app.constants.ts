/**
 * Application Constants
 * Constantes centralizadas de la aplicación
 */

export const APP_CONFIG = {
  // Configuración de paginación por defecto
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
  },

  // Configuración de formularios
  FORMS: {
    DEBOUNCE_DELAY: 300,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },

  // Configuración de API
  API: {
    TIMEOUT: 30000, // 30 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },

  // Configuración de UI
  UI: {
    TOAST_DURATION: 4000,
    MODAL_ANIMATION_DURATION: 200,
    SIDEBAR_WIDTH: 280,
    HEADER_HEIGHT: 64,
  },

  // Configuración de validación
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_TEXT_LENGTH: 255,
    MAX_TEXTAREA_LENGTH: 1000,
  },
} as const;

export const ERROR_MESSAGES = {
  GENERIC: 'Ha ocurrido un error inesperado',
  NETWORK: 'Error de conexión. Verifique su conexión a internet',
  TIMEOUT: 'La operación tardó demasiado tiempo. Intente nuevamente',
  UNAUTHORIZED: 'No tiene permisos para realizar esta acción',
  NOT_FOUND: 'El recurso solicitado no fue encontrado',
  VALIDATION: 'Por favor, corrija los errores en el formulario',
  CONFLICT: 'El registro ya existe o hay un conflicto con los datos',
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  FILE_TYPE_NOT_ALLOWED: 'Tipo de archivo no permitido',
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: 'Registro creado exitosamente',
  UPDATED: 'Registro actualizado exitosamente',
  DELETED: 'Registro eliminado exitosamente',
  SAVED: 'Cambios guardados exitosamente',
  FILE_UPLOADED: 'Archivo subido exitosamente',
} as const;