/**
 * CrudService - Servicio CRUD con paginación integrada
 * Extiende BaseService con operaciones CRUD completas y paginación
 */

import { BaseService, ServiceOptions, OperationOptions } from './BaseService';
import { ApiResponse } from '@/shared/types';

// Interfaces para paginación
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedSearchOptions extends OperationOptions {
  enableTotalCount?: boolean;
  optimizeForLargeDatasets?: boolean;
}

/**
 * Servicio CRUD genérico con paginación integrada
 */
export abstract class CrudService<T> extends BaseService {
  constructor(endpoint: string, options: ServiceOptions = {}) {
    super(endpoint, options);
  }

  // Operaciones CRUD básicas
  async create(data: T, options: OperationOptions = {}): Promise<ApiResponse<T>> {
    const url = options.customEndpoint || this.buildUrl();
    return this.post<T>(url, data, options);
  }

  async update(data: T, options: OperationOptions = {}): Promise<ApiResponse<T>> {
    const url = options.customEndpoint || this.buildUrl();
    return this.put<T>(url, data, options);
  }

  async remove(data: T, options: OperationOptions = {}): Promise<ApiResponse<void>> {
    const url = options.customEndpoint || this.buildUrl();
    return this.delete<void>(url, data, options);
  }

  async getById(id: Record<string, any>, options: OperationOptions = {}): Promise<ApiResponse<T>> {
    const url = options.customEndpoint || this.buildUrl('buscar');
    const response = await this.post<T[]>(url, id, options);

    if (!response.success || !response.data || response.data.length === 0) {
      throw new Error(`No se encontró el ${this.endpoint} con el ID proporcionado`);
    }

    return {
      ...response,
      data: response.data[0] as T
    };
  }

  // Búsqueda con paginación
  async searchPaginated(
    filters: Partial<T> = {},
    pagination?: PaginationParams,
    options: PaginatedSearchOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const defaultPagination: PaginationParams = {
      pageNumber: pagination?.pageNumber || 1,
      pageSize: pagination?.pageSize || 10,
      sortBy: pagination?.sortBy || undefined,
      sortOrder: pagination?.sortOrder || 'asc'
    };

    const requestData = {
      ...filters,
      ...defaultPagination,
      enableTotalCount: options.enableTotalCount ?? true,
      optimizeForLargeDatasets: options.optimizeForLargeDatasets ?? true
    };

    const url = options.customEndpoint || this.buildUrl('buscar');
    const response = await this.post<any>(url, requestData, options);

    return this.transformToPaginatedResponse(response, defaultPagination, options);
  }

  // Búsqueda simple (sin paginación)
  async search(filters: Partial<T> = {}, options: OperationOptions = {}): Promise<ApiResponse<T[]>> {
    const url = options.customEndpoint || this.buildUrl('buscar');
    return this.post<T[]>(url, filters, options);
  }

  /*async getAll(options: OperationOptions = {}): Promise<ApiResponse<T[]>> {
    const filters = options.includeInactive ? {} : { estReg: 'A' as keyof T };
    return this.search(filters as Partial<T>, options);
  }*/

  // Operaciones adicionales
  async exists(id: Record<string, any>, options: OperationOptions = {}): Promise<boolean> {
    try {
      await this.getById(id, options);
      return true;
    } catch {
      return false;
    }
  }

  async count(filters: Partial<T> = {}, options: OperationOptions = {}): Promise<number> {
    const url = options.customEndpoint || this.buildUrl('count');
    const response = await this.post<{ count: number }>(url, filters, options);
    return response.data?.count || 0;
  }

  // Transformar respuesta a formato paginado
  private transformToPaginatedResponse(
    response: ApiResponse<any>,
    pagination: PaginationParams,
    _options: PaginatedSearchOptions
  ): ApiResponse<PaginatedResponse<T>> {
    if (!response.success) {
      throw new Error(response.message || `Error al buscar ${this.endpoint}`);
    }

    const data = response.data || [];
    const totalCount = response.totalCount || data.length;
    const totalPages = Math.ceil(totalCount / pagination.pageSize);

    const paginatedData: PaginatedResponse<T> = {
      data,
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalPages,
      hasNextPage: pagination.pageNumber < totalPages,
      hasPreviousPage: pagination.pageNumber > 1
    };

    return {
      ...response,
      data: paginatedData
    };
  }
}
