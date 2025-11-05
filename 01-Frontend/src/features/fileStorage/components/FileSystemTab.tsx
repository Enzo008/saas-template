import { FileUploader } from './FileUploader';
import { FileList } from './FileList';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { FileUploadRequest } from '../types';

interface FileSystemTabProps {
  files: any[];
  isLoading: boolean;
  uploadFile: (request: FileUploadRequest) => Promise<any>;
  deleteFile: (filePath: string, customDirectory?: string) => Promise<any>;
  customDirectory: string;
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
  allowMultiple?: boolean;
  maxSimultaneousUploads?: number;
}

export const FileSystemTab = ({
  files,
  isLoading,
  uploadFile,
  deleteFile,
  customDirectory,
  uploadProgress,
  uploadProgresses = [],
  allowMultiple = true,
  maxSimultaneousUploads = 20
}: FileSystemTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Archivos en el Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Componente de Carga</h3>
            <FileUploader 
              onUpload={(request) => uploadFile({
                ...request,
                customDirectory
              })}
              isLoading={isLoading}
              customDirectory={customDirectory}
              uploadProgress={uploadProgress || null}
              uploadProgresses={uploadProgresses}
              allowMultiple={allowMultiple}
              maxSimultaneousUploads={maxSimultaneousUploads}
            />
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Componente de Lista</h3>
            <FileList 
              files={files}
              onDelete={deleteFile}
              isLoading={isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
