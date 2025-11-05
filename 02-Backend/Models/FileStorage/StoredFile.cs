// *****************************************************************************************************
// Descripción       : Modelo para archivos almacenados
// Creado por        : Cascade
// Fecha de Creación : 20/06/2025
// Modificado por    : Cascade
// Fecha de Modificación: 24/06/2023
// Acción a Realizar : Definir modelo para archivos almacenados con soporte para contenido binario
// *****************************************************************************************************

using System;

namespace saas_template.server.Models.FileStorage
{
    /// <summary>
    /// Modelo para archivos almacenados
    /// </summary>
    public class StoredFile
    {
        /// <summary>
        /// Identificador único del archivo
        /// </summary>
        public string FileId { get; set; } = string.Empty;

        /// <summary>
        /// Nombre original del archivo
        /// </summary>
        public string FileName { get; set; } = string.Empty;

        /// <summary>
        /// Ruta relativa del archivo
        /// </summary>
        public string FilePath { get; set; } = string.Empty;

        /// <summary>
        /// URL completa para acceder al archivo
        /// </summary>
        public string FileUrl { get; set; } = string.Empty;

        /// <summary>
        /// Tamaño del archivo en bytes
        /// </summary>
        public long FileSize { get; set; }

        /// <summary>
        /// Tipo de archivo (documento, imagen, etc.)
        /// </summary>
        public string FileType { get; set; } = string.Empty;

        /// <summary>
        /// Tipo MIME del archivo
        /// </summary>
        public string MimeType { get; set; } = string.Empty;

        /// <summary>
        /// Fecha de creación del archivo
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Directorio personalizado donde se almacena el archivo
        /// </summary>
        public string CustomDirectory { get; set; } = string.Empty;

        /// <summary>
        /// Indica si el archivo es una imagen
        /// </summary>
        public bool IsImage { get; set; }

        /// <summary>
        /// Indica si el archivo tiene contenido binario almacenado en la base de datos
        /// </summary>
        public bool HasBinaryContent { get; set; }

        /// <summary>
        /// Contenido binario del archivo (solo se carga cuando se solicita específicamente)
        /// </summary>
        public byte[]? FileContent { get; set; }

        /// <summary>
        /// Total de registros (para paginación)
        /// </summary>
        public int TotalRegistros { get; set; }
    }
}
