import { useEffect } from 'react';
import { FileUploader } from './FileUploader';
import { FileList } from './FileList';
import { useFileStorage } from '../hooks/useFileStorage';
import Modal from '@/shared/components/overlays/modal/Modal';
import { Button } from '@/shared/components/ui/button';
import { X } from 'lucide-react';

interface FileStorageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId?: string; // Identificador opcional de la entidad relacionada con los archivos
  customDirectory?: string;
  title?: string;
  allowedExtensions?: string[];
  maxFileSize?: number; // en bytes
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const FileStorageModal = ({
  open,
  onOpenChange,
  entityId,
  customDirectory,
  title = 'Gestión de Archivos',
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  maxFileSize = 100 * 1024 * 1024, // 100MB por defecto
  size = 'lg'
}: FileStorageModalProps) => {
  const { 
    files, 
    isLoading, 
    error, 
    uploadFile, 
    deleteFile,
    clearError 
  } = useFileStorage();

  // Limpiar errores al cerrar el modal
  useEffect(() => {
    if (!open) {
      clearError();
    }
  }, [open, clearError]);

  return (
    <Modal
      modalVisible={open}
      onClose={() => onOpenChange(false)}
      title={title}
      size={size}
      showCloseButton={true}
    >
      <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full" 
                onClick={clearError}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <FileUploader
            onUpload={uploadFile}
            isLoading={isLoading}
            allowedExtensions={allowedExtensions}
            maxFileSize={maxFileSize}
            {...(customDirectory && { customDirectory })}
            entityId={entityId || ''}
          />
          
          <div className="mt-6">
            <FileList 
              files={files} 
              onDelete={deleteFile} 
              isLoading={isLoading} 
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
    </Modal>
  );
};
