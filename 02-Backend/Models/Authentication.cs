// *****************************************************************************************************
// Descripción       : Modelo para la respuesta de autenticación
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Propósito        : Representa la respuesta después de una autenticación exitosa
// *****************************************************************************************************

namespace saas_template.server.Models.Auth
{
    /// <summary>
    /// Representa el resultado de una autenticación exitosa
    /// </summary>
    public class Authentication
    {
        /// <summary>
        /// Token JWT generado para el User autenticado
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Información del User autenticado
        /// </summary>
        public User User { get; set; } = new User();
        
        /// <summary>
        /// Fecha y hora de expiración del token
        /// </summary>
        public DateTime ExpiresAt { get; set; }
        
        /// <summary>
        /// Tipo de sesión: "normal" (8 horas) o "extended" (30 días)
        /// </summary>
        public string SessionType { get; set; } = "normal";
    }
}
