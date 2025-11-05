import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Search, FileIcon, HardDrive, Database, Trash2 } from 'lucide-react';
import { StoredFile } from '../types/StoredFile';
import { FileUploadResponse } from '../types';

interface DatabaseTabProps {
  storedFiles: StoredFile[];
  loadingStoredFiles: boolean;
  errorStoredFiles: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchFiles: (filters: { fileName?: string }) => void;
  handleDownload: (file: StoredFile | FileUploadResponse) => void;
  handleDownloadFromDatabase: (file: StoredFile) => void;
  handleDelete: (file: StoredFile | FileUploadResponse) => void;
  formatFileSize: (bytes: number) => string;
}

export const DatabaseTab = ({
  storedFiles,
  loadingStoredFiles,
  errorStoredFiles,
  searchTerm,
  setSearchTerm,
  searchFiles,
  handleDownload,
  handleDownloadFromDatabase,
  handleDelete,
  formatFileSize
}: DatabaseTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Archivos en Base de Datos</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de archivo..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchFiles({ fileName: searchTerm });
                  }
                }}
              />
            </div>
          </div>
          <Button 
            onClick={() => searchFiles({ fileName: searchTerm })}
            className="w-full sm:w-auto"
          >
            Buscar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loadingStoredFiles ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : storedFiles.length === 0 ? (
          <div className="py-8 px-4 text-center bg-gray-50 rounded-md">
            <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay archivos almacenados</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Directorio</TableHead>
                  <TableHead className="w-[100px]">Tamaño</TableHead>
                  <TableHead className="w-[100px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storedFiles.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{file.fileName}</TableCell>
                    <TableCell>{file.fileType || 'N/A'}</TableCell>
                    <TableCell>{file.customDirectory || 'Default'}</TableCell>
                    <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* Si tiene contenido binario, mostrar solo el botón de descarga desde base de datos */}
                      {file.hasBinaryContent ? (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownloadFromDatabase(file)}
                          disabled={loadingStoredFiles}
                          title="Descargar contenido binario"
                        >
                          <Database className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownload(file)}
                          disabled={loadingStoredFiles}
                          title="Descargar desde sistema de archivos"
                        >
                          <HardDrive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(file)}
                        disabled={loadingStoredFiles}
                        className="text-destructive hover:text-destructive"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {errorStoredFiles && errorStoredFiles !== 'canceled' && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            {errorStoredFiles}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
