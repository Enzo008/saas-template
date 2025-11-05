/**
 * Cliente HTTP centralizado para toda la aplicación
 * Maneja autenticación JWT, interceptores, progreso y control de peticiones
 */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '@/shared/config/env';
import { AUTH_STORAGE_KEYS } from '@/auth/utils/storage.utils';
import { ApiResponse } from '@/shared/types';


// Clase para gestionar las peticiones HTTP con soporte para AbortController
class ApiClient {
    private instance: AxiosInstance;
    private abortControllers: Map<string, AbortController> = new Map();

    constructor() {
        this.instance = axios.create({
            baseURL: `${env.apiBaseUrl}/api`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        });

        // Interceptor para agregar el token a todas las peticiones
        this.instance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
                if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                
                // Solo en desarrollo, mostrar información sobre la solicitud
                if (env.isDevelopment) {
                    // console.log(`Enviando solicitud a: ${config.url}`);
                    // console.log(`Con token: ${token.substring(0, 20)}...`);
                }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Interceptor para manejar respuestas y errores
        this.instance.interceptors.response.use(
            (response) => response,
            (error) => {
                // Si el error es debido a una cancelación, no mostrar mensaje de error
                // if (axios.isCancel(error)) {
                //     console.log('Solicitud cancelada:', error.message);
                //     return Promise.reject(error);
                // }

                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 401) {
                    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Método para generar una clave única para cada petición
    private getRequestKey(config: AxiosRequestConfig): string {
        const { method = 'GET', url = '', params = {}, data = {} } = config;
        return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
    }

    /**
     * Cancela todas las peticiones pendientes
     * Útil cuando se navega entre páginas para evitar que las peticiones
     * anteriores sigan ejecutándose
     */
    public cancelAllRequests(): void {
        if (this.abortControllers.size === 0) {
            // console.log('No hay peticiones pendientes para cancelar');
            return;
        }
        
        // console.log(`Cancelando ${this.abortControllers.size} peticiones pendientes...`);
        this.abortControllers.forEach((controller) => {
            controller.abort();
        });
        this.abortControllers.clear();
    }

    // Método para cancelar peticiones específicas por URL
    public cancelRequestsByUrl(url: string): void {
        this.abortControllers.forEach((controller, key) => {
            if (key.includes(url)) {
                controller.abort();
                this.abortControllers.delete(key);
            }
        });
    }

    // Método para cancelar una petición específica por su clave
    private cancelRequest(key: string): void {
        const controller = this.abortControllers.get(key);
        if (controller) {
            controller.abort();
            this.abortControllers.delete(key);
        }
    }

    // Método para realizar una petición con soporte para cancelación
    private async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
        const key = this.getRequestKey(config);
    
        // Cancelar solo la petición anterior con la misma clave si existe
        this.cancelRequest(key);
    
        // Crear un nuevo AbortController para esta petición
        const controller = new AbortController();
        this.abortControllers.set(key, controller);
    
        try {
            const response = await this.instance.request<ApiResponse<T>>({
                ...config,
                signal: controller.signal
            });
            
            // Limpiar el AbortController después de completar la petición
            this.abortControllers.delete(key);
            
            return response;
        } catch (error) {
            // Limpiar el AbortController en caso de error
            this.abortControllers.delete(key);
            throw error;
        }
    }

    // Métodos públicos para realizar peticiones - Simplificados
    public async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.request<T>({ 
            method: 'GET', 
            url, 
            params,
            ...config
        });
        return response.data;
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.request<T>({ 
            method: 'POST', 
            url, 
            data,
            ...config
        });
        return response.data;
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.request<T>({ 
            method: 'PUT', 
            url, 
            data,
            ...config
        });
        return response.data;
    }

    public async delete<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.request<T>({ 
            method: 'DELETE', 
            url, 
            data,
            ...config
        });
        return response.data;
    }

    // Método para obtener la instancia de axios subyacente (para compatibilidad)
    public getInstance(): AxiosInstance {
        return this.instance;
    }
}

// Exportar una instancia única del cliente API
export const apiClient = new ApiClient();
