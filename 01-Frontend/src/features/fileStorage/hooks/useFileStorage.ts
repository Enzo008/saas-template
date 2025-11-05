import { useState, useCallback, useEffect } from 'react';
import { fileStorageService } from '../services/FileStorageService';
import { FileUploadRequest, FileUploadResponse, FileStorageState } from '../types';
import { StoredFile } from '../types/StoredFile';
import { FileStorageListFilter } from '../types/FileStorageListFilter';

// Interfaz extendida para incluir el progreso de carga
interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  fileId?: string; // Identificador único para cada archivo
}

export const useFileStorage = (customDirectory?: string) => {
  const [state, setState] = useState<FileStorageState>({
    files: [],
    isLoading: false,
    error: null
  });
  
  // Estado para el progreso de carga (múltiples archivos)
  const [uploadProgresses, setUploadProgresses] = useState<FileUploadProgress[]>([]);
  // Estado para el progreso de carga actual (compatibilidad con versiones anteriores)
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress | null>(null);
  
  // Estado para archivos del backend
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [loadingStoredFiles, setLoadingStoredFiles] = useState<boolean>(false);
  const [errorStoredFiles, setErrorStoredFiles] = useState<string | null>(null);
  
  // Estado para la paginación
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalItems: 0
  });
  
  // Estado para filtros
  const [filter, setFilter] = useState<FileStorageListFilter>({
    pageNumber: 1,
    pageSize: 10,
    fileType: '',
    customDirectory: customDirectory || '',
    fileName: ''
  });

  const uploadFile = async (request: FileUploadRequest): Promise<FileUploadResponse | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Generar un ID único para este archivo
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Crear un objeto de progreso para este archivo
    const newProgress: FileUploadProgress = {
      fileName: request.file.name,
      progress: 0,
      status: 'uploading',
      fileId
    };
    
    // Actualizar el progreso individual
    setUploadProgresses(prev => [...prev, newProgress]);
    
    // Mantener compatibilidad con la versión anterior
    setUploadProgress(newProgress);

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

      const response = await fileStorageService.uploadFile(formData);
      
      if (response.success && response.data) {
        // Aseguramos que response.data no sea undefined
        const fileData: FileUploadResponse = response.data;
        setState(prev => ({
          ...prev,
          files: [...prev.files, fileData],
          isLoading: false
        }));
        
        // Actualizar el estado del progreso a completado
        setUploadProgresses(prev => prev.map(p => 
          p.fileId === fileId ? { ...p, progress: 100, status: 'success' } : p
        ));
        
        // Mantener compatibilidad con la versión anterior
        setUploadProgress(prev => prev && prev.fileId === fileId ? {
          ...prev,
          progress: 100,
          status: 'success'
        } : prev);
        
        // Limpiar el progreso después de un tiempo
        setTimeout(() => {
          setUploadProgresses(prev => prev.filter(p => p.fileId !== fileId));
          setUploadProgress(prev => prev && prev.fileId === fileId ? null : prev);
        }, 3000);
        
        return fileData;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Error al subir el archivo'
        }));
        
        // Actualizar el estado del progreso a error
        const errorMsg = response.message || 'Error al subir el archivo';
        
        setUploadProgresses(prev => prev.map(p => 
          p.fileId === fileId ? { ...p, status: 'error', error: errorMsg } : p
        ));
        
        // Mantener compatibilidad con la versión anterior
        setUploadProgress(prev => prev && prev.fileId === fileId ? {
          ...prev,
          status: 'error',
          error: errorMsg
        } : prev);
        
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
      setUploadProgresses(prev => prev.map(p => 
        p.fileId === fileId ? { ...p, status: 'error', error: errorMessage } : p
      ));
      
      // Mantener compatibilidad con la versión anterior
      setUploadProgress(prev => prev && prev.fileId === fileId ? {
        ...prev,
        status: 'error',
        error: errorMessage
      } : prev);
      
      return null;
    }
  };

  const deleteFile = async (filePath: string, directory?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    // Usar el directorio personalizado proporcionado o el del hook
    const dirToUse = directory || customDirectory;

    try {
      const response = await fileStorageService.deleteFile(filePath, dirToUse);
      
      if (response.success) {
        // Actualizar la lista de archivos en el estado
        setState(prev => ({
          ...prev,
          files: prev.files.filter(file => file.filePath !== filePath),
          isLoading: false
        }));
        
        // Si la eliminación fue exitosa y tenemos datos de respuesta, podemos verificar si se eliminaron los metadatos
        if (response.data && response.data.metadataDeleted) {
          // Actualizar también la lista de archivos almacenados en la base de datos si es necesario
          setStoredFiles(prev => prev.filter(file => file.filePath !== filePath));
        }
        
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Error al eliminar el archivo'
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar el archivo';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return false;
    }
  };

  const checkFileExists = async (filePath: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fileStorageService.checkFileExists(filePath);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return response.success ? response.data : false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al verificar la existencia del archivo';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return false;
    }
  };

  /**
   * Obtiene la lista de archivos desde el sistema de archivos
   */
  const getFilesFromFileSystem = useCallback(async (directory?: string) => {
    try {
      setLoadingStoredFiles(true);
      const response = await fileStorageService.getFilesFromFileSystem(directory || customDirectory);
      
      if (response.success && response.data) {
        // Convertir StoredFile[] a FileUploadResponse[] para mantener compatibilidad
        const fileResponses = response.data.map(file => ({
          fileName: file.fileName,
          filePath: file.filePath,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize,
          mimeType: file.mimeType || ''
        }));
        
        setState(prev => ({
          ...prev,
          files: fileResponses
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener archivos del sistema';
      setErrorStoredFiles(errorMessage);
    } finally {
      setLoadingStoredFiles(false);
    }
  }, [customDirectory]);

  /**
   * Obtiene la lista de archivos almacenados con filtros
   */
  const getStoredFiles = useCallback(async (newFilter?: Partial<FileStorageListFilter>) => {
    try {
      setLoadingStoredFiles(true);
      
      // Actualizar filtros si se proporcionan
      const updatedFilter = newFilter ? { ...filter, ...newFilter } : filter;
      setFilter(updatedFilter);
      
      const response = await fileStorageService.getStoredFiles(updatedFilter);
      
      if (response.success) {
        // Asegurarse de que response.data no sea undefined
        const data = response.data || [];
        setStoredFiles(data);
        
        // Actualizar total de registros para paginación
        if (data.length > 0 && data[0] && typeof data[0].totalRegistros === 'number') {
          // Asegurarse de que totalRegistros sea un número válido
          const totalItems = data[0].totalRegistros || 0;
          setPagination(prev => ({
            ...prev,
            totalItems
          }));
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener archivos almacenados';
      setErrorStoredFiles(errorMessage);
    } finally {
      setLoadingStoredFiles(false);
    }
  }, [filter]);

  /**
   * Cambia la página actual
   */
  const changePage = useCallback((page: number) => {
    getStoredFiles({ pageNumber: page });
  }, [getStoredFiles]);

  /**
   * Cambia el tamaño de página
   */
  const changePageSize = useCallback((pageSize: number) => {
    getStoredFiles({ pageSize, pageNumber: 1 });
  }, [getStoredFiles]);

  /**
   * Busca archivos con filtros
   */
  const searchFiles = useCallback((newFilter: Partial<FileStorageListFilter>) => {
    getStoredFiles({ ...newFilter, pageNumber: 1 });
  }, [getStoredFiles]);

  // Usar useCallback para evitar recrear la función en cada render
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cargar archivos al iniciar
  useEffect(() => {
    getFilesFromFileSystem();
    getStoredFiles();
  }, [getFilesFromFileSystem, getStoredFiles]);

  // Referencia para controlar si se debe actualizar la lista después de subir un archivo
  const [shouldUpdateAfterUpload, setShouldUpdateAfterUpload] = useState(false);
  
  // Modificar uploadFile para marcar que se debe actualizar
  const originalUploadFile = uploadFile;
  const wrappedUploadFile = async (request: FileUploadRequest) => {
    const result = await originalUploadFile(request);
    if (result) {
      // Solo marcar para actualizar si la subida fue exitosa
      setShouldUpdateAfterUpload(true);
    }
    return result;
  };
  
  // Efecto para actualizar la lista una sola vez después de subir
  useEffect(() => {
    if (shouldUpdateAfterUpload) {
      // Actualizar la lista una sola vez
      getFilesFromFileSystem();
      // Resetear el flag para evitar actualizaciones adicionales
      setShouldUpdateAfterUpload(false);
    }
  }, [shouldUpdateAfterUpload, getFilesFromFileSystem]);

  return {
    // Estado
    files: state.files,
    isLoading: state.isLoading,
    error: state.error,
    uploadProgress,
    uploadProgresses,
    // Archivos desde el backend
    storedFiles,
    loadingStoredFiles,
    errorStoredFiles,
    getStoredFiles,
    getFilesFromFileSystem,
    
    // Operaciones de archivos
    uploadFile: wrappedUploadFile,
    deleteFile,
    checkFileExists,
    
    // Paginación y filtros
    pagination,
    filter,
    setFilter,
    changePage,
    changePageSize,
    searchFiles,
    clearError
  };
};
