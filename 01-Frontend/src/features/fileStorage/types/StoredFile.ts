/**
 * Modelo para representar un archivo almacenado
 */
export interface StoredFile {
  /**
   * ID del archivo
   */
  fileId?: number;
  
  /**
   * Nombre del archivo
   */
  fileName: string;
  
  /**
   * Nombre original del archivo
   */
  originalFileName?: string;
  
  /**
   * Ruta relativa del archivo
   */
  filePath: string;
  
  /**
   * URL para acceder al archivo
   */
  fileUrl: string;
  
  /**
   * Tamaño del archivo en bytes
   */
  fileSize: number;
  
  /**
   * Tipo de archivo (categoría)
   */
  fileType?: string;
  
  /**
   * Tipo MIME del archivo
   */
  mimeType?: string;
  
  /**
   * Fecha de creación del archivo
   */
  creationDate?: Date;
  
  /**
   * Directorio personalizado
   */
  customDirectory?: string;
  
  /**
   * Indica si el archivo es una imagen
   */
  isImage?: boolean;
  
  /**
   * Total de registros para paginación
   */
  totalRegistros?: number;
  
  /**
   * Indica si el archivo tiene contenido binario almacenado en la base de datos
   */
  hasBinaryContent?: boolean;
  
  /**
   * Contenido binario del archivo
   */
  fileContent?: File;
}
