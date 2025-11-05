// *****************************************************************************************************
// Descripción       : Modelo para respuestas de operaciones
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 19/06/2025
// Acción a Realizar : Definir modelo de respuesta estándar para operaciones
// *****************************************************************************************************

namespace saas_template.server.Models
{
    /// <summary>
    /// Modelo estándar para respuestas de operaciones
    /// </summary>
    public class ApiResponse
    {
        /// <summary>
        /// Indica si la operación fue exitosa
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// Mensaje descriptivo del resultado de la operación
        /// </summary>
        public required string Message { get; set; }
        
        /// <summary>
        /// Tipo de mensaje (Success, Error, Warning, Info)
        /// </summary>
        public required string MessageType { get; set; }
        
        /// <summary>
        /// Datos adicionales de la operación
        /// </summary>
        public required object Data { get; set; }
        
        /// <summary>
        /// Constructor por defecto
        /// </summary>
        public ApiResponse()
        {
            Message = string.Empty;
            MessageType = "Info";
            Data = new object();
        }
        
        /// <summary>
        /// Constructor con parámetros básicos
        /// </summary>
        public ApiResponse(bool success, string message, string messageType = "Info", object? data = null)
        {
            Success = success;
            Message = message;
            MessageType = messageType;
            Data = data ?? new object();
        }
    }
}
