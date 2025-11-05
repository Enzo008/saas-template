// *****************************************************************************************************
// Descripción       : Modelo para solicitudes de carga de archivos
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 19/06/2025
// Acción a Realizar : Definir modelo para solicitudes de carga de archivos
// *****************************************************************************************************

namespace saas_template.server.Models.FileStorage
{
    /// <summary>
    /// Modelo para la solicitud de carga de archivos
    /// </summary>
    public class FileUploadRequest
    {
        /// <summary>
        /// Archivo a subir
        /// </summary>
        public required IFormFile File { get; set; }
        
        /// <summary>
        /// Tipo de archivo (documento, imagen, etc.)
        /// </summary>
        public string? FileType { get; set; }
        
        /// <summary>
        /// Prefijo para el nombre del archivo (opcional)
        /// </summary>
        public string? FilePrefix { get; set; }
        
        /// <summary>
        /// Sufijo para el nombre del archivo (opcional)
        /// </summary>
        public string? FileSuffix { get; set; }
        
        /// <summary>
        /// Indica si se debe generar un nombre único para el archivo
        /// </summary>
        public bool GenerateUniqueFileName { get; set; } = true;
        
        /// <summary>
        /// Directorio personalizado donde guardar el archivo (relativo a la carpeta de uploads)
        /// </summary>
        public string? CustomDirectory { get; set; }
        
        /// <summary>
        /// Tamaño máximo permitido para el archivo en bytes
        /// </summary>
        public long MaxFileSize { get; set; } = 5 * 1024 * 1024; // 5MB por defecto
        
        /// <summary>
        /// Extensiones permitidas para el archivo
        /// </summary>
        public List<string> AllowedExtensions { get; set; } = new List<string>();
        
        /// <summary>
        /// Ancho máximo para imágenes
        /// </summary>
        public int? MaxWidth { get; set; }
        
        /// <summary>
        /// Alto máximo para imágenes
        /// </summary>
        public int? MaxHeight { get; set; }
        
        /// <summary>
        /// Indica si se debe comprimir la imagen
        /// </summary>
        public bool CompressImage { get; set; } = false;
        
        /// <summary>
        /// Calidad de compresión para imágenes (0-100)
        /// </summary>
        public int CompressionQuality { get; set; } = 75;
        
        /// <summary>
        /// Nombre personalizado para el archivo (opcional)
        /// </summary>
        public string? CustomFileName { get; set; }
        
        /// <summary>
        /// Datos en formato Base64 (para compatibilidad con versiones anteriores)
        /// </summary>
        public string? Base64Data { get; set; }
        
        /// <summary>
        /// Nombre del archivo original (para compatibilidad con versiones anteriores)
        /// </summary>
        public string? FileName { get; set; }
    }
}
