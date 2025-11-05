/**
 * BaseService - Servicio base para operaciones HTTP
 * Proporciona funcionalidades HTTP básicas con manejo de errores y caché
 */

import { apiClient } from '@/shared/services/apiClient';
import { ApiResponse } from '@/shared/types';
import { retryWithBackoff } from '@/shared/managers/ErrorManager';

export interface ServiceOptions {
  /** Número de reintentos en caso de error (default: 1) */
  retryAttempts?: number;
  /** Tiempo de espera entre reintentos en ms (default: 1000) */
  retryDelay?: number;
  /** Timeout para peticiones HTTP en ms (default: 30000) */
  timeout?: number;
  /** 
   * Campos que conforman la clave primaria de la entidad
   * Ejemplos: ['carCod'] para claves simples, ['useYea', 'useCod'] para compuestas
   */
  idField?: string[];
}

export interface OperationOptions {
  skipValidation?: boolean;
  includeInactive?: boolean;
  customEndpoint?: string;
  headers?: Record<string, string>;
}

/**
 * Servicio base para operaciones HTTP - Simplificado sin cache manual
 */
export abstract class BaseService {
  protected options: ServiceOptions;

  constructor(
    protected endpoint: string,
    options: ServiceOptions = {}
  ) {
    this.options = {
      retryAttempts: 1,
      retryDelay: 1000,
      timeout: 30000,
      ...options
    };
  }

  /**
   * Obtiene los campos de ID para esta entidad
   */
  public getIdFields(): string[] {
    return this.options.idField || [];
  }


  // Manejo de respuestas
  protected handleResponse<R>(response: ApiResponse<R>, operation: string): ApiResponse<R> {
    if (!response.success) {
      const errorMessage = response.message || `Error al ${operation} ${this.endpoint}`;
      const error = new Error(errorMessage);
      (error as any).apiResponse = { ...response, operation, endpoint: this.endpoint };
      throw error;
    }
    return response;
  }

  // Métodos HTTP básicos - Simplificados sin cache
  protected async get<T>(
    url: string, 
    params?: any, 
    options: OperationOptions = {}
  ): Promise<ApiResponse<T>> {
    const operation = async () => {
      const response = await apiClient.get<T>(url, params, {
        ...(options.headers && { headers: options.headers }),
        ...(this.options.timeout && { timeout: this.options.timeout })
      });
      return this.handleResponse(response, 'obtener');
    };

    return await retryWithBackoff(operation, this.options.retryAttempts, this.options.retryDelay);
  }

  protected async post<T>(
    url: string, 
    data?: any, 
    options: OperationOptions = {}
  ): Promise<ApiResponse<T>> {
    const operation = async () => {
      const response = await apiClient.post<T>(url, data, {
        ...(options.headers && { headers: options.headers }),
        ...(this.options.timeout && { timeout: this.options.timeout })
      });
      return this.handleResponse(response, 'procesar');
    };

    return await retryWithBackoff(operation, this.options.retryAttempts, this.options.retryDelay);
  }

  protected async put<T>(
    url: string, 
    data?: any, 
    options: OperationOptions = {}
  ): Promise<ApiResponse<T>> {
    const operation = async () => {
      const response = await apiClient.put<T>(url, data, {
        ...(options.headers && { headers: options.headers }),
        ...(this.options.timeout && { timeout: this.options.timeout })
      });
      return this.handleResponse(response, 'actualizar');
    };

    return await retryWithBackoff(operation, this.options.retryAttempts, this.options.retryDelay);
  }

  protected async delete<T>(
    url: string, 
    data?: any, 
    options: OperationOptions = {}
  ): Promise<ApiResponse<T>> {
    const operation = async () => {
      const response = await apiClient.delete<T>(url, data, {
        ...(options.headers && { headers: options.headers }),
        ...(this.options.timeout && { timeout: this.options.timeout })
      });
      return this.handleResponse(response, 'eliminar');
    };

    return await retryWithBackoff(operation, this.options.retryAttempts, this.options.retryDelay);
  }

  // Utilidades
  protected buildUrl(path: string = ''): string {
    const basePath = this.endpoint.startsWith('/') ? this.endpoint : `/${this.endpoint}`;
    const fullPath = path ? `${basePath}/${path}` : basePath;
    return fullPath.replace(/\/+/g, '/'); // Eliminar barras duplicadas
  }
}
