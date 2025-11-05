// *****************************************************************************************************
// Descripción       : Interface IFileStorageRepository
// Creado por        : Cascade
// Fecha de Creación : 20/06/2025
// Modificado por    : Enzo Gago Aguirre
// Fecha de Modificación: 24/06/2025
// Acción a Realizar : Definir interface para el Repository de archivos almacenados con soporte para contenido binario
// *****************************************************************************************************

// Modelos
using saas_template.server.Models;
using saas_template.server.Models.FileStorage;
// Libreria Helper
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface IFileStorageRepository
    {
        /// <summary>
        /// Obtiene la lista de archivos almacenados
        /// </summary>
        /// <param name="filter">Filtros para la búsqueda</param>
        /// <param name="log">Información de log</param>
        /// <returns>Lista de archivos almacenados</returns>
        Task<OperationResponse> GetStoredFiles(StoredFile filter, Log log);
        
        /// <summary>
        /// Guarda los metadatos de un archivo en la base de datos
        /// </summary>
        /// <param name="fileData">Datos del archivo a guardar</param>
        /// <param name="log">Información de log</param>
        /// <returns>Respuesta de la operación</returns>
        Task<OperationResponse> SaveFileMetadata(FileUploadResponse fileData, Log log);
        
        /// <summary>
        /// Guarda los metadatos y el contenido binario de un archivo en la base de datos
        /// </summary>
        /// <param name="fileData">Datos del archivo a guardar</param>
        /// <param name="fileContent">Contenido binario del archivo</param>
        /// <param name="log">Información de log</param>
        /// <returns>Respuesta de la operación</returns>
        Task<OperationResponse> SaveFileWithBinaryContent(FileUploadResponse fileData, byte[] fileContent, Log log);
        
        /// <summary>
        /// Obtiene el contenido binario de un archivo almacenado en la base de datos
        /// </summary>
        /// <param name="fileId">ID del archivo a obtener</param>
        /// <param name="log">Información de log</param>
        /// <returns>Archivo con su contenido binario</returns>
        Task<OperationResponse> GetFileBinaryContent(int fileId, Log log);
        
        /// <summary>
        /// Elimina los metadatos de un archivo de la base de datos
        /// </summary>
        /// <param name="filePath">Ruta del archivo a eliminar</param>
        /// <param name="customDirectory">Directorio personalizado del archivo</param>
        /// <param name="log">Información de log</param>
        /// <returns>Respuesta de la operación</returns>
        Task<OperationResponse> DeleteFileMetadata(string filePath, string? customDirectory, Log log);
    }
}
