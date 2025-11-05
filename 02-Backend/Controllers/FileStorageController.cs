// *****************************************************************************************************
// Descripción       : Controlador para el manejo de archivos
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 19/06/2025
// Acción a Realizar : Proporcionar endpoints para la gestión de archivos
// *****************************************************************************************************

// Extensiones
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
// Modelos
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using saas_template.server.Models;
using saas_template.server.Models.FileStorage;
using saas_template.server.DataAccessObject.Helper;
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.DataAccessObject.Core;
// Libreria Helper
using Helper;
using static Helper.Types;

namespace saas_template.server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileStorageController : ControllerBase
    {
        private readonly FileStorageHelper _fileStorageHelper;
        private readonly LogHelper _logHelper;
        private readonly IFileStorageRepository _fileStorageRepository;

        public FileStorageController(FileStorageHelper fileStorageHelper, LogHelper logHelper, IConfiguration configuration)
        {
            _fileStorageHelper = fileStorageHelper;
            _logHelper = logHelper;
            _fileStorageRepository = RepositoryFactory.GetInstanceSqlServer(configuration).GetFileStorageRepository();
        }

        /// <summary>
        /// Sube un archivo al servidor
        /// </summary>
        /// <param name="request">Datos del archivo a subir</param>
        /// <returns>Información del archivo subido</returns>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ApiResponse>> UploadFile([FromForm] FileUploadRequest request)
        {
            try
            {
                var log = await _logHelper.CreateLogFromTokenAsync(HttpContext);
                
                if (request.File == null || request.File.Length == 0)
                {
                    return new ApiResponse
                    {
                        Success = false,
                        Message = "No se ha proporcionado ningún archivo",
                        MessageType = "Error",
                        Data = new object()
                    };
                }
                
                // Configurar opciones según el tipo de archivo
                var options = new FileUploadOptions
                {
                    FileType = request.FileType ?? "general",
                    MaxFileSize = request.MaxFileSize > 0 ? request.MaxFileSize : 5 * 1024 * 1024, // 5MB por defecto
                    AllowedExtensions = request.AllowedExtensions != null && request.AllowedExtensions.Count > 0 
                        ? request.AllowedExtensions 
                        : new List<string> { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx" },
                    MaxWidth = request.MaxWidth ?? 0,
                    MaxHeight = request.MaxHeight ?? 0,
                    CompressImage = request.CompressImage,
                    CompressionQuality = request.CompressionQuality > 0 ? request.CompressionQuality : 80,
                    CustomFileName = request.CustomFileName
                };
                
                // Validar tamaño del archivo
                if (request.File.Length > options.MaxFileSize)
                {
                    return new ApiResponse
                    {
                        Success = false,
                        Message = $"El archivo excede el tamaño máximo permitido de {options.MaxFileSize / 1024 / 1024} MB",
                        MessageType = "Error",
                        Data = new object()
                    };
                }
                
                // Validar extensión del archivo
                string fileExtension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
                if (options.AllowedExtensions.Count > 0 && !options.AllowedExtensions.Contains(fileExtension))
                {
                    return new ApiResponse
                    {
                        Success = false,
                        Message = $"La extensión del archivo no está permitida. Extensiones permitidas: {string.Join(", ", options.AllowedExtensions)}",
                        MessageType = "Error",
                        Data = new object()
                    };
                }
                
                try
                {
                    // Guardar el archivo físicamente
                    var result = await _fileStorageHelper.SaveFileAsync(
                        request.File,
                        options,
                        request.FilePrefix,
                        request.FileSuffix,
                        request.GenerateUniqueFileName,
                        request.CustomDirectory
                    );
                    
                    if (result != null)
                    {
                        // Guardar los metadatos del archivo en la base de datos
                        var dbResult = await _fileStorageRepository.SaveFileMetadata(result, log);
                        
                        if (dbResult.Success == true)
                        {
                            return new ApiResponse
                            {
                                Success = true,
                                Message = "Archivo subido correctamente y metadatos guardados en la base de datos",
                                MessageType = "Success",
                                Data = result
                            };
                        }
                        else
                        {
                            // El archivo se guardó físicamente pero hubo un error al guardar los metadatos
                            return new ApiResponse
                            {
                                Success = true,
                                Message = $"Archivo subido correctamente pero hubo un error al guardar los metadatos: {dbResult.Message}",
                                MessageType = "Warning",
                                Data = result
                            };
                        }
                    }
                    else
                    {
                        return new ApiResponse
                        {
                            Success = false,
                            Message = "Error al guardar el archivo",
                            MessageType = "Error",
                            Data = new object()
                        };
                    }
                }
                catch (Exception ex)
                {
                    return new ApiResponse
                    {
                        Success = false,
                        Message = $"Error al procesar el archivo: {ex.Message}",
                        MessageType = "Error",
                        Data = new object()
                    };
                }
            }
            catch (Exception ex)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = ex.Message,
                    MessageType = "Error",
                    Data = new object()
                };
            }
        }

        /// <summary>
        /// Elimina un archivo físicamente y sus metadatos de la base de datos
        /// </summary>
        /// <param name="filePath">Ruta relativa del archivo</param>
        /// <param name="customDirectory">Directorio personalizado (opcional)</param>
        /// <returns>Resultado de la operación</returns>
        [HttpDelete("{*filePath}")]
        public async Task<ActionResult<ApiResponse>> DeleteFile(string filePath, [FromQuery] string? customDirectory = null)
        {
            Console.WriteLine($"Eliminando archivo: {filePath}");
            try
            {
                var log = await _logHelper.CreateLogFromTokenAsync(HttpContext);
                
                // Eliminar el archivo físicamente
                bool fileDeleted = _fileStorageHelper.DeleteFile(filePath);
                
                // Si el archivo se eliminó físicamente o no existía, intentar eliminar los metadatos
                bool fileExists = _fileStorageHelper.FileExists(filePath);
                if (fileDeleted || !fileExists)
                {
                    // Eliminar los metadatos del archivo de la base de datos
                    var dbResult = await _fileStorageRepository.DeleteFileMetadata(filePath, customDirectory, log);
                    
                    // Verificar si la operación fue exitosa (dbResult.Success es bool, no bool?)
                    if (dbResult.Success == true)
                    {
                        return new ApiResponse
                        {
                            Success = true,
                            Message = fileDeleted 
                                ? "Archivo eliminado físicamente y sus metadatos de la base de datos" 
                                : "Archivo no encontrado físicamente, pero sus metadatos fueron eliminados de la base de datos",
                            MessageType = "Success",
                            Data = new { FileDeleted = fileDeleted, MetadataDeleted = true }
                        };
                    }
                    else
                    {
                        return new ApiResponse
                        {
                            Success = fileDeleted, // Éxito parcial si al menos se eliminó el archivo físico
                            Message = fileDeleted 
                                ? $"Archivo eliminado físicamente, pero no se pudieron eliminar los metadatos: {dbResult.Message}" 
                                : $"No se encontró el archivo físicamente ni se pudieron eliminar los metadatos: {dbResult.Message}",
                            MessageType = fileDeleted ? "Warning" : "Error",
                            Data = new { FileDeleted = fileDeleted, MetadataDeleted = false }
                        };
                    }
                }
                else
                {
                    return new ApiResponse
                    {
                        Success = false,
                        Message = "No se pudo eliminar el archivo o no existe",
                        MessageType = "Error",
                        Data = new { FileDeleted = false, MetadataDeleted = false }
                    };
                }
            }
            catch (Exception ex)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = $"Error al eliminar el archivo: {ex.Message}",
                    MessageType = "Error",
                    Data = new object()
                };
            }
        }

        /// <summary>
        /// Verifica si un archivo existe
        /// </summary>
        /// <param name="filePath">Ruta relativa del archivo</param>
        /// <returns>Resultado de la verificación</returns>
        [HttpGet("exists/{*filePath}")]
        public async Task<ActionResult<ApiResponse>> FileExists(string filePath)
        {
            try
            {
                var log = await _logHelper.CreateLogFromTokenAsync(HttpContext);
                
                bool exists = _fileStorageHelper.FileExists(filePath);
                
                return new ApiResponse
                {
                    Success = true,
                    Message = exists ? "El archivo existe" : "El archivo no existe",
                    MessageType = "Success",
                    Data = new { Exists = exists }
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = ex.Message,
                    MessageType = "Error",
                    Data = new object()
                };
            }
        }
    }
}
