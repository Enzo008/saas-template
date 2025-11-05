// *****************************************************************************************************
// Descripción       : Modelo para la solicitud de login con soporte para mantener sesión
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 19/01/2025
// Acción a Realizar : Manejar datos de login incluyendo opción de mantener sesión
// *****************************************************************************************************

namespace saas_template.server.Models.Auth
{
    public class LoginRequest
    {
        /// <summary>
        /// Correo electrónico del usuario
        /// </summary>
        public string UseEma { get; set; } = string.Empty;

        /// <summary>
        /// Contraseña del usuario
        /// </summary>
        public string UsePas { get; set; } = string.Empty;

        /// <summary>
        /// Indica si se debe mantener la sesión por más tiempo (30 días vs 8 horas)
        /// </summary>
        public bool KeepSession { get; set; } = false;
    }
}