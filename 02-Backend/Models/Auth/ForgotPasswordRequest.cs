using System.ComponentModel.DataAnnotations;

namespace saas_template.server.Models.Auth
{
    /// <summary>
    /// Modelo para la solicitud de recuperación de contraseña
    /// </summary>
    public class ForgotPasswordRequest
    {
        /// <summary>
        /// Correo electrónico del usuario que solicita recuperación de contraseña
        /// </summary>
        [Required(ErrorMessage = "El correo electrónico es requerido")]
        [EmailAddress(ErrorMessage = "Formato de correo electrónico inválido")]
        public string Email { get; set; } = string.Empty;
    }
}
