export interface FileUploadResponse {
  fileName: string;
  originalFileName?: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  fileType?: string;
  mimeType?: string;
  isImage?: boolean;
  customDirectory?: string;
}

export interface FileUploadRequest {
  file: File;
  fileType?: string;
  maxFileSize?: number;
  allowedExtensions?: string[];
  maxWidth?: number;
  maxHeight?: number;
  compressImage?: boolean;
  compressionQuality?: number;
  filePrefix?: string;
  fileSuffix?: string;
  generateUniqueFileName?: boolean;
  customFileName?: string;
  customDirectory?: string;
}

export interface FileStorageState {
  files: FileUploadResponse[];
  isLoading: boolean;
  error: string | null;
}
