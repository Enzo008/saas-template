/**
 * Filtros para la búsqueda de archivos almacenados
 */
export interface FileStorageListFilter {
  /**
   * Número de página actual
   */
  pageNumber: number;
  
  /**
   * Cantidad de registros por página
   */
  pageSize: number;
  
  /**
   * Tipo de archivo (categoría)
   */
  fileType?: string;
  
  /**
   * Directorio personalizado
   */
  customDirectory?: string;
  
  /**
   * Nombre del archivo
   */
  fileName?: string;
}
