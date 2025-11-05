// *****************************************************************************************************
// Descripción       : Email Controller
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 04/08/2025
// Acción a Realizar : Manejar el envío de emails desde la API
// *****************************************************************************************************

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using saas_template.server.Models;
using saas_template.server.DataAccessObject.Helper;
using saas_template.server.Controllers.Base;
using saas_template.server.Config;
using Helper;
using static Helper.Types;
using Microsoft.AspNetCore.Hosting;

namespace saas_template.server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmailController : BaseController
    {
        private readonly EmailHelper _emailHelper;
        private readonly LogHelper _logHelper;

        /// <summary>
        /// Constructor del EmailController
        /// </summary>
        /// <param name="appSettings">Configuración de la aplicación</param>
        /// <param name="logHelper">Helper de logging</param>
        /// <param name="hostingEnvironment">Entorno de hosting</param>
        public EmailController(AppSettings appSettings, LogHelper logHelper, IWebHostEnvironment hostingEnvironment)
        {
            _logHelper = logHelper;
            _emailHelper = new EmailHelper(appSettings, logHelper, hostingEnvironment);
        }

        /// <summary>
        /// Envía un email simple
        /// </summary>
        /// <param name="email">Datos del email</param>
        /// <returns>Resultado del envío</returns>
        [HttpPost("send")]
        public async Task<ActionResult<OperationResponse>> SendEmail([FromBody] Email email)
        {
            try
            {
                var response = await _emailHelper.SendEmailAsync(email);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        /// <summary>
        /// Envía un email simple con parámetros básicos
        /// </summary>
        /// <param name="request">Datos básicos del email</param>
        /// <returns>Resultado del envío</returns>
        [HttpPost("send-simple")]
        public async Task<ActionResult<OperationResponse>> SendSimpleEmail([FromBody] SimpleEmailRequest request)
        {
            try
            {
                var email = new Email
                {
                    To = request.To,
                    Subject = request.Subject,
                    Body = request.IsHtml ? null : request.Body,
                    HtmlBody = request.IsHtml ? request.Body : null
                };

                var response = await _emailHelper.SendEmailAsync(email);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        /// <summary>
        /// Envía múltiples emails
        /// </summary>
        /// <param name="emails">Lista de emails</param>
        /// <returns>Resultado del envío masivo</returns>
        [HttpPost("send-bulk")]
        public async Task<ActionResult<OperationResponse>> SendBulkEmails([FromBody] List<Email> emails)
        {
            try
            {
                var response = await _emailHelper.SendBulkEmailsAsync(emails);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        /// <summary>
        /// Envía un email usando una plantilla
        /// </summary>
        /// <param name="request">Datos para el email con plantilla</param>
        /// <returns>Resultado del envío</returns>
        [HttpPost("send-template")]
        public async Task<ActionResult<OperationResponse>> SendTemplateEmail([FromBody] TemplateEmailRequest request)
        {
            try
            {
                var response = await _emailHelper.SendTemplateEmailAsync(
                    request.TemplateName,
                    request.To, 
                    "Email desde plantilla",
                    request.Variables);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        /// <summary>
        /// Registra una nueva plantilla de email
        /// </summary>
        /// <param name="template">Plantilla a registrar</param>
        /// <returns>Resultado del registro</returns>
        [HttpPost("register-template")]
        public ActionResult<OperationResponse> RegisterTemplate([FromBody] EmailTemplate template)
        {
            try
            {
                var response = _emailHelper.RegisterTemplate(template.Name, template.HtmlBody);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        /// <summary>
        /// Verifica la conectividad del servicio de email
        /// </summary>
        /// <returns>Resultado de la verificación</returns>
        [HttpGet("test-connection")]
        public async Task<ActionResult<OperationResponse>> TestConnection()
        {
            try
            {
                var response = await _emailHelper.TestConnectionAsync();
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        /// <summary>
        /// Envía un email de bienvenida usando plantilla predefinida
        /// </summary>
        /// <param name="request">Datos para el email de bienvenida</param>
        /// <returns>Resultado del envío</returns>
        [HttpPost("send-welcome")]
        public async Task<ActionResult<OperationResponse>> SendWelcomeEmail([FromBody] WelcomeEmailRequest request)
        {
            try
            {
                var response = await _emailHelper.SendWelcomeEmailAsync(request.Email, request.Name);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        /// <summary>
        /// Envía un email de notificación usando plantilla predefinida
        /// </summary>
        /// <param name="request">Datos para el email de notificación</param>
        /// <returns>Resultado del envío</returns>
        [HttpPost("send-notification")]
        public async Task<ActionResult<OperationResponse>> SendNotificationEmail([FromBody] NotificationEmailRequest request)
        {
            try
            {
                var response = await _emailHelper.SendNotificationEmailAsync(request.To, request.Message);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }
    }
}
