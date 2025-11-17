// *****************************************************************************************************
// Descripción       : User Controller
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Buscar Users 
// *****************************************************************************************************

// Extensiones
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
// Modelos
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.Models;
using saas_template.server.DataAccessObject.Helper;
using saas_template.server.Extensions;
// Base
using saas_template.server.Controllers.Base;
// Libreria Helper
using static Helper.Types;
using Helper;
using saas_template.server.DataAccessObject.Core;
// Atributos de permisos
using saas_template.server.Attributes;

namespace saas_template.server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : BaseController
    {
        // Declaración de variables globales
        private readonly IUserRepository iUserDao;
        private readonly LogHelper clsLogHelper;

        // Constructor
        public UserController(LogHelper logHelper, IConfiguration configuration)
        {
            clsLogHelper = logHelper;
            iUserDao = RepositoryFactory.GetInstanceSqlServer(configuration).GetUserRepository();
        }

        [HttpPost("buscar")]
        public async Task<ActionResult<OperationResponse>> Search([FromBody] User bUser)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iUserDao.Search(bUser, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost]
        public async Task<ActionResult<OperationResponse>> Create([FromBody] User bUser)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                
                // Verificar si se proporcionó una contraseña
                if (!string.IsNullOrEmpty(bUser.UsePas))
                {
                    // Validar que la contraseña cumpla con los requisitos mínimos de seguridad
                    if (!PasswordHelper.IsPasswordSecure(bUser.UsePas))
                    {
                        return Warning<OperationResponse>("La contraseña debe tener al menos 8 caracteres.");
                    }
                    
                    // Encriptar la contraseña con BCrypt antes de enviarla al DAO
                    bUser.UsePas = PasswordHelper.HashPassword(bUser.UsePas);
                }
                else
                {
                    // Si no se proporciona contraseña, generar una aleatoria
                    // Esto es útil para sistemas que envían contraseñas temporales por correo
                    string randomPassword = PasswordHelper.GenerateRandomPassword();
                    bUser.UsePas = PasswordHelper.HashPassword(randomPassword);
                    
                    // TODO: Implementar envío de correo con la contraseña temporal
                    // EmailService.SendTemporaryPassword(bUser.UsuCorEle, randomPassword);
                }
                
                var response = await iUserDao.CreateMultiStep(bUser, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost("menus-permisos-disponibles")]
        public async Task<ActionResult<OperationResponse>> GetAvailableMenusPermissions([FromBody] User User)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iUserDao.GetAllMenusPermissions(User, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost("multistep")]
        public async Task<ActionResult<OperationResponse>> CreateMultiStep([FromBody] User bUser)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                
                // Verificar si se proporcionó una contraseña
                if (!string.IsNullOrEmpty(bUser.UsePas))
                {
                    // Validar que la contraseña cumpla con los requisitos mínimos de seguridad
                    if (!PasswordHelper.IsPasswordSecure(bUser.UsePas))
                    {
                        return Warning<OperationResponse>("La contraseña debe tener al menos 8 caracteres.");
                    }
                    
                    // Encriptar la contraseña con BCrypt antes de enviarla al DAO
                    bUser.UsePas = PasswordHelper.HashPassword(bUser.UsePas);
                }
                else
                {
                    // Si no se proporciona contraseña, generar una aleatoria
                    string randomPassword = PasswordHelper.GenerateRandomPassword();
                    bUser.UsePas = PasswordHelper.HashPassword(randomPassword);
                    
                    // TODO: Implementar envío de correo con la contraseña temporal
                    // EmailService.SendTemporaryPassword(bUser.UsuCorEle, randomPassword);
                }
                
                var response = await iUserDao.CreateMultiStep(bUser, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPut]
        public async Task<ActionResult<OperationResponse>> UpdateMultiStep([FromBody] User bUser)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                
                // Para modificación, solo encriptar si se proporciona una nueva contraseña
                if (!string.IsNullOrEmpty(bUser.UsePas))
                {
                    // Validar que la contraseña cumpla con los requisitos mínimos de seguridad
                    if (!PasswordHelper.IsPasswordSecure(bUser.UsePas))
                    {
                        return Warning<OperationResponse>("La contraseña debe tener al menos 8 caracteres.");
                    }
                    
                    // Encriptar la nueva contraseña con BCrypt
                    bUser.UsePas = PasswordHelper.HashPassword(bUser.UsePas);
                }
                
                var response = await iUserDao.UpdateMultiStep(bUser, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }
    }   
}
