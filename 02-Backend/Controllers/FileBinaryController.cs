// *****************************************************************************************************
// Descripción       : Controlador para el manejo de archivos binarios almacenados en base de datos
// Creado por        : Cascade
// Fecha de Creación : 24/06/2023
// Acción a Realizar : Proporcionar endpoints para la gestión de archivos binarios
// *****************************************************************************************************

// Extensiones
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
// Modelos
using System.IO.Compression;
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
    [RequestFormLimits(MultipartBodyLengthLimit = 104857600)] // 100MB
    [RequestSizeLimit(104857600)] // 100MB
    public class FileBinaryController : ControllerBase
    {
        private readonly FileStorageHelper _fileStorageHelper;
        private readonly LogHelper _logHelper;
        private readonly IFileStorageRepository _fileStorageRepository;

        public FileBinaryController(FileStorageHelper fileStorageHelper, LogHelper logHelper, IConfiguration configuration)
        {
            _fileStorageHelper = fileStorageHelper;
            _logHelper = logHelper;
            _fileStorageRepository = RepositoryFactory.GetInstanceSqlServer(configuration).GetFileStorageRepository();
        }

        /// <summary>
        /// Sube un archivo al servidor y lo almacena en la base de datos como contenido binario
        /// </summary>
        /// <param name="request">Datos del archivo a subir</param>
        /// <returns>Información del archivo subido</returns>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ApiResponse>> UploadFileToBinary([FromForm] FileUploadRequest request)
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
                    MaxFileSize = request.MaxFileSize > 0 ? request.MaxFileSize : 10 * 1024 * 1024, // 10MB por defecto
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
                    // Variables para medir el tamaño original y comprimido
                    long originalSize = request.File.Length;
                    long compressedSize = 0;
                    byte[] compressedContent;
                    
                    // Crear un objeto para almacenar los metadatos del archivo
                    var result = new FileUploadResponse
                    {
                        FileName = request.CustomFileName ?? request.File.FileName,
                        FilePath = string.Empty, // No se guarda físicamente
                        FileUrl = string.Empty, // No hay URL física
                        FileSize = request.File.Length,
                        FileType = Path.GetExtension(request.File.FileName).TrimStart('.'),
                        MimeType = request.File.ContentType,
                        CustomDirectory = request.CustomDirectory ?? "binary-files",
                        IsImage = request.File.ContentType.StartsWith("image/")
                    };
                    
                    // Comprimir el contenido directamente desde el stream del archivo
                    using (var fileStream = request.File.OpenReadStream())
                    using (var compressedStream = new MemoryStream())
                    {
                        // Usar un buffer para optimizar la compresión
                        using (var gzipStream = new GZipStream(compressedStream, CompressionLevel.Optimal))
                        {
                            // Copiar el contenido del archivo al stream de compresión usando un buffer
                            await fileStream.CopyToAsync(gzipStream, 81920); // Buffer de 80KB para mejor rendimiento
                        }
                        
                        // Obtener el contenido comprimido
                        compressedContent = compressedStream.ToArray();
                        compressedSize = compressedContent.Length;
                    }
                    
                    Console.WriteLine($"Aca termino de comprimir");
                    
                    // Guardar los metadatos y el contenido binario del archivo en la base de datos
                    var dbResult = await _fileStorageRepository.SaveFileWithBinaryContent(result, compressedContent, log);
                    
                    Console.WriteLine($"Aca termino de guardar en la base de datos");
                    
                    if (dbResult.Success == true)
                    {
                        return new ApiResponse
                        {
                            Success = true,
                            Message = "Archivo subido correctamente y guardado en la base de datos como contenido binario",
                            MessageType = "Success",
                            Data = new { 
                                FileInfo = result,
                                FileId = dbResult.Data,
                                HasBinaryContent = true,
                                OriginalSize = originalSize,
                                CompressedSize = compressedSize,
                                CompressionRatio = originalSize > 0 ? (double)compressedSize / originalSize : 0
                            }
                        };
                    }
                    else
                    {
                        return new ApiResponse
                        {
                            Success = false,
                            Message = dbResult.Message ?? "Error al guardar el archivo en la base de datos",
                            MessageType = "Warning",
                            Data = result
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
        /// Descarga un archivo almacenado en la base de datos
        /// </summary>
        /// <param name="fileId">ID del archivo a descargar</param>
        /// <returns>Archivo para descargar</returns>
        [HttpGet("download/{fileId}")]
        [Authorize]
        public async Task<IActionResult> DownloadFileFromBinary(int fileId)
        {
            try
            {
                var log = await _logHelper.CreateLogFromTokenAsync(HttpContext);
                var result = await _fileStorageRepository.GetFileBinaryContent(fileId, log);
                
                if (result.Success == true && result.Data != null)
                {
                    var fileData = result.Data as StoredFile;
                    
                    if (fileData == null || fileData.FileContent == null || fileData.FileContent.Length == 0)
                    {
                        return BadRequest("El archivo no tiene contenido binario almacenado");
                    }

                    // Asegurar que se envía el tipo MIME correcto
                    string mimeType = string.IsNullOrEmpty(fileData.MimeType) ? "application/octet-stream" : fileData.MimeType;
                    
                    // Crear un stream de memoria con el contenido comprimido
                    var compressedStream = new MemoryStream(fileData.FileContent);
                    
                    // Crear un stream de respuesta que descomprime al vuelo
                    var responseStream = new FileStreamResult(
                        new GZipStream(compressedStream, CompressionMode.Decompress),
                        mimeType
                    )
                    {
                        FileDownloadName = fileData.FileName
                    };
                    
                    return responseStream;
                }
                return NotFound("Archivo no encontrado");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al descargar el archivo: {ex.Message}");
            }
        }

        // /// <summary>
        // /// Obtiene información de un archivo binario almacenado en la base de datos
        // /// </summary>
        // /// <param name="fileId">ID del archivo</param>
        // /// <returns>Información del archivo</returns>
        // [HttpGet("info/{fileId}")]
        // [Authorize]
        // public async Task<ActionResult<ApiResponse>> GetFileBinaryInfo(int fileId)
        // {
        //     try
        //     {
        //         var log = await _logHelper.CreateLogFromTokenAsync(HttpContext);
        //         var result = await _fileStorageRepository.GetFileBinaryInfo(fileId, log);
                
        //         if (result.Success)
        //         {
        //             return new ApiResponse
        //             {
        //                 Success = true,
        //                 Message = "Información del archivo obtenida correctamente",
        //                 MessageType = "Success",
        //                 Data = result.Data
        //             };
        //         }
        //         else
        //         {
        //             return new ApiResponse
        //             {
        //                 Success = false,
        //                 Message = result.Message,
        //                 MessageType = "Error",
        //                 Data = new object()
        //             };
        //         }
        //     }
        //     catch (Exception ex)
        //     {
        //         return new ApiResponse
        //         {
        //             Success = false,
        //             Message = ex.Message,
        //             MessageType = "Error",
        //             Data = new object()
        //         };
        //     }
        // }
    }
}
