// *****************************************************************************************************
// Descripción       : Helper para el almacenamiento de archivos
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 19/06/2025
// Acción a Realizar : Proporcionar métodos para almacenar y recuperar archivos
// *****************************************************************************************************


using saas_template.server.Models.FileStorage;

namespace saas_template.server.DataAccessObject.Helper
{
    public class FileStorageHelper
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly string _baseUrl;

        /// <summary>
        /// Constructor del helper de almacenamiento de archivos
        /// </summary>
        /// <param name="hostingEnvironment">Entorno de hosting</param>
        /// <param name="httpContextAccessor">Acceso al contexto HTTP</param>
        public FileStorageHelper(IWebHostEnvironment hostingEnvironment, IHttpContextAccessor httpContextAccessor)
        {
            _hostingEnvironment = hostingEnvironment;
            _httpContextAccessor = httpContextAccessor;
            
            // Construir la URL base para acceder a los archivos
            var request = _httpContextAccessor.HttpContext?.Request;
            _baseUrl = $"{request?.Scheme}://{request?.Host}";
        }

        /// <summary>
        /// Obtiene el directorio de uploads según el entorno y lo crea si no existe
        /// </summary>
        /// <returns>Ruta completa al directorio de uploads</returns>
        private string GetUploadsDirectory()
        {
            string uploadsDirectory;
            
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                uploadsDirectory = Path.Combine(_hostingEnvironment.ContentRootPath, "uploads");
            }
            else
            {
                uploadsDirectory = Path.Combine(_hostingEnvironment.WebRootPath, "uploads");
            }
            
            // Crear el directorio si no existe
            if (!Directory.Exists(uploadsDirectory))
            {
                Directory.CreateDirectory(uploadsDirectory);
            }
            
            return uploadsDirectory;
        }

        /// <summary>
        /// Elimina un archivo
        /// </summary>
        /// <param name="filePath">Ruta relativa del archivo</param>
        /// <returns>True si se eliminó correctamente</returns>
        public bool DeleteFile(string filePath)
        {
            try
            {
                // Decodificar la URL y normalizar la ruta
                string decodedPath = System.Net.WebUtility.UrlDecode(filePath).TrimStart('/');
                string fullPath = Path.Combine(GetUploadsDirectory(), decodedPath);
                
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al eliminar archivo: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Verifica si un archivo existe
        /// </summary>
        /// <param name="filePath">Ruta relativa del archivo</param>
        /// <returns>True si el archivo existe</returns>
        public bool FileExists(string filePath)
        {
            try
            {
                // Decodificar la URL y normalizar la ruta
                string decodedPath = System.Net.WebUtility.UrlDecode(filePath).TrimStart('/');
                string fullPath = Path.Combine(GetUploadsDirectory(), decodedPath);
                
                bool exists = File.Exists(fullPath);
                
                return exists;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al verificar existencia de archivo: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Guarda un archivo en el servidor
        /// </summary>
        /// <param name="file">Archivo a guardar</param>
        /// <param name="options">Opciones de carga</param>
        /// <param name="filePrefix">Prefijo para el nombre del archivo</param>
        /// <param name="fileSuffix">Sufijo para el nombre del archivo</param>
        /// <param name="generateUniqueFileName">Indica si se debe generar un nombre único</param>
        /// <param name="customDirectory">Directorio personalizado</param>
        /// <returns>Información del archivo guardado o null si hay error</returns>
        public async Task<FileUploadResponse?> SaveFileAsync(
            IFormFile file, 
            FileUploadOptions options, 
            string? filePrefix = null, 
            string? fileSuffix = null, 
            bool generateUniqueFileName = true, 
            string? customDirectory = null)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return null;
                
                // Obtener extensión del archivo
                string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                string originalFileName = Path.GetFileNameWithoutExtension(file.FileName);
                
                // Generar nombre de archivo
                string fileName = originalFileName;
                
                // Aplicar prefijo si existe
                if (!string.IsNullOrEmpty(filePrefix))
                    fileName = $"{filePrefix}_{fileName}";
                
                // Aplicar sufijo si existe
                if (!string.IsNullOrEmpty(fileSuffix))
                    fileName = $"{fileName}_{fileSuffix}";
                
                // Generar nombre único si se solicita
                if (generateUniqueFileName)
                    fileName = $"{fileName}_{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid().ToString().Substring(0, 8)}";
                
                // Usar nombre personalizado si se proporciona
                if (!string.IsNullOrEmpty(options.CustomFileName))
                    fileName = options.CustomFileName;
                
                // Construir la ruta del archivo
                string fileType = options.FileType ?? "general";
                string relativePath = Path.Combine(fileType, DateTime.Now.ToString("yyyy-MM"));
                
                // Usar directorio personalizado si se proporciona
                if (!string.IsNullOrEmpty(customDirectory))
                    relativePath = customDirectory;
                
                string directoryPath = Path.Combine(GetUploadsDirectory(), relativePath);
                
                // Crear el directorio si no existe
                if (!Directory.Exists(directoryPath))
                    Directory.CreateDirectory(directoryPath);
                
                // Ruta completa del archivo
                string fullPath = Path.Combine(directoryPath, $"{fileName}{fileExtension}");
                string relativeFilePath = Path.Combine(relativePath, $"{fileName}{fileExtension}");
                
                // Guardar el archivo
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                // Procesar imagen si es necesario
                if (IsImageFile(fileExtension) && options.CompressImage)
                {
                    // Implementar procesamiento de imagen aquí si es necesario
                    // Por ejemplo, redimensionar o comprimir
                }
                
                // Construir la URL del archivo
                string fileUrl = $"{_baseUrl}/uploads/{relativeFilePath.Replace("\\", "/")}";
                
                // Devolver respuesta
                return new FileUploadResponse
                {
                    FileName = $"{fileName}{fileExtension}",
                    OriginalFileName = file.FileName,
                    FilePath = relativeFilePath.Replace("\\", "/"),
                    FileUrl = fileUrl,
                    FileSize = file.Length,
                    FileType = fileType,
                    MimeType = GetMimeTypeFromExtension(fileExtension),
                    IsImage = IsImageFile(fileExtension),
                    CustomDirectory = customDirectory
                };
            }
            catch (Exception ex)
            {
                // Log del error
                Console.WriteLine($"Error al guardar archivo: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Verifica si un archivo es una imagen
        /// </summary>
        /// <param name="extension">Extensión del archivo</param>
        /// <returns>True si es una imagen</returns>
        private bool IsImageFile(string extension)
        {
            string[] imageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp" };
            return Array.Exists(imageExtensions, ext => ext.Equals(extension, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Obtiene el tipo MIME a partir de la extensión
        /// </summary>
        /// <param name="extension">Extensión del archivo</param>
        /// <returns>Tipo MIME</returns>
        private string GetMimeTypeFromExtension(string extension)
        {
            return extension.ToLowerInvariant() switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".tiff" => "image/tiff",
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".ppt" => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".txt" => "text/plain",
                ".csv" => "text/csv",
                ".zip" => "application/zip",
                ".rar" => "application/x-rar-compressed",
                ".mp3" => "audio/mpeg",
                ".mp4" => "video/mp4",
                ".wav" => "audio/wav",
                ".avi" => "video/x-msvideo",
                ".mov" => "video/quicktime",
                _ => "application/octet-stream"
            };
        }
        
        /// <summary>
        /// Obtiene la lista de archivos de un directorio
        /// </summary>
        /// <param name="customDirectory">Directorio personalizado (opcional)</param>
        /// <returns>Lista de archivos</returns>
        public List<FileUploadResponse> GetFilesFromDirectory(string? customDirectory = null)
        {
            try
            {
                // Obtener el directorio base de uploads
                string baseDirectory = GetUploadsDirectory();
                
                // Si se proporciona un directorio personalizado, combinarlo con el directorio base
                string targetDirectory = baseDirectory;
                if (!string.IsNullOrEmpty(customDirectory))
                {
                    customDirectory = customDirectory.TrimStart('/');
                    targetDirectory = Path.Combine(baseDirectory, customDirectory);
                }
                
                // Verificar si el directorio existe
                if (!Directory.Exists(targetDirectory))
                {
                    return new List<FileUploadResponse>();
                }
                
                // Obtener todos los archivos del directorio y subdirectorios
                var files = Directory.GetFiles(targetDirectory, "*", SearchOption.AllDirectories);
                
                // Convertir la información de los archivos a FileUploadResponse
                var result = new List<FileUploadResponse>();
                foreach (var file in files)
                {
                    var fileInfo = new FileInfo(file);
                    string relativePath = file.Replace(baseDirectory, "").TrimStart('\\', '/');
                    string fileType = Path.GetDirectoryName(relativePath)?.Split('\\', '/').FirstOrDefault() ?? "general";
                    
                    result.Add(new FileUploadResponse
                    {
                        FileName = fileInfo.Name,
                        OriginalFileName = fileInfo.Name,
                        FilePath = relativePath,
                        FileUrl = $"{_baseUrl}/uploads/{relativePath}",
                        FileSize = fileInfo.Length,
                        FileType = fileType,
                        MimeType = GetMimeTypeFromExtension(fileInfo.Extension),
                        IsImage = IsImageFile(fileInfo.Extension)
                    });
                }
                
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener archivos del directorio: {ex.Message}");
                return new List<FileUploadResponse>();
            }
        }
    }
}
