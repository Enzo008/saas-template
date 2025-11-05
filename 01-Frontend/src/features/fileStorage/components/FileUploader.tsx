import { useRef, useState } from 'react';
import { FileUploadRequest } from '../types';
import { FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';

interface FileUploaderProps {
  onUpload: (request: FileUploadRequest) => Promise<any>;
  isLoading: boolean;
  maxFileSize?: number; // en bytes, por defecto 4MB
  allowedExtensions?: string[];
  allowMultiple?: boolean;
  className?: string;
  dropzoneText?: string;
  dragActiveText?: string;
  entityId?: string;
  customDirectory?: string;
  uploadProgress?: {
    fileName: string;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
    fileId?: string;
  } | null;
  uploadProgresses?: {
    fileName: string;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
    fileId?: string;
  }[];
  maxSimultaneousUploads?: number; // Número máximo de cargas simultáneas
}

export const FileUploader = ({
  onUpload,
  isLoading,
  maxFileSize = 100 * 1024 * 1024, // 100MB por defecto
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  allowMultiple = false,
  className = '',
  dropzoneText = 'Arrastra archivos aquí o haz clic para seleccionar',
  dragActiveText = 'Suelta los archivos aquí',
  entityId,
  customDirectory,
  uploadProgress,
  uploadProgresses = [],
  maxSimultaneousUploads = 20
}: FileUploaderProps) => {
  const [dragging, setDragging] = useState(false);
  const [simultaneousUpload, setSimultaneousUpload] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const validateFile = (file: File): string | null => {
    // Validar tamaño de archivo
    if (file.size > maxFileSize) {
      return `El archivo ${file.name} excede el tamaño máximo permitido de ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }

    // Validar extensión
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
      return `El archivo ${file.name} tiene una extensión no permitida. Extensiones permitidas: ${allowedExtensions.join(', ')}`;
    }

    // Validar nombre de archivo
    if (file.name.length > 150) {
      return `El nombre del archivo excede el límite de 150 caracteres`;
    }

    // Verificar caracteres especiales
    if (/[+=#~]/.test(file.name)) {
      return `El nombre del archivo contiene caracteres especiales no permitidos (+ = # ~)`;
    }

    return null;
  };

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList);
    const validFiles: File[] = [];

    // Validar cada archivo
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }
      validFiles.push(file);
    }

    // Si solo se permite un archivo, tomar el primero
    const filesToUpload = allowMultiple ? validFiles : [validFiles[0]];
    
    // Limitar a un máximo de archivos
    const limitedFiles = filesToUpload.slice(0, maxSimultaneousUploads);
    
    if (limitedFiles.length > 1 && limitedFiles.length < filesToUpload.length) {
      alert(`Se cargarán los primeros ${maxSimultaneousUploads} archivos de los ${filesToUpload.length} seleccionados.`);
    }
    
    // Limpiar el input de archivo para permitir subir el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (simultaneousUpload) {
      // Carga simultánea
      const uploadPromises = limitedFiles.filter((file): file is File => file != null).map(file => {
        const request: FileUploadRequest = {
          file,
          fileType: file.type,
          maxFileSize,
          allowedExtensions,
          ...(customDirectory && { customDirectory })
        };
        
        if (entityId) {
          request.filePrefix = `entity-${entityId}`;
        }
        
        return onUpload(request);
      });
      
      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error en la carga simultánea:', error);
      }
    } else {
      // Carga secuencial
      // Limpiamos cualquier archivo pendiente anterior
      setPendingFiles([]);
      pendingFilesRef.current = [];
      
      // Usamos un pequeño timeout para asegurar que el estado se actualice correctamente
      setTimeout(() => {
        console.log(`[FileUploader] Iniciando carga secuencial de ${limitedFiles.length} archivos`);
        // Guardamos los archivos tanto en el estado como en la referencia
        const validFiles = limitedFiles.filter(file => file != null);
        setPendingFiles(validFiles);
        pendingFilesRef.current = [...validFiles];
        uploadNextFile();
      }, 100);
    }
  };

  // Usamos una referencia para mantener un array local de archivos pendientes
  // Esto evita problemas con closures y el estado asincrónico
  const pendingFilesRef = useRef<File[]>([]);

  const uploadNextFile = async () => {
    // Obtenemos los archivos pendientes de la referencia local
    const currentPendingFiles = pendingFilesRef.current;
    
    // Verificar si hay archivos pendientes
    if (currentPendingFiles.length === 0) {
      console.log('[FileUploader] No hay más archivos pendientes para cargar');
      setPendingFiles([]); // Actualizamos el estado para reflejar que no hay archivos pendientes
      return;
    }
    
    // Tomamos el primer archivo de la lista
    const file = currentPendingFiles[0];
    if (!file) {
      console.error('[FileUploader] No hay archivo para procesar');
      return;
    }
    
    console.log(`[FileUploader] Procesando archivo: ${file.name} (${currentPendingFiles.length} restantes)`);
    
    const request: FileUploadRequest = {
      file,
      fileType: file.type,
      maxFileSize,
      allowedExtensions,
      ...(customDirectory && { customDirectory })
    };
    
    if (entityId) {
      request.filePrefix = `entity-${entityId}`;
    }
    
    try {
      console.log(`[FileUploader] Iniciando carga de: ${file.name}`);
      await onUpload(request);
      console.log(`[FileUploader] Carga completada: ${file.name}`);
      
      // Eliminamos el archivo procesado de la lista local
      const newPendingFiles = [...currentPendingFiles.slice(1)];
      pendingFilesRef.current = newPendingFiles;
      
      // Actualizamos el estado para la UI
      setPendingFiles(newPendingFiles);
      
      // Programar el siguiente archivo solo si hay más archivos pendientes
      if (newPendingFiles.length > 0) {
        // Usar setTimeout para dar tiempo al estado de actualizarse
        setTimeout(() => {
          console.log(`[FileUploader] Programando carga del siguiente archivo`);
          uploadNextFile();
        }, 300);
      } else {
        console.log('[FileUploader] Todos los archivos han sido procesados');
      }
    } catch (error) {
      console.error(`[FileUploader] Error al subir el archivo ${file.name}:`, error);
      
      // Eliminamos el archivo con error de la lista local
      const newPendingFiles = [...currentPendingFiles.slice(1)];
      pendingFilesRef.current = newPendingFiles;
      
      // Actualizamos el estado para la UI
      setPendingFiles(newPendingFiles);
      
      // Programar el siguiente archivo solo si hay más archivos pendientes
      if (newPendingFiles.length > 0) {
        // Usar setTimeout para dar tiempo al estado de actualizarse
        setTimeout(() => {
          console.log(`[FileUploader] Programando carga del siguiente archivo después del error`);
          uploadNextFile();
        }, 300);
      } else {
        console.log('[FileUploader] Todos los archivos han sido procesados (con errores)');
      }
    }
  };

  // Función para manejar eventos de arrastre

  const handleDragIn = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-gray-50/50",
          dragging && "border-primary bg-primary/5"
        )}
        onDrop={handleDrop}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple={allowMultiple}
          className="hidden"
          accept={allowedExtensions.join(',')}
        />
        
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <FileUp className="h-6 w-6 text-primary" />
        </div>
        
        <p className="text-base font-medium mb-1">
          {dragging ? dragActiveText : dropzoneText}
        </p>
        
        <p className="text-sm text-gray-500 text-center">
          Tamaño máximo: {Math.round(maxFileSize / 1024 / 1024)}MB
          <br />
          Formatos permitidos: {allowedExtensions.join(', ')}
        </p>
      </div>
      
      {/* Mostrar el progreso de carga para múltiples archivos */}
      {uploadProgresses && uploadProgresses.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium">Progreso de carga ({uploadProgresses.length} {uploadProgresses.length === 1 ? 'archivo' : 'archivos'})</h4>
          
          {uploadProgresses.map((progress, index) => (
            <div key={progress.fileId || index} className="p-3 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate max-w-[250px]" title={progress.fileName}>
                  {progress.fileName}
                </span>
                <span className="text-xs text-gray-500">
                  {progress.status === 'uploading' ? `${progress.progress}%` : 
                   progress.status === 'success' ? 'Completado' : 'Error'}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    progress.status === 'success' ? 'bg-green-500' : 
                    progress.status === 'error' ? 'bg-red-500' : 'bg-primary'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
              
              {progress.status === 'error' && (
                <p className="text-xs text-red-500 mt-1">{progress.error || 'Error al subir el archivo'}</p>
              )}
              
              {progress.status === 'success' && (
                <p className="text-xs text-green-500 mt-1">Archivo subido correctamente</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Mantener compatibilidad con la versión anterior para un solo progreso */}
      {uploadProgress && uploadProgresses?.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium truncate max-w-[250px]" title={uploadProgress.fileName}>
              {uploadProgress.fileName}
            </span>
            <span className="text-xs text-gray-500">
              {uploadProgress.status === 'uploading' ? `${uploadProgress.progress}%` : 
               uploadProgress.status === 'success' ? 'Completado' : 'Error'}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${
                uploadProgress.status === 'success' ? 'bg-green-500' : 
                uploadProgress.status === 'error' ? 'bg-red-500' : 'bg-primary'
              }`}
              style={{ width: `${uploadProgress.progress}%` }}
            ></div>
          </div>
          
          {uploadProgress.status === 'error' && (
            <p className="text-xs text-red-500 mt-1">{uploadProgress.error || 'Error al subir el archivo'}</p>
          )}
          
          {uploadProgress.status === 'success' && (
            <p className="text-xs text-green-500 mt-1">Archivo subido correctamente</p>
          )}
        </div>
      )}
      
      {/* Mostrar indicador de carga si isLoading es true pero no hay progreso disponible */}
      {isLoading && !uploadProgress && (
        <div className="mt-4 flex items-center justify-center p-4 bg-gray-50 rounded-md">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
          <p className="text-sm text-gray-600">Preparando carga...</p>
        </div>
      )}
      
      {/* Mostrar información sobre archivos pendientes */}
      {pendingFiles.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm font-medium">Archivos pendientes: {pendingFiles.length}</p>
          <p className="text-xs text-gray-500">Cargando archivos secuencialmente...</p>
        </div>
      )}
      
      {/* Interruptor para elegir entre carga simultánea o secuencial */}
      {allowMultiple && (
        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="simultaneous-upload"
            checked={simultaneousUpload}
            onCheckedChange={setSimultaneousUpload}
          />
          <Label htmlFor="simultaneous-upload" className="text-sm">
            {simultaneousUpload ? 'Carga simultánea' : 'Carga secuencial'}
          </Label>
          <div className="ml-auto text-xs text-gray-500">
            {simultaneousUpload 
              ? `Cargar hasta ${maxSimultaneousUploads} archivos a la vez` 
              : 'Cargar archivos uno por uno'}
          </div>
        </div>
      )}
    </div>
  );
};
