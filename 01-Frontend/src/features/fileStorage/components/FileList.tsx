import React from 'react';
import { FileUploadResponse } from '../types';
import { Button } from '@/shared/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Download, Trash2, FileIcon } from 'lucide-react';
import { ConfirmationDialog } from '@/shared/components/overlays/dialogs';

interface FileListProps {
    files: FileUploadResponse[];
    onDelete: (filePath: string) => Promise<boolean>;
    isLoading: boolean;
}

export const FileList = ({ files, onDelete, isLoading }: FileListProps) => {
    const [fileToDelete, setFileToDelete] = React.useState<FileUploadResponse | null>(null);
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const handleDownload = (file: FileUploadResponse) => {
        // Crear un enlace temporal para descargar el archivo
        const link = document.createElement('a');
        link.href = file.fileUrl;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (file: FileUploadResponse) => {
        setFileToDelete(file);
    };
    
    const confirmDelete = async () => {
        if (fileToDelete) {
            await onDelete(fileToDelete.filePath);
            setFileToDelete(null);
        }
    };
    
    const cancelDelete = () => {
        setFileToDelete(null);
    };

    return (
        <div className="w-full">
        <h3 className="text-lg font-medium mb-4">Archivos subidos</h3>
        
        {files.length === 0 ? (
            <div className="py-8 px-4 text-center bg-gray-50 rounded-md">
                <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No hay archivos subidos</p>
            </div>
        ) : (
            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="w-[100px]">Tamaño</TableHead>
                            <TableHead className="w-[100px] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {files.map((file, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{file.fileName}</TableCell>
                                <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleDownload(file)}
                                        disabled={isLoading}
                                        title="Descargar"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleDelete(file)}
                                        disabled={isLoading}
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
        
        {isLoading && (
            <div className="mt-4 flex items-center justify-center p-4 bg-gray-50 rounded-md">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
            <p className="text-sm text-gray-600">Cargando archivos...</p>
            </div>
        )}
        
        <ConfirmationDialog
            isOpen={!!fileToDelete}
            onOpenChange={(open) => {
                if (!open) setFileToDelete(null);
            }}
            title="Confirmar eliminación"
            description={`¿Está seguro que desea eliminar el archivo ${fileToDelete?.fileName}? Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            cancelLabel="Cancelar"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            variant="destructive"
        />
        </div>
    );
};
