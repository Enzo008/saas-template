// *****************************************************************************************************
// Descripción       : Modelo para opciones de carga de archivos
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 19/06/2025
// Acción a Realizar : Definir modelo para opciones de carga de archivos
// *****************************************************************************************************

using System.Collections.Generic;

namespace saas_template.server.Models.FileStorage
{
    /// <summary>
    /// Configuración para la carga de archivos
    /// </summary>
    public class FileUploadOptions
    {
        /// <summary>
        /// Tipo de archivo (avatar, documento, etc.)
        /// </summary>
        public string FileType { get; set; } = "general";
        
        /// <summary>
        /// Tamaño máximo permitido en bytes (5MB por defecto)
        /// </summary>
        public long MaxFileSize { get; set; } = 5 * 1024 * 1024;
        
        /// <summary>
        /// Extensiones permitidas
        /// </summary>
        public List<string> AllowedExtensions { get; set; } = new List<string> { ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx", ".xls", ".xlsx" };
        
        /// <summary>
        /// Ancho máximo para imágenes (0 = sin límite)
        /// </summary>
        public int MaxWidth { get; set; } = 0;
        
        /// <summary>
        /// Alto máximo para imágenes (0 = sin límite)
        /// </summary>
        public int MaxHeight { get; set; } = 0;
        
        /// <summary>
        /// Indica si se debe comprimir la imagen
        /// </summary>
        public bool CompressImage { get; set; } = false;
        
        /// <summary>
        /// Calidad de compresión (0-100)
        /// </summary>
        public int CompressionQuality { get; set; } = 80;
        
        /// <summary>
        /// Nombre personalizado para el archivo (sin extensión)
        /// Si es null, se generará un nombre único
        /// </summary>
        public string? CustomFileName { get; set; } = null;
    }
}
