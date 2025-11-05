// *****************************************************************************************************
// Descripción       : Modelo para el manejo de emails
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 04/08/2025
// Acción a Realizar : Definir la estructura de datos para el envío de emails
// *****************************************************************************************************

using System.ComponentModel.DataAnnotations;

namespace saas_template.server.Models
{
    /// <summary>
    /// Modelo que representa un email para envío
    /// </summary>
    public class Email
    {
        /// <summary>
        /// Dirección de email del destinatario principal
        /// </summary>
        [Required(ErrorMessage = "La dirección de email del destinatario es requerida")]
        [EmailAddress(ErrorMessage = "La dirección de email no tiene un formato válido")]
        public string To { get; set; } = string.Empty;

        /// <summary>
        /// Lista de direcciones de email para copia (CC)
        /// </summary>
        public List<string> Cc { get; set; } = new List<string>();

        /// <summary>
        /// Lista de direcciones de email para copia oculta (BCC)
        /// </summary>
        public List<string> Bcc { get; set; } = new List<string>();

        /// <summary>
        /// Asunto del email
        /// </summary>
        [Required(ErrorMessage = "El asunto del email es requerido")]
        [StringLength(200, ErrorMessage = "El asunto no puede exceder los 200 caracteres")]
        public string Subject { get; set; } = string.Empty;

        /// <summary>
        /// Cuerpo del email en texto plano
        /// </summary>
        public string? Body { get; set; }

        /// <summary>
        /// Cuerpo del email en formato HTML
        /// </summary>
        public string? HtmlBody { get; set; }

        /// <summary>
        /// Indica si el email es de alta prioridad
        /// </summary>
        public bool IsHighPriority { get; set; } = false;

        /// <summary>
        /// Lista de archivos adjuntos
        /// </summary>
        public List<EmailAttachment> Attachments { get; set; } = new List<EmailAttachment>();

        /// <summary>
        /// Plantilla de email a utilizar (opcional)
        /// </summary>
        public string? Template { get; set; }

        /// <summary>
        /// Variables para reemplazar en la plantilla
        /// </summary>
        public Dictionary<string, string> TemplateVariables { get; set; } = new Dictionary<string, string>();

        /// <summary>
        /// Dirección de email personalizada del remitente (opcional)
        /// </summary>
        [EmailAddress(ErrorMessage = "La dirección de email del remitente no tiene un formato válido")]
        public string? FromEmail { get; set; }

        /// <summary>
        /// Nombre personalizado del remitente (opcional)
        /// </summary>
        public string? FromName { get; set; }

        /// <summary>
        /// Dirección de email para respuestas (opcional)
        /// </summary>
        [EmailAddress(ErrorMessage = "La dirección de email de respuesta no tiene un formato válido")]
        public string? ReplyTo { get; set; }
    }

    /// <summary>
    /// Modelo que representa un archivo adjunto para email
    /// </summary>
    public class EmailAttachment
    {
        /// <summary>
        /// Nombre del archivo
        /// </summary>
        [Required(ErrorMessage = "El nombre del archivo es requerido")]
        public string FileName { get; set; } = string.Empty;

        /// <summary>
        /// Contenido del archivo en bytes
        /// </summary>
        [Required(ErrorMessage = "El contenido del archivo es requerido")]
        public byte[] Content { get; set; } = Array.Empty<byte>();

        /// <summary>
        /// Tipo MIME del archivo
        /// </summary>
        public string ContentType { get; set; } = "application/octet-stream";

        /// <summary>
        /// Indica si el adjunto debe ser embebido en el HTML (para imágenes)
        /// </summary>
        public bool IsInline { get; set; } = false;

        /// <summary>
        /// ID de contenido para adjuntos embebidos
        /// </summary>
        public string? ContentId { get; set; }
    }

    /// <summary>
    /// Modelo para respuesta de envío de email
    /// </summary>
    public class EmailSendResult
    {
        /// <summary>
        /// Indica si el email fue enviado exitosamente
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Mensaje descriptivo del resultado
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// ID único del email enviado (si aplica)
        /// </summary>
        public string? EmailId { get; set; }

        /// <summary>
        /// Fecha y hora de envío
        /// </summary>
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Detalles adicionales del error (si aplica)
        /// </summary>
        public string? ErrorDetails { get; set; }
    }

    /// <summary>
    /// Modelo para plantillas de email
    /// </summary>
    public class EmailTemplate
    {
        /// <summary>
        /// Nombre único de la plantilla
        /// </summary>
        [Required(ErrorMessage = "El nombre de la plantilla es requerido")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Asunto de la plantilla
        /// </summary>
        [Required(ErrorMessage = "El asunto de la plantilla es requerido")]
        public string Subject { get; set; } = string.Empty;

        /// <summary>
        /// Cuerpo HTML de la plantilla
        /// </summary>
        [Required(ErrorMessage = "El cuerpo HTML de la plantilla es requerido")]
        public string HtmlBody { get; set; } = string.Empty;

        /// <summary>
        /// Cuerpo en texto plano de la plantilla (opcional)
        /// </summary>
        public string? TextBody { get; set; }

        /// <summary>
        /// Variables disponibles en la plantilla
        /// </summary>
        public List<string> AvailableVariables { get; set; } = new List<string>();

        /// <summary>
        /// Descripción de la plantilla
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Indica si la plantilla está activa
        /// </summary>
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// Modelo para solicitud de envío de email con plantilla
    /// </summary>
    public class TemplateEmailRequest
    {
        /// <summary>
        /// Nombre de la plantilla a utilizar
        /// </summary>
        [Required(ErrorMessage = "El nombre de la plantilla es requerido")]
        public string TemplateName { get; set; } = string.Empty;

        /// <summary>
        /// Dirección de email del destinatario
        /// </summary>
        [Required(ErrorMessage = "La dirección de email del destinatario es requerida")]
        [EmailAddress(ErrorMessage = "La dirección de email no tiene un formato válido")]
        public string To { get; set; } = string.Empty;

        /// <summary>
        /// Variables para reemplazar en la plantilla
        /// </summary>
        public Dictionary<string, string> Variables { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Modelo para envío de email simple
    /// </summary>
    public class SimpleEmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public bool IsHtml { get; set; } = false;
    }

    /// <summary>
    /// Modelo para email de bienvenida
    /// </summary>
    public class WelcomeEmailRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    /// <summary>
    /// Modelo para email de notificación
    /// </summary>
    public class NotificationEmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
