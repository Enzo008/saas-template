// *****************************************************************************************************
// Descripción       : Controlador para la autenticación de Users
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Gestionar la autenticación y autorización de Users
// *****************************************************************************************************

// Extensiones
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
// Modelos
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.Models;
using saas_template.server.Models.Auth;
using saas_template.server.DataAccessObject.Helper;
using saas_template.server.DataAccessObject.Core;
using saas_template.server.Config;
using saas_template.server.Extensions;
// Base
using saas_template.server.Controllers.Base;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
// Libreria Helper
using static Helper.Types;
using Helper;

namespace saas_template.server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticationController : BaseController
    {
        // Declaración de variables globales
        private readonly IAuthenticationRepository iAuthDao;
        private readonly IConfiguration iConfiguration;
        private readonly LogHelper clsLogHelper;
        private readonly IWebHostEnvironment _webHostEnvironment;

        // Constructor
        public AuthenticationController(LogHelper logHelper, IConfiguration configuration, IWebHostEnvironment webHostEnvironment)
        {
            clsLogHelper = logHelper;
            iConfiguration = configuration;
            _webHostEnvironment = webHostEnvironment;
            iAuthDao = RepositoryFactory.GetInstanceSqlServer(configuration).GetAuthenticationRepository();
        }

        [HttpPost("login")]
        public async Task<ActionResult<OperationResponse>> Login([FromBody] LoginRequest loginRequest)
        {
            try
            {
                // Validar que el request no sea nulo
                if (loginRequest == null)
                {
                    return Error<OperationResponse>("Datos de login requeridos");
                }

                var result = await iAuthDao.Login(loginRequest.UseEma, loginRequest.UsePas);
                Console.WriteLine("result.Data: " + result.Data);
                Console.WriteLine("result.Success: " + result.Success);
                Console.WriteLine("result.Message: " + result.Message);
                
                if (result.Success && result.Data != null)
                {
                    var resUser = result.Data as User;
                    if (resUser != null)
                    {
                        Console.WriteLine("resUser: " + resUser.UsePas);
                        Console.WriteLine("loginRequest.UsePas: " + loginRequest.UsePas);
                        // Verificamos la contraseña con PasswordHelper
                        if (PasswordHelper.VerifyPassword(loginRequest.UsePas, resUser?.UsePas ?? string.Empty))
                        {
                            // Generar token con duración basada en keepSession
                            var strToken = SecurityHelper.GenerateToken(resUser!, loginRequest.KeepSession);
                            var expiresAt = SecurityHelper.GetTokenExpiration(strToken);
                            var sessionType = loginRequest.KeepSession ? "extended" : "normal";

                            var message = loginRequest.KeepSession ? 
                                "Inicio de sesión exitoso - Sesión extendida (30 días)" : 
                                "Inicio de sesión exitoso - Sesión normal (8 horas)";
                                
                            return Success<OperationResponse>(message, new Authentication
                            {
                                Token = strToken,
                                User = resUser!,
                                ExpiresAt = expiresAt,
                                SessionType = sessionType
                            });
                        }
                        
                        return Warning<OperationResponse>("Contraseña incorrecta");
                    }
                    
                    // Si el casting falla, retornamos un error
                    return Error<OperationResponse>("Error en los datos del User");
                }
                
                return Error<OperationResponse>("No se encontró el User verificar el correo y contraseña");
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        /// <summary>
        /// Valida la sesión del User mediante la verificación del token JWT.
        /// 
        /// IMPORTANTE: Este método utiliza la clave secreta de la configuración (JwtSettings:SecretKey)
        /// o la clave por defecto si la configuración no está disponible. Esta clave debe coincidir
        /// con la utilizada en SecurityHelper.GenerateToken para que la validación sea exitosa.
        /// </summary>
        /// <returns>Información del User si el token es válido, o un mensaje de error si no lo es</returns>
        [HttpGet("validate")]
        [Authorize]
        public async Task<ActionResult<OperationResponse>> ValidateSession()
        {
            try
            {
                var authHeader = HttpContext.Request.Headers["Authorization"].FirstOrDefault();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    return Error<OperationResponse>("Token no proporcionado");
                }

                var strToken = authHeader.Substring("Bearer ".Length);
                var clsTokenHandler = new JwtSecurityTokenHandler();
                
                // Obtener la clave de la configuración
                var secretKey = iConfiguration["JwtSettings:SecretKey"] ?? "03qQXpA0X3Z6O6RWbPOR1SizVCx0QHL1";
                var bytKey = Encoding.ASCII.GetBytes(secretKey);
                
                // Registrar la clave que se está utilizando (para depuración)
                Console.WriteLine($"ValidateSession: Usando clave para validar token: {secretKey.Substring(0, 5)}...");

                try
                {
                    var tokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(bytKey),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ClockSkew = TimeSpan.Zero
                    };

                    var listClaimsPrincipal = clsTokenHandler.ValidateToken(strToken, tokenValidationParameters, out var validatedToken);

                    var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);

                    var useYea = listClaimsPrincipal.Claims.FirstOrDefault(c => c.Type == "USEYEA")?.Value;
                    var useCod = listClaimsPrincipal.Claims.FirstOrDefault(c => c.Type == "USECOD")?.Value;
                    var useNam = listClaimsPrincipal.Claims.FirstOrDefault(c => c.Type == "USENAM")?.Value ?? "SYSTEM";
                    var useLasNam = listClaimsPrincipal.Claims.FirstOrDefault(c => c.Type == "USELASNAM")?.Value ?? "SYSTEM";

                    if (string.IsNullOrEmpty(useYea) || string.IsNullOrEmpty(useCod))
                    {
                        return Error<OperationResponse>("Token inválido: faltan claims necesarios");
                    }

                    var result = await iAuthDao.ValidateSession(useYea, useCod, bLog);

                    if (result.Data != null)
                    {
                        var resUser = result.Data as User;
                        if (resUser != null)
                        {
                            // NO regenerar token - devolver el token actual que ya es válido
                            // Esto mantiene la duración original (keepSession funcionará correctamente)
                            
                            // Extraer información del token para determinar el tipo de sesión
                            var tokenHandler = new JwtSecurityTokenHandler();
                            var tokenInfo = tokenHandler.ReadJwtToken(strToken);
                            var expiryClaim = tokenInfo.Claims.FirstOrDefault(c => c.Type == "exp");
                            var sessionType = "normal"; // Por defecto
                            
                            if (expiryClaim != null && long.TryParse(expiryClaim.Value, out var expUnix))
                            {
                                var expiration = DateTimeOffset.FromUnixTimeSeconds(expUnix);
                                var tokenDuration = expiration - DateTimeOffset.UtcNow;
                                // Si el token dura más de 12 horas, considerarlo como sesión extendida
                                sessionType = tokenDuration.TotalHours > 12 ? "extended" : "normal";
                            }
                            
                            return Success<OperationResponse>("Sesión validada correctamente", new Authentication
                            {
                                Token = strToken, // ← DEVOLVER EL MISMO TOKEN
                                User = resUser,
                                ExpiresAt = tokenInfo.ValidTo,
                                SessionType = sessionType
                            });
                        }
                        // Si el casting falla, retornamos un error
                        return Error<OperationResponse>("Error en los datos del User");
                    }
                    return Error<OperationResponse>("No se encontró el User");
                }
                catch (SecurityTokenException)
                {
                    return Error<OperationResponse>("Token inválido o expirado");
                }
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public ActionResult<OperationResponse> Logout()
        {
            // Obtener el token del header de autorización
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length);
                SecurityHelper.InvalidateToken(token);
            }

            return Success<OperationResponse>("Sesión cerrada correctamente");
        }

        [HttpGet("generate-hash")]
        public ActionResult<string> GenerateHash([FromQuery] string password)
        {
            try
            {
                // Validar que la contraseña cumpla con los requisitos mínimos de seguridad
                if (!PasswordHelper.IsPasswordSecure(password))
                {
                    return BadRequest("La contraseña debe tener al menos 8 caracteres.");
                }
                
                return Ok(PasswordHelper.HashPassword(password));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult<OperationResponse>> ChangePassword([FromBody] User bUser)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                // Obtener el User de la sesión
                var userClaims = User.Claims;
                var useYea = userClaims.FirstOrDefault(c => c.Type == "USEYEA")?.Value;
                var useCod = userClaims.FirstOrDefault(c => c.Type == "USECOD")?.Value;

                if (string.IsNullOrEmpty(useYea) || string.IsNullOrEmpty(useCod))
                {
                    return Error<OperationResponse>("User no encontrado en la sesión");
                }

                // Validar que la nueva contraseña cumpla con los requisitos mínimos de seguridad
                if (!PasswordHelper.IsPasswordSecure(bUser?.UsePas ?? string.Empty))
                {
                    return Warning<OperationResponse>("La contraseña debe tener al menos 8 caracteres.");
                }
                
                // Encriptar la nueva contraseña
                var encryptedPassword = PasswordHelper.HashPassword(bUser?.UsePas ?? string.Empty);

                bUser!.UsePas = encryptedPassword;
                bUser.UseYea = useYea;
                bUser.UseCod = useCod;

                // Cambiar la contraseña
                var response = await iAuthDao.ChangePassword(bUser, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult<OperationResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                // Validar que el request no sea nulo y contenga el email
                if (request == null || string.IsNullOrEmpty(request.Email))
                {
                    return Error<OperationResponse>("Correo electrónico requerido");
                }

                // Validar formato del email
                if (!IsValidEmail(request.Email))
                {
                    return Error<OperationResponse>("Formato de correo electrónico inválido");
                }

                // Buscar User por email
                var userResult = await iAuthDao.GetUserByEmail(request.Email, bLog);
                Console.WriteLine("userResult.Success: " + userResult.Success);
                Console.WriteLine("userResult.Data: " + userResult.Data);
                Console.WriteLine("userResult.Message: " + userResult.Message);
                
                // Si hay error en la consulta, retornar el error real
                if (!userResult.Success)
                {
                    return FromOperationResponse<OperationResponse>(userResult);
                }

                // Si no hay data (User no encontrado), manejar según el mensaje del SP
                if (userResult.Data == null)
                {
                    return FromOperationResponse<OperationResponse>(userResult);
                }

                var User = userResult.Data as User;
                if (User == null)
                {
                    return Error<OperationResponse>("Error al procesar los datos del User");
                }

                // Generar contraseña temporal
                string tempPassword = GenerateTemporaryPassword(User?.UseNam ?? string.Empty, User?.UseLas ?? string.Empty);
                
                // Encriptar la contraseña temporal
                string encryptedTempPassword = PasswordHelper.HashPassword(tempPassword);
                
                // Actualizar contraseña en la base de datos
                var updateResult = await iAuthDao.UpdatePasswordByEmail(request.Email, encryptedTempPassword, bLog);
                
                Console.WriteLine("updateResult.Success: " + updateResult.Success);
                Console.WriteLine("updateResult.Data: " + updateResult.Data);
                Console.WriteLine("updateResult.Message: " + updateResult.Message);
                Console.WriteLine("updateResult.Success: " + updateResult.Success);
                Console.WriteLine("updateResult.Data: " + updateResult.Data);
                Console.WriteLine("updateResult.Message: " + updateResult.Message);
                
                if (!updateResult.Success)
                {
                    return FromOperationResponse<OperationResponse>(updateResult);
                }

                // Enviar email con la contraseña temporal
                var emailSent = await SendPasswordResetEmail(User?.UseEma ?? string.Empty, User?.UseNam ?? string.Empty, tempPassword);
                
                if (!emailSent)
                {
                    // Revertir el cambio de contraseña si no se pudo enviar el email
                    Console.WriteLine($"Error: No se pudo enviar email de recuperación para {request.Email}");
                    return Error<OperationResponse>("Error al enviar el correo. Intente nuevamente más tarde.");
                }

                // Retornar el mensaje del SP de actualización de contraseña
                return Success<OperationResponse>("Contraseña temporal enviada exitosamente al correo electrónico.");
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        /// <summary>
        /// Generar contraseña temporal basada en nombre y apellido del User
        /// </summary>
        private string GenerateTemporaryPassword(string firstName, string lastName)
        {
            try
            {
                // Opción 1: Primer dígito del nombre + apellido + número aleatorio
                string firstChar = !string.IsNullOrEmpty(firstName) ? firstName.Substring(0, 1).ToUpper() : "T";
                string lastNamePart = !string.IsNullOrEmpty(lastName) && lastName.Length >= 3 
                    ? lastName.Substring(0, 3).ToLower() 
                    : "emp";
                
                // Generar número aleatorio de 4 dígitos
                Random random = new Random();
                int randomNumber = random.Next(1000, 9999);
                
                // Agregar un símbolo especial para cumplir requisitos de seguridad
                char[] specialChars = { '@', '#', '$', '%', '&', '*' };
                char specialChar = specialChars[random.Next(specialChars.Length)];
                
                return $"{firstChar}{lastNamePart}{randomNumber}{specialChar}";
            }
            catch
            {
                // Si hay error en la generación, usar contraseña aleatoria segura
                return GenerateRandomSecurePassword();
            }
        }

        /// <summary>
        /// Generar contraseña completamente aleatoria como fallback
        /// </summary>
        private string GenerateRandomSecurePassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";
            Random random = new Random();
            return new string(Enumerable.Repeat(chars, 12)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        /// <summary>
        /// Enviar email con contraseña temporal
        /// </summary>
        private async Task<bool> SendPasswordResetEmail(string email, string userName, string tempPassword)
        {
            try
            {
                // Crear una instancia de AppSettings con la configuración
                var appSettings = new AppSettings(iConfiguration);
                
                // Crear EmailHelper con todos los parámetros requeridos
                var emailHelper = new EmailHelper(appSettings, clsLogHelper, _webHostEnvironment);
                
                // Preparar datos para la plantilla
                var templateData = new Dictionary<string, string>
                {
                    { "UserName", userName ?? "User" },
                    { "TempPassword", tempPassword },
                    { "LoginUrl", $"{iConfiguration["AppSettings:FrontendUrl"]}/login" },
                    { "SupportEmail", iConfiguration["EmailSettings:SupportEmail"] ?? "soporte@empresa.com" },
                    { "CompanyName", iConfiguration["AppSettings:CompanyName"] ?? "SaaS Template" }
                };

                // Enviar email usando la plantilla de recuperación de contraseña
                var result = await emailHelper.SendTemplateEmailAsync(
                    "PasswordReset", // Nombre de la plantilla
                    email,
                    "Recuperación de Contraseña",
                    templateData
                );
                
                return result.Success;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar email de recuperación: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Validar formato de email
        /// </summary>
        private bool IsValidEmail(string email)
        {
            try
            {
                var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
                return emailRegex.IsMatch(email);
            }
            catch
            {
                return false;
            }
        }
    }
}