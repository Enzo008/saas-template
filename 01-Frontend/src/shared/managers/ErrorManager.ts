/**
 * ErrorManager - Sistema unificado de manejo de errores
 * Centraliza el manejo de errores de API, validación, red y aplicación
 */

import { ERROR_MESSAGES } from '../constants/app.constants';
import logger from './Logger';

// Interfaz para el servicio de notificaciones
export interface NotificationService {
  success: (message: string, options?: any) => void;
  error: (message: string, options?: any) => void;
  info: (message: string, options?: any) => void;
  warn: (message: string, options?: any) => void;
}

// Tipos de errores
export enum ErrorType {
  API = 'api',
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

// Severidad del error
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Interfaz unificada para todos los errores
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  retryable: boolean;
  timestamp: Date;
  statusCode?: number;
  field?: string;
  originalError?: any;
  context?: Record<string, any>;
  details?: any;
}

// Interfaz para errores de validación (simplificada)
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}


// Configuración del ErrorManager
export interface ErrorManagerConfig {
  enableLogging: boolean;
  enableToasts: boolean;
  enableReporting: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  toastDuration: number;
  maxRetries: number;
  retryDelay: number;
  notificationService?: NotificationService;
}

/**
 * Manager centralizado de errores
 */
export class ErrorManager {
  private static instance: ErrorManager;
  private config: ErrorManagerConfig;
  private errorHistory: AppError[] = [];

  private constructor(config: Partial<ErrorManagerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableToasts: true,
      enableReporting: false,
      logLevel: 'error',
      toastDuration: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * Obtiene la instancia singleton
   */
  public static getInstance(config?: Partial<ErrorManagerConfig>): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager(config);
    }
    return ErrorManager.instance;
  }

  /**
   * Actualiza la configuración
   */
  public updateConfig(newConfig: Partial<ErrorManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Establece el servicio de notificaciones
   */
  public setNotificationService(service: NotificationService): void {
    this.config.notificationService = service;
  }

  /**
   * Método unificado para manejar cualquier error
   */
  public handleError(error: any, type?: ErrorType, context?: Record<string, any>): AppError {
    const errorType = type || this.detectErrorType(error);
    const message = this.extractErrorMessage(error);
    const severity = this.determineSeverity(errorType, error);

    const appError: AppError = {
      type: errorType,
      severity,
      message,
      userMessage: this.generateUserMessage(errorType, message),
      retryable: this.isRetryableError(error),
      timestamp: new Date(),
      originalError: error,
      ...(context && { context }),
      ...(error?.response?.status && { statusCode: error.response.status }),
      ...(error?.apiResponse?.statusCode && { statusCode: error.apiResponse.statusCode }),
      ...(error?.response?.data?.field && { field: error.response.data.field }),
      ...(error?.field && { field: error.field }),
      ...(error?.response?.data && { details: error.response.data }),
      ...(error?.details && { details: error.details })
    };

    this.processError(appError);
    return appError;
  }

  /**
   * Detecta automáticamente el tipo de error
   */
  private detectErrorType(error: any): ErrorType {
    if (error?.response?.status === 401) return ErrorType.AUTHENTICATION;
    if (error?.response?.status === 403) return ErrorType.AUTHORIZATION;
    if (error?.response?.status === 404) return ErrorType.NOT_FOUND;
    if (error?.response?.status === 409) return ErrorType.CONFLICT;
    if (error?.code === 'ECONNABORTED') return ErrorType.TIMEOUT;
    if (!error?.response) return ErrorType.NETWORK;
    if (error?.response?.status >= 400) return ErrorType.API;
    return ErrorType.UNKNOWN;
  }

  /**
   * Procesa y registra el error
   */
  public processError(error: AppError): void {
    // Agregar al historial
    this.addToHistory(error);

    // Log del error
    if (this.config.enableLogging) {
      this.logError(error);
    }

    // Mostrar notificación
    if (this.config.enableToasts) {
      this.showToast(error);
    }

    // Reportar error
    if (this.config.enableReporting) {
      this.reportError(error);
    }
  }

  /**
   * Registra el error en consola
   */
  private logError(error: AppError): void {
    const context = {
      type: error.type,
      severity: error.severity,
      retryable: error.retryable,
      ...error.context
    };

    logger.error(error.message, error.originalError, context);
  }

  /**
   * Muestra notificación al usuario
   */
  private showToast(error: AppError): void {
    if (!this.config.enableToasts || !this.config.notificationService) {
      // Si no hay servicio de notificaciones configurado, no hacemos nada
      return;
    }

    const toastType = this.getToastType(error.severity);
    const message = error.userMessage;
    const service = this.config.notificationService;

    // Mostrar notificación con el tipo adecuado
    switch (toastType) {
      case 'error':
        service.error(message);
        break;
      case 'warn':
        service.warn(message);
        break;
      default:
        service.info(message);
    }
  }

  /**
   * Reporta el error a servicios externos
   */
  private reportError(error: AppError): void {
    // Implementar integración con servicios de monitoreo
    // como Sentry, LogRocket, etc.
    console.warn('Error reporting not implemented:', error);
  }

  /**
   * Agrega error al historial
   */
  private addToHistory(error: AppError): void {
    this.errorHistory.push(error);
    
    // Mantener solo los últimos 100 errores
    if (this.errorHistory.length > 100) {
      this.errorHistory = this.errorHistory.slice(-100);
    }
  }

  /**
   * Obtiene el historial de errores
   */
  public getErrorHistory(): AppError[] {
    return [...this.errorHistory];
  }

  /**
   * Limpia el historial de errores
   */
  public clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Obtiene sugerencias para resolver un error
   */
  public getErrorSuggestions(error: AppError): string[] {
    const suggestions: string[] = [];

    switch (error.type) {
      case ErrorType.NETWORK:
        suggestions.push('Verifica tu conexión a internet');
        suggestions.push('Intenta recargar la página');
        break;
      case ErrorType.API:
        suggestions.push('Intenta la operación nuevamente');
        suggestions.push('Contacta al administrador si persiste');
        break;
      case ErrorType.VALIDATION:
        suggestions.push('Revisa los datos ingresados');
        suggestions.push('Verifica que todos los campos requeridos estén completos');
        break;
      case ErrorType.AUTHENTICATION:
        suggestions.push('Inicia sesión nuevamente');
        suggestions.push('Verifica tus credenciales');
        break;
      case ErrorType.AUTHORIZATION:
        suggestions.push('No tienes permisos para esta acción');
        suggestions.push('Contacta al administrador');
        break;
    }

    return suggestions;
  }

  /**
   * Determina si un error es recuperable
   */
  private isRetryableError(error: any): boolean {
    if (error?.response?.status) {
      const status = error.response.status;
      // Errores 5xx y algunos 4xx son recuperables
      return status >= 500 || status === 408 || status === 429;
    }
    
    // Errores de red son recuperables
    if (!error?.response) {
      return true;
    }

    return false;
  }

  /**
   * Extrae el mensaje de error
   */
  private extractErrorMessage(error: any): string {
    // Errores de BaseApiService (nueva arquitectura)
    if (error?.apiResponse?.message) return error.apiResponse.message;
    
    // Errores de Axios tradicionales
    if (error?.response?.data?.message) return error.response.data.message;
    
    // Errores simples
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.response?.statusText) return error.response.statusText;
    
    return ERROR_MESSAGES.GENERIC;
  }

  /**
   * Determina la severidad del error
   */
  private determineSeverity(type: ErrorType, error: any): ErrorSeverity {
    switch (type) {
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return ErrorSeverity.HIGH;
      case ErrorType.API:
        // Errores de BaseApiService (nueva arquitectura)
        const apiStatus = error?.apiResponse?.statusCode;
        if (apiStatus) {
          if (apiStatus >= 500) return ErrorSeverity.HIGH;
          if (apiStatus >= 400) return ErrorSeverity.MEDIUM;
          return ErrorSeverity.LOW;
        }
        
        // Errores de Axios tradicionales
        const status = error?.response?.status;
        if (status >= 500) return ErrorSeverity.HIGH;
        if (status >= 400) return ErrorSeverity.MEDIUM;
        return ErrorSeverity.LOW;
      case ErrorType.NETWORK:
        return ErrorSeverity.MEDIUM;
      case ErrorType.VALIDATION:
        return ErrorSeverity.LOW;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Genera mensaje amigable para el usuario
   */
  private generateUserMessage(type: ErrorType, message: string): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Problema de conexión. Verifica tu internet e intenta nuevamente.';
      case ErrorType.AUTHENTICATION:
        return 'Error de autenticación. Por favor, inicia sesión nuevamente.';
      case ErrorType.AUTHORIZATION:
        return 'No tienes permisos para realizar esta acción.';
      case ErrorType.VALIDATION:
        return 'Por favor, revisa los datos ingresados.';
      case ErrorType.NOT_FOUND:
        return 'El recurso solicitado no fue encontrado.';
      case ErrorType.CONFLICT:
        return 'Ya existe un registro con estos datos.';
      case ErrorType.TIMEOUT:
        return 'La operación tardó demasiado tiempo. Intenta nuevamente.';
      case ErrorType.API:
        // Para errores de API, usar el mensaje del servidor si está disponible y es claro
        if (message && message !== 'Error' && !message.includes('undefined')) {
          return message;
        }
        return 'Ha ocurrido un error en el servidor. Intenta nuevamente.';
      default:
        return message || 'Ha ocurrido un error inesperado.';
    }
  }

  /**
   * Obtiene el tipo de toast según la severidad
   */
  private getToastType(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      default:
        return 'info';
    }
  }
}
/**
 * Verifica si un error debe ser reintentado
 */
export function shouldRetryError(error: any): boolean {
  const errorManager = ErrorManager.getInstance();
  return errorManager['isRetryableError'](error);
}

/**
 * Reintenta una función con backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetryError(error)) {
        throw error;
      }

      // Backoff exponencial con jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Muestra un error al usuario
 */
export function showError(error: any, customMessage?: string): void {
  const errorManager = ErrorManager.getInstance();
  
  if (customMessage) {
    const appError = errorManager.handleError(error, ErrorType.UNKNOWN, { customMessage });
    appError.userMessage = customMessage;
    errorManager.processError(appError);
  } else {
    errorManager.handleError(error);
  }
}

/**
 * Wrapper para funciones con manejo de errores
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  customErrorMessage?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      showError(error, customErrorMessage);
      throw error;
    }
  };
}

// Instancia global del ErrorManager
const errorManager = ErrorManager.getInstance();

// Hook simplificado para usar el ErrorManager en componentes React
export function useErrorManager() {
  return {
    handleError: (error: any, type?: ErrorType, context?: Record<string, any>) => 
      errorManager.handleError(error, type, context),
    getErrorHistory: () => 
      errorManager.getErrorHistory(),
    clearErrorHistory: () => 
      errorManager.clearErrorHistory()
  };
}

// Exportar instancia por defecto
export default errorManager;