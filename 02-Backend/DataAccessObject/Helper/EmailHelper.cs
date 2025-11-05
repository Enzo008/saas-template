// *****************************************************************************************************
// Descripción       : Helper para el manejo de emails en el backend
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 04/08/2025
// Acción a Realizar : Proporcionar funcionalidad de email integrada con la configuración del sistema
// *****************************************************************************************************

using saas_template.server.Config;
using saas_template.server.Models;
using Helper;
using static Helper.Types;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace saas_template.server.DataAccessObject.Helper
{
    /// <summary>
    /// Helper para el manejo de emails integrado con la configuración del sistema
    /// </summary>
    public class EmailHelper
    {
        private readonly EmailSettings _emailSettings;
        private readonly TemplateManager _templateManager;

        /// <summary>
        /// Constructor del EmailHelper
        /// </summary>
        /// <param name="appSettings">Configuración de la aplicación</param>
        /// <param name="logHelper">Helper de logging</param>
        /// <param name="hostingEnvironment">Entorno de hosting</param>
        public EmailHelper(AppSettings appSettings, LogHelper logHelper, IWebHostEnvironment hostingEnvironment)
        {
            _emailSettings = appSettings.EmailSettings;
            _templateManager = new TemplateManager(appSettings, hostingEnvironment);
        }

        /// <summary>
        /// Envía un email simple
        /// </summary>
        /// <param name="email">Datos del email</param>
        /// <returns>Resultado de la operación</returns>
        public async Task<OperationResponse> SendEmailAsync(Email email)
        {
            try
            {
                using var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
                {
                    Credentials = new NetworkCredential(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword),
                    EnableSsl = _emailSettings.EnableSsl
                };

                using var message = new MailMessage
                {
                    From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                    Subject = email.Subject,
                    IsBodyHtml = !string.IsNullOrEmpty(email.HtmlBody)
                };

                // Establecer el cuerpo del email (HTML tiene prioridad)
                message.Body = !string.IsNullOrEmpty(email.HtmlBody) ? email.HtmlBody : email.Body ?? string.Empty;

                // Agregar destinatario principal
                message.To.Add(email.To);

                // Agregar CC si existen
                if (email.Cc != null && email.Cc.Any())
                {
                    foreach (var cc in email.Cc)
                    {
                        if (!string.IsNullOrEmpty(cc))
                            message.CC.Add(cc);
                    }
                }

                // Agregar BCC si existen
                if (email.Bcc != null && email.Bcc.Any())
                {
                    foreach (var bcc in email.Bcc)
                    {
                        if (!string.IsNullOrEmpty(bcc))
                            message.Bcc.Add(bcc);
                    }
                }

                // Configurar ReplyTo si está especificado
                if (!string.IsNullOrEmpty(email.ReplyTo))
                {
                    message.ReplyToList.Add(email.ReplyTo);
                }

                // Configurar prioridad
                if (email.IsHighPriority)
                {
                    message.Priority = MailPriority.High;
                }

                // Agregar adjuntos si existen
                if (email.Attachments != null && email.Attachments.Any())
                {
                    foreach (var attachment in email.Attachments)
                    {
                        // Crear un stream de memoria con el contenido del archivo
                        var stream = new MemoryStream(attachment.Content);
                        var mailAttachment = new Attachment(stream, attachment.FileName, attachment.ContentType);
                        
                        // Si es un adjunto en línea (embebido), configurar ContentId
                        if (attachment.IsInline && !string.IsNullOrEmpty(attachment.ContentId))
                        {
                            mailAttachment.ContentId = attachment.ContentId;
                            // Verificar que ContentDisposition no sea nulo antes de acceder a Inline
                            if (mailAttachment.ContentDisposition != null)
                            {
                                mailAttachment.ContentDisposition.Inline = true;
                            }
                        }
                        
                        message.Attachments.Add(mailAttachment);
                    }
                }

                await client.SendMailAsync(message);

                return OperationResponse.CreateSuccess("Email enviado exitosamente");
            }
            catch (Exception ex)
            {
                return OperationResponse.CreateError($"Error al enviar email: {ex.Message}");
            }
        }

        /// <summary>
        /// Envía múltiples emails
        /// </summary>
        /// <param name="emails">Lista de emails a enviar</param>
        /// <returns>Resultado de la operación</returns>
        public async Task<OperationResponse> SendBulkEmailsAsync(List<Email> emails)
        {
            if (emails == null || !emails.Any())
            {
                return OperationResponse.CreateError("No se proporcionaron emails para enviar");
            }

            try
            {
                var successCount = 0;
                var totalCount = emails.Count;
                var errors = new List<string>();

                foreach (var email in emails)
                {
                    var result = await SendEmailAsync(email);
                    if (result.Success)
                    {
                        successCount++;
                    }
                    else
                    {
                        errors.Add($"Error en {email.To}: {result.Message}");
                    }
                }

                if (successCount == totalCount)
                {
                    return OperationResponse.CreateSuccess($"Se enviaron exitosamente {successCount} de {totalCount} emails");
                }
                else
                {
                    var errorMessage = $"Se enviaron {successCount} de {totalCount} emails. Errores: {string.Join("; ", errors)}";
                    return OperationResponse.CreateError(errorMessage);
                }
            }
            catch (Exception ex)
            {
                return OperationResponse.CreateError($"Error al enviar emails masivos: {ex.Message}");
            }
        }

        /// <summary>
        /// Envía un email usando una plantilla
        /// </summary>
        /// <param name="templateName">Nombre de la plantilla</param>
        /// <param name="to">Destinatario principal</param>
        /// <param name="subject">Asunto del email</param>
        /// <param name="variables">Variables para reemplazar en la plantilla</param>
        /// <returns>Resultado de la operación</returns>
        public async Task<OperationResponse> SendTemplateEmailAsync(string templateName, string to, string subject, Dictionary<string, string> variables)
        {
            try
            {
                if (!_templateManager.TemplateExists(templateName))
                {
                    return OperationResponse.CreateError($"Plantilla '{templateName}' no encontrada");
                }

                var htmlBody = _templateManager.ProcessTemplate(templateName, variables);

                var email = new Email
                {
                    To = to,
                    Subject = subject,
                    HtmlBody = htmlBody
                };

                return await SendEmailAsync(email);
            }
            catch (Exception ex)
            {
                return OperationResponse.CreateError($"Error al enviar email con plantilla: {ex.Message}");
            }
        }

        /// <summary>
        /// Prueba la conexión SMTP
        /// </summary>
        /// <returns>Resultado de la prueba</returns>
        public async Task<OperationResponse> TestConnectionAsync()
        {
            try
            {
                // Crear un email de prueba enviado al mismo remitente
                var testEmail = new Email
                {
                    To = "enzoaguirre629@gmail.com",
                    Subject = "Test de Conexión SMTP",
                    Body = $"Prueba de conexión SMTP exitosa desde {_emailSettings.SenderName}. Fecha: {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                    FromEmail = _emailSettings.SenderEmail,
                    FromName = _emailSettings.SenderName
                };

                // Enviar el email de prueba
                var result = await SendEmailAsync(testEmail);
                
                if (result.Success)
                {
                    return OperationResponse.CreateSuccess($"Conexión SMTP exitosa. Email de prueba enviado a {_emailSettings.SenderEmail}");
                }
                else
                {
                    return OperationResponse.CreateError($"Error de conexión SMTP: {result.Message}");
                }
            }
            catch (Exception ex)
            {
                return OperationResponse.CreateError($"Error de conexión SMTP: {ex.Message}");
            }
        }

        /// <summary>
        /// Registra una nueva plantilla de email
        /// </summary>
        /// <param name="templateName">Nombre de la plantilla</param>
        /// <param name="templateContent">Contenido HTML de la plantilla</param>
        /// <returns>Resultado de la operación</returns>
        public OperationResponse RegisterTemplate(string templateName, string templateContent)
        {
            try
            {
                _templateManager.RegisterTemplate(templateName, templateContent);
                return OperationResponse.CreateSuccess($"Plantilla '{templateName}' registrada exitosamente");
            }
            catch (Exception ex)
            {
                return OperationResponse.CreateError($"Error al registrar plantilla: {ex.Message}");
            }
        }

        /// <summary>
        /// Envía email de bienvenida usando plantilla predefinida
        /// </summary>
        /// <param name="userEmail">Email del usuario</param>
        /// <param name="userName">Nombre del usuario</param>
        /// <returns>Resultado de la operación</returns>
        public async Task<OperationResponse> SendWelcomeEmailAsync(string userEmail, string userName)
        {
            var variables = new Dictionary<string, string>
            {
                { "UserName", userName },
                { "SystemName", "Helper" }
            };

            return await SendTemplateEmailAsync("welcome", userEmail, "¡Bienvenido al sistema!", variables);
        }

        /// <summary>
        /// Envía email de notificación usando plantilla predefinida
        /// </summary>
        /// <param name="userEmail">Email del usuario</param>
        /// <param name="message">Mensaje de la notificación</param>
        /// <returns>Resultado de la operación</returns>
        public async Task<OperationResponse> SendNotificationEmailAsync(string userEmail, string message)
        {
            var variables = new Dictionary<string, string>
            {
                { "Message", message },
                { "Date", DateTime.Now.ToString("dd/MM/yyyy HH:mm") },
                { "SystemName", "Helper" }
            };

            return await SendTemplateEmailAsync("notification", userEmail, "Notificación del Sistema", variables);
        }
    }
}
