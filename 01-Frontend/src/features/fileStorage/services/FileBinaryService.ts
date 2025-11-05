import { ApiResponse } from '@/shared/types';
import { apiClient } from '@/shared/services';
import { FileUploadResponse } from '../types';
import { StoredFile } from '../types/StoredFile';

export class FileBinaryService {
    private readonly endpoint = 'FileBinary';

    /**
     * Sube un archivo y lo almacena como contenido binario en la base de datos con soporte para seguimiento de progreso
     * @param formData Datos del formulario con el archivo
     * @returns Respuesta con información del archivo subido
     */
    async uploadFileToBinary(
        formData: FormData
    ): Promise<ApiResponse<FileUploadResponse>> {
        try {
            const url = `/${this.endpoint}/upload`;
            // Usar el método normal
            return await apiClient.post<FileUploadResponse>(url, formData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene información de un archivo binario almacenado en la base de datos
     * @param fileId ID del archivo
     * @returns Información del archivo
     */
    async getFileBinaryInfo(fileId: string | number): Promise<ApiResponse<StoredFile>> {
        const url = `/${this.endpoint}/info/${fileId}`;
        return await apiClient.get<StoredFile>(url);
    }

    /**
     * Descarga un archivo binario desde el servidor con soporte para seguimiento de progreso
     * @param fileId ID del archivo a descargar
     * @param onProgress Callback opcional para recibir actualizaciones de progreso (0-100)
     * @returns true si la descarga fue exitosa, false en caso contrario
     */
    async downloadFileFromBinary(
        fileId: string | number,
        onProgress?: (progress: number) => void
    ): Promise<boolean> {
        try {
            // Configurar opciones para la descarga con seguimiento de progreso
            const axiosConfig: any = {
                responseType: 'arraybuffer',
                headers: {
                    'Accept': '*/*'
                }
            };
            
            // Agregar el manejador de progreso de descarga si se proporciona un callback
            if (onProgress) {
                axiosConfig.onDownloadProgress = (progressEvent: any) => {
                    // Calcular el porcentaje de progreso
                    const percentCompleted = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    
                    // Llamar al callback con el progreso
                    onProgress(percentCompleted);
                };
            }
            
            // Configurar axios config para descarga
            const downloadConfig: any = {
                responseType: 'blob'
            };
            
            // Agregar callback de progreso solo si se provee
            if (onProgress) {
                downloadConfig.onDownloadProgress = (progressEvent: any) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                };
            }

            // Usar apiClient directamente para acceder a headers raw de axios
            const axiosResponse = await apiClient.getInstance().get(
                `FileBinary/download/${fileId}`,
                downloadConfig
            );
    
            // Determinar el tipo de contenido
            const contentType = axiosResponse.headers['content-type'] || 'application/octet-stream';
            
            // Obtener el nombre del archivo del header Content-Disposition
            const contentDisposition = axiosResponse.headers['content-disposition'];
            console.log('Content-Disposition:', contentDisposition);
            let fileName = 'archivo_descargado';
            
            if (contentDisposition) {
                // Intentar diferentes formatos de Content-Disposition
                // 1. Formato RFC 6266 (filename*)
                const filenameUtf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]*)/i);
                if (filenameUtf8Match && filenameUtf8Match[1]) {
                    fileName = decodeURIComponent(filenameUtf8Match[1]);
                } else {
                    // 2. Formato tradicional con comillas
                    const filenameQuotedMatch = contentDisposition.match(/filename="([^"]*)"/i);
                    if (filenameQuotedMatch && filenameQuotedMatch[1]) {
                        fileName = filenameQuotedMatch[1];
                    } else {
                        // 3. Formato tradicional sin comillas
                        const filenameMatch = contentDisposition.match(/filename=([^;]*)/i);
                        if (filenameMatch && filenameMatch[1]) {
                            fileName = filenameMatch[1].trim();
                        }
                    }
                }
            } else {
                // Si no hay Content-Disposition, intentar extraer un nombre del fileId
                fileName = `archivo_${fileId}.${this.getExtensionFromMimeType(contentType)}`;
            }
            
            console.log('Nombre de archivo detectado:', fileName);
            
            // Crear el blob con el tipo MIME correcto
            const blob = new Blob([axiosResponse.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
    
            // Crear y disparar el enlace de descarga con el nombre obtenido
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            
            // Indicar que la descarga está completa (100%)
            if (onProgress) {
                onProgress(100);
            }
            
            return true;
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            return false;
        }
    }
    
    /**
     * Obtiene una extensión de archivo basada en el tipo MIME
     * @param mimeType Tipo MIME del archivo
     * @returns Extensión del archivo sin el punto
     */
    private getExtensionFromMimeType(mimeType: string): string {
        const mimeToExtension: Record<string, string> = {
            'application/pdf': 'pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'text/plain': 'txt',
            'text/csv': 'csv',
            'application/json': 'json',
            'application/xml': 'xml',
            'application/zip': 'zip'
        };
        
        return mimeToExtension[mimeType] || 'bin';
    }
}

export const fileBinaryService = new FileBinaryService();
