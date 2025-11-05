import { FileUploader } from './FileUploader';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Download } from 'lucide-react';
import { FileUploadRequest } from '../types';
import { Progress } from '@/shared/components/ui/progress';

interface BinaryTabProps {
    isLoadingBinary: boolean;
    errorBinary: string | null;
    uploadResult: any | null;
    uploadFileToBinary: (request: FileUploadRequest) => Promise<any>;
    downloadFileFromBinary: (fileId: string | number, fileName?: string) => Promise<boolean>;
    formatFileSize: (bytes: number) => string;
    customDirectory: string;
    uploadProgress?: {
        fileName: string;
        progress: number;
        status: 'uploading' | 'downloading' | 'success' | 'error';
        error?: string;
    } | null;
    downloadProgress?: {
        fileName: string;
        progress: number;
        status: 'uploading' | 'downloading' | 'success' | 'error';
        error?: string;
    } | null;
}

export const BinaryTab = ({
    isLoadingBinary,
    errorBinary,
    uploadResult,
    uploadFileToBinary,
    downloadFileFromBinary,
    formatFileSize,
    customDirectory,
    uploadProgress,
    downloadProgress
}: BinaryTabProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Archivos Binarios en Base de Datos</CardTitle>
                <p className="text-sm text-gray-500 mt-2">
                    Esta sección permite subir archivos directamente a la base de datos como contenido binario VARBINARY.
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-1 gap-8">
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-xl font-medium mb-4">Subir Archivo a Base de Datos</h3>
                        <div className="flex flex-row justify-center items-center gap-4">
                            <FileUploader 
                                onUpload={(request) => uploadFileToBinary({
                                    ...request,
                                    customDirectory
                                })}
                                isLoading={isLoadingBinary}
                                customDirectory={customDirectory}
                                className='w-1/2'
                            />
                            
                            {uploadResult && (
                            <div className="p-4 bg-green-50 rounded-md w-1/2">
                                <h4 className="font-medium text-green-800">Archivo subido correctamente</h4>
                                <div className="mt-2 space-y-2">
                                <p className="text-sm"><span className="font-medium">Nombre:</span> {uploadResult.fileInfo?.fileName}</p>
                                <p className="text-sm"><span className="font-medium">ID:</span> {uploadResult.fileId}</p>
                                <p className="text-sm"><span className="font-medium">Tamaño original:</span> {formatFileSize(uploadResult.originalSize)}</p>
                                <p className="text-sm"><span className="font-medium">Tamaño comprimido:</span> {formatFileSize(uploadResult.compressedSize)}</p>
                                <p className="text-sm"><span className="font-medium">Ratio de compresión:</span> {(uploadResult.compressionRatio * 100).toFixed(2)}%</p>
                                <div className="mt-2">
                                    <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => downloadFileFromBinary(uploadResult.fileId, uploadResult.fileInfo?.fileName)}
                                    disabled={downloadProgress?.status === 'downloading'}
                                    >
                                    <Download className="h-4 w-4 mr-2" />
                                    {downloadProgress?.status === 'downloading' ? 'Descargando...' : 'Descargar'}
                                    </Button>
                                </div>
                                </div>
                            </div>
                            )}
                        </div>
                        {/* Mostrar barra de progreso de carga */}
                        {uploadProgress && uploadProgress.status === 'uploading' && (
                            <div className="mt-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Subiendo {uploadProgress.fileName}</span>
                                    <span className="text-sm font-medium">{uploadProgress.progress}%</span>
                                </div>
                                <Progress value={uploadProgress.progress} className="h-2" />
                            </div>
                        )}
                        
                        {/* Mostrar barra de progreso de descarga */}
                        {downloadProgress && downloadProgress.status === 'downloading' && (
                            <div className="mt-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Descargando {downloadProgress.fileName}</span>
                                    <span className="text-sm font-medium">{downloadProgress.progress}%</span>
                                </div>
                                <Progress value={downloadProgress.progress} className="h-2" />
                            </div>
                        )}
                        
                        {errorBinary && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-md mt-4">
                            {errorBinary}
                        </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
