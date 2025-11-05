// *****************************************************************************************************
// Descripción       : Modelo para respuestas de carga de archivos
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 19/06/2025
// Acción a Realizar : Definir modelo para respuestas de carga de archivos
// *****************************************************************************************************

namespace saas_template.server.Models.FileStorage
{
    /// <summary>
    /// Modelo para la respuesta de carga de archivos
    /// </summary>
    public class FileUploadResponse
    {
        /// <summary>
        /// Nombre del archivo guardado
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// Nombre original del archivo
        /// </summary>
        public string OriginalFileName { get; set; }
        
        /// <summary>
        /// Ruta relativa del archivo guardado
        /// </summary>
        public string FilePath { get; set; }
        
        /// <summary>
        /// URL completa para acceder al archivo
        /// </summary>
        public string FileUrl { get; set; }
        
        /// <summary>
        /// Tamaño del archivo en bytes
        /// </summary>
        public long FileSize { get; set; }

        /// <summary>
        /// Tipo del archivo
        /// </summary>
        public string FileType { get; set; }

        /// <summary>
        /// Tipo MIME del archivo
        /// </summary>
        public string MimeType { get; set; }

        /// <summary>
        /// Indica si el archivo es una imagen
        /// </summary>
        public bool IsImage { get; set; }
        
        /// <summary>
        /// Directorio personalizado donde se almacenó el archivo
        /// </summary>
        public string? CustomDirectory { get; set; }
        
        /// <summary>
        /// Constructor por defecto
        /// </summary>
        public FileUploadResponse()
        {
            FileName = string.Empty;
            OriginalFileName = string.Empty;
            FilePath = string.Empty;
            FileUrl = string.Empty;
            FileSize = 0;
            FileType = string.Empty;
            MimeType = string.Empty;
            IsImage = false;
            CustomDirectory = null;
        }
    }
}
