import { ApiResponse } from '@/shared/types';
import { apiClient } from '@/shared/services';
import { FileUploadResponse } from '../types';
import { FileStorageListFilter } from '../types/FileStorageListFilter';
import { StoredFile } from '../types/StoredFile';

export class FileStorageService {
    private readonly endpoint = 'FileStorage';

    /**
     * Sube un archivo al sistema de archivos con soporte para seguimiento de progreso
     * @param formData Datos del formulario con el archivo
     * @param onProgress Callback opcional para recibir actualizaciones de progreso (0-100)
     * @returns Respuesta con información del archivo subido
     */
    async uploadFile(
        formData: FormData, 
    ): Promise<ApiResponse<FileUploadResponse>> {
        try {
            const url = `/${this.endpoint}/upload`;
            // Usar el método normal
            return await apiClient.post<FileUploadResponse>(url, formData);
        } catch (error) {
            throw error;
        }
    }

    async deleteFile(filePath: string, customDirectory?: string): Promise<ApiResponse<any>> {
        // Asegurar que la ruta del archivo esté correctamente codificada
        const cleanFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        
        // Construir la URL con la ruta del archivo codificada
        let url = `/${this.endpoint}/${encodeURIComponent(cleanFilePath)}`;
        
        // Agregar el directorio personalizado como parámetro de consulta si está presente
        const params = customDirectory ? { customDirectory } : undefined;
        
        return await apiClient.delete<any>(url, params);
    }

    async checkFileExists(filePath: string): Promise<ApiResponse<boolean>> {
        const url = `/${this.endpoint}/FileExists/${encodeURIComponent(filePath)}`;
        return await apiClient.get<boolean>(url);
    }

    /**
     * Obtiene la lista de archivos almacenados con filtros
     * @param filter Filtros para la búsqueda
     * @returns Lista de archivos almacenados
     */
    async getStoredFiles(filter: FileStorageListFilter): Promise<ApiResponse<StoredFile[]>> {
        // Usar un endpoint diferente para la lista
        return await apiClient.post<StoredFile[]>('FileStorageList/list', filter);
    }

    /**
     * Obtiene la lista de archivos desde el sistema de archivos
     * @param customDirectory Directorio personalizado (opcional)
     * @returns Lista de archivos
     */
    async getFilesFromFileSystem(customDirectory?: string): Promise<ApiResponse<StoredFile[]>> {
        const params = customDirectory ? { customDirectory } : undefined;
        // Usar un endpoint diferente para filesystem
        return await apiClient.get<StoredFile[]>('FileStorageList/filesystem', params);
    }
}

export const fileStorageService = new FileStorageService();
