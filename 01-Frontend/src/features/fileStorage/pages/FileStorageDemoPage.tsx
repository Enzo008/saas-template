import { useState, useEffect } from 'react';
import { FileStorageModal } from '../components/FileStorageModal';
import { useFileStorage } from '../hooks/useFileStorage';
import { useFileBinary } from '../hooks/useFileBinary';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { StoredFile } from '../types/StoredFile';
import { FileUploadResponse } from '../types';
import { ConfirmationDialog } from '@/shared/components/overlays/dialogs';
import { FileSystemTab } from '../components/FileSystemTab';
import { DatabaseTab } from '../components/DatabaseTab';
import { BinaryTab } from '../components/BinaryTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Slider } from '@/shared/components/ui/slider';

export const FileStorageDemoPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('filesystem');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<StoredFile | FileUploadResponse | null>(null);
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [maxSimultaneousUploads, setMaxSimultaneousUploads] = useState(20);
  
  // Obtener funciones del hook de almacenamiento de archivos
  const { 
    // Archivos del sistema de archivos
    files, 
    isLoading, 
    uploadFile, 
    deleteFile,
    uploadProgress,
    uploadProgresses,
    // Archivos desde el backend
    storedFiles,
    loadingStoredFiles,
    errorStoredFiles,
    getStoredFiles,
    getFilesFromFileSystem,
    
    // Paginación y filtros
    searchFiles
  } = useFileStorage('demo-files');
  
  // Obtener funciones del hook de archivos binarios
  const {
    isLoading: isLoadingBinary,
    error: errorBinary,
    uploadResult,
    uploadProgress: binaryUploadProgress,
    downloadProgress,
    uploadFileToBinary,
    downloadFileFromBinary
  } = useFileBinary();
  
  // Función para manejar el cambio de tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Recargar datos según el tab seleccionado
    if (value === 'filesystem') {
      getFilesFromFileSystem();
    } else if (value === 'database') {
      getStoredFiles();
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cargar archivos al iniciar la página
  useEffect(() => {
    // Cargar archivos del sistema de archivos al iniciar
    getFilesFromFileSystem();
    
    // Si el tab activo es 'database', también cargar archivos de la base de datos
    if (activeTab === 'database') {
      getStoredFiles();
    }
  }, []);

  const openModal = () => setIsModalOpen(true);
  
  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Función para descargar un archivo desde el sistema de archivos
  const handleDownload = (file: StoredFile | FileUploadResponse) => {
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Función para descargar un archivo desde la base de datos
  const handleDownloadFromDatabase = (file: StoredFile) => {
    if (file.fileId && file.hasBinaryContent) {
      downloadFileFromBinary(file.fileId);
    }
  };

  // Función para eliminar un archivo
  const handleDelete = (file: StoredFile | FileUploadResponse) => {
    setFileToDelete(file);
    setConfirmDialogOpen(true);
  };

  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    if (fileToDelete) {
      // Pasar la ruta del archivo y el directorio personalizado (si existe)
      await deleteFile(fileToDelete.filePath, fileToDelete.customDirectory);
      
      // Recargar la lista después de eliminar
      if (activeTab === 'filesystem') {
        getFilesFromFileSystem();
      } else if (activeTab === 'database') {
        getStoredFiles();
      }

      // Cerrar el diálogo y limpiar el estado
      setConfirmDialogOpen(false);
      setFileToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Demostración de Gestión de Archivos</h1>
      
      <section className="mb-12 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Componente Modal</h2>
        <p className="mb-4 text-gray-600">
          Este componente proporciona una interfaz completa para la gestión de archivos en un modal.
          Es útil cuando necesitas integrar la funcionalidad de gestión de archivos en otra página.
        </p>
        <Button 
          onClick={openModal}
          className="mb-4"
        >
          Abrir Modal de Gestión de Archivos
        </Button>
        
        <FileStorageModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          title="Gestión de Archivos - Demo"
          customDirectory="demo-files"
        />
      </section>
      
      <section className="mb-12 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Listado de Archivos</h2>
        <p className="mb-4 text-gray-600">
          Visualización de archivos almacenados en el sistema, con opciones para filtrar y paginar.
        </p>
        
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="filesystem">Sistema de Archivos</TabsTrigger>
            <TabsTrigger value="database">Base de Datos</TabsTrigger>
            <TabsTrigger value="binary">Archivos Binarios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="filesystem" className="mt-4">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Configuración de Carga</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow-multiple"
                        checked={allowMultiple}
                        onCheckedChange={setAllowMultiple}
                      />
                      <Label htmlFor="allow-multiple" className="text-sm font-medium">
                        Permitir múltiples archivos
                      </Label>
                    </div>
                    <div className="text-xs text-gray-500">
                      {allowMultiple 
                        ? 'Se pueden seleccionar varios archivos a la vez' 
                        : 'Solo se puede seleccionar un archivo a la vez'}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    <div>
                      <Label htmlFor="max-uploads" className="text-sm font-medium mb-2 block">
                        Máximo de archivos simultáneos: {maxSimultaneousUploads}
                      </Label>
                      <Slider
                        id="max-uploads"
                        value={[maxSimultaneousUploads]}
                        min={1}
                        max={50}
                        step={1}
                        onValueChange={(value: number[]) => setMaxSimultaneousUploads(value[0] || 1)}
                        disabled={!allowMultiple}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {allowMultiple 
                        ? `Se cargarán hasta ${maxSimultaneousUploads} archivos ${maxSimultaneousUploads > 1 ? 'simultáneamente' : 'a la vez'}` 
                        : 'Esta opción está deshabilitada cuando no se permiten múltiples archivos'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <FileSystemTab
              files={files}
              isLoading={isLoading}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
              customDirectory="demo-files"
              uploadProgress={uploadProgress}
              uploadProgresses={uploadProgresses}
              allowMultiple={allowMultiple}
              maxSimultaneousUploads={maxSimultaneousUploads}
            />
          </TabsContent>
          
          <TabsContent value="database" className="mt-4">
            <DatabaseTab
              storedFiles={storedFiles}
              loadingStoredFiles={loadingStoredFiles}
              errorStoredFiles={errorStoredFiles}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchFiles={searchFiles}
              handleDownload={handleDownload}
              handleDownloadFromDatabase={handleDownloadFromDatabase}
              handleDelete={handleDelete}
              formatFileSize={formatFileSize}
            />
          </TabsContent>
          
          <TabsContent value="binary" className="mt-4">
            <BinaryTab
              isLoadingBinary={isLoadingBinary}
              errorBinary={errorBinary}
              uploadResult={uploadResult}
              uploadProgress={binaryUploadProgress}
              downloadProgress={downloadProgress}
              uploadFileToBinary={uploadFileToBinary}
              downloadFileFromBinary={downloadFileFromBinary}
              formatFileSize={formatFileSize}
              customDirectory="demo-files"
            />
          </TabsContent>
        </Tabs>
      </section>
      
      <section className="mb-12 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Guía de Uso</h2>
        <div className="space-y-6">
          <h3 className="text-xl font-medium">Integración en tu Proyecto</h3>
          <p className="text-gray-600">Para integrar la gestión de archivos en tu proyecto, puedes usar cualquiera de estos enfoques:</p>
          
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">1. Usar el Modal Completo</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {`import { FileStorageModal } from '../features/fileStorage/components/FileStorageModal';

// En tu componente:
const [isModalOpen, setIsModalOpen] = useState(false);

// Renderizar:
<Button onClick={() => setIsModalOpen(true)}>Abrir Gestor de Archivos</Button>
<FileStorageModal 
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
  title="Título del Modal"
  customDirectory="mi-directorio"
  entityId="123" // Opcional, para relacionar archivos con una entidad
/>`}
            </pre>
          </div>
          
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">2. Usar Componentes Individuales</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {`import { FileUploader, FileList } from '../features/fileStorage/components';
import { useFileStorage } from '../features/fileStorage/hooks/useFileStorage';

// En tu componente:
const { files, isLoading, uploadFile, deleteFile } = useFileStorage();

// Renderizar:
<FileUploader 
  onUpload={(request) => uploadFile({
    ...request,
    customDirectory: 'mi-directorio'
  })}
  isLoading={isLoading}
  customDirectory="mi-directorio"
/>

<FileList 
  files={files}
  onDelete={deleteFile}
  isLoading={isLoading}
/>`}
            </pre>
          </div>
        </div>
      </section>

      {/* Diálogo de confirmación para eliminar archivos */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Confirmar eliminación"
        description={`¿Está seguro que desea eliminar el archivo ${fileToDelete?.fileName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setFileToDelete(null)}
        variant="destructive"
      />
    </div>
  );
};

export default FileStorageDemoPage;
