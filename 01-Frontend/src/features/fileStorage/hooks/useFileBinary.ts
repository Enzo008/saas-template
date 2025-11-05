import { useState, useCallback } from 'react';
import { fileBinaryService } from '../services/FileBinaryService';
import { FileUploadRequest, FileUploadResponse } from '../types';
import { StoredFile } from '../types/StoredFile';

export interface FileBinaryState {
  isLoading: boolean;
  error: string | null;
  uploadResult: any | null;
}

// Interfaz para el progreso de carga y descarga
interface FileProgressState {
  fileName: string;
  progress: number;
  status: 'uploading' | 'downloading' | 'success' | 'error';
  error?: string;
}

export const useFileBinary = () => {
  const [state, setState] = useState<FileBinaryState>({
    isLoading: false,
    error: null,
    uploadResult: null
  });
  
  // Estado para el progreso de carga
  const [uploadProgress, setUploadProgress] = useState<FileProgressState | null>(null);
  
  // Estado para el progreso de descarga
  const [downloadProgress, setDownloadProgress] = useState<FileProgressState | null>(null);

  /**
   * Sube un archivo y lo almacena como contenido binario en la base de datos
   * con seguimiento de progreso
   */
  const uploadFileToBinary = async (request: FileUploadRequest): Promise<FileUploadResponse | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, uploadResult: null }));
    
    // Inicializar el progreso de carga
    setUploadProgress({
      fileName: request.file.name,
      progress: 0,
      status: 'uploading'
    });

    try {
      const formData = new FormData();
      formData.append('file', request.file);
      
      // Añadir todos los parámetros opcionales al FormData
      if (request.fileType) formData.append('fileType', request.fileType);
      if (request.maxFileSize) formData.append('maxFileSize', request.maxFileSize.toString());
      if (request.maxWidth) formData.append('maxWidth', request.maxWidth.toString());
      if (request.maxHeight) formData.append('maxHeight', request.maxHeight.toString());
      if (request.compressImage !== undefined) formData.append('compressImage', request.compressImage.toString());
      if (request.compressionQuality) formData.append('compressionQuality', request.compressionQuality.toString());
      if (request.filePrefix) formData.append('filePrefix', request.filePrefix);
      if (request.fileSuffix) formData.append('fileSuffix', request.fileSuffix);
      if (request.generateUniqueFileName !== undefined) formData.append('generateUniqueFileName', request.generateUniqueFileName.toString());
      if (request.customFileName) formData.append('customFileName', request.customFileName);
      if (request.customDirectory) formData.append('customDirectory', request.customDirectory);
      
      // Añadir extensiones permitidas si existen
      if (request.allowedExtensions && request.allowedExtensions.length > 0) {
        request.allowedExtensions.forEach((ext, index) => {
          formData.append(`allowedExtensions[${index}]`, ext);
        });
      }
      
      const response = await fileBinaryService.uploadFileToBinary(formData);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          uploadResult: response.data
        }));
        
        // Actualizar el estado del progreso a completado
        setUploadProgress(prev => prev ? {
          ...prev,
          progress: 100,
          status: 'success'
        } : null);
        
        // Limpiar el progreso después de un tiempo
        setTimeout(() => {
          setUploadProgress(null);
        }, 2000);
        
        return response.data;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Error al subir el archivo a la base de datos'
        }));
        
        // Actualizar el estado del progreso a error
        setUploadProgress(prev => prev ? {
          ...prev,
          status: 'error',
          error: response.message || 'Error al subir el archivo a la base de datos'
        } : null);
        
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir el archivo';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      // Actualizar el estado del progreso a error
      setUploadProgress(prev => prev ? {
        ...prev,
        status: 'error',
        error: errorMessage
      } : null);
      
      return null;
    }
  };

  /**
   * Obtiene información de un archivo binario almacenado en la base de datos
   */
  const getFileBinaryInfo = useCallback(async (fileId: string | number): Promise<StoredFile | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fileBinaryService.getFileBinaryInfo(fileId);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isLoading: false
        }));
        return response.data;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Error al obtener información del archivo'
        }));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener información del archivo';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  /**
   * Descarga un archivo desde la base de datos con seguimiento de progreso
   * @returns true si la descarga se inició correctamente
   */
  const downloadFileFromBinary = useCallback((fileId: string | number, fileName?: string): Promise<boolean> => {
    // Inicializar el progreso de descarga
    setDownloadProgress({
      fileName: fileName || `archivo_${fileId}`,
      progress: 0,
      status: 'downloading'
    });
    
    // Función para actualizar el progreso de descarga
    const updateDownloadProgress = (progress: number) => {
      setDownloadProgress(prev => prev ? {
        ...prev,
        progress
      } : null);
      
      // Si la descarga está completa, actualizar el estado y limpiar después de un tiempo
      if (progress === 100) {
        setDownloadProgress(prev => prev ? {
          ...prev,
          status: 'success'
        } : null);
        
        // Limpiar el progreso después de un tiempo
        setTimeout(() => {
          setDownloadProgress(null);
        }, 2000);
      }
    };
    
    return fileBinaryService.downloadFileFromBinary(fileId, updateDownloadProgress);
  }, []);

  // Usar useCallback para evitar recrear la función en cada render
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    uploadResult: state.uploadResult,
    uploadFileToBinary,
    getFileBinaryInfo,
    downloadFileFromBinary,
    clearError,
    // Exponer los estados de progreso
    uploadProgress,
    downloadProgress
  };
};
