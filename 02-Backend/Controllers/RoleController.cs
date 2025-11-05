// *****************************************************************************************************
// Descripción       : Rol Controller
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 11/07/2025
// Acción a Realizar : Buscar Roles 
// *****************************************************************************************************

// Extensiones
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
// Modelos
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.Models;
using saas_template.server.DataAccessObject.Helper;
// Base
using saas_template.server.Controllers.Base;
// Libreria Helper
using static Helper.Types;
using Helper;
using saas_template.server.DataAccessObject.Core;

namespace saas_template.server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RoleController : BaseController
    {
        // Declaración de variables globales
        private readonly IRoleRepository iRoleDao;
        private readonly LogHelper clsLogHelper;

        // Constructor
        public RoleController(LogHelper logHelper, IConfiguration configuration)
        {
            clsLogHelper = logHelper;
            iRoleDao = RepositoryFactory.GetInstanceSqlServer(configuration).GetRoleRepository();
        }

        [HttpPost("buscar")]
        public async Task<ActionResult<OperationResponse>> Search([FromBody] Role bRole)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iRoleDao.Search(bRole, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost]
        public async Task<ActionResult<OperationResponse>> Create([FromBody] Role bRole)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iRoleDao.Create(bRole, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPut]
        public async Task<ActionResult<OperationResponse>> Update([FromBody] Role bRole)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iRoleDao.Update(bRole, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpDelete]
        public async Task<ActionResult<OperationResponse>> Delete([FromBody] Role bRole)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iRoleDao.Delete(bRole, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost("menus-permisos-disponibles")]
        public async Task<ActionResult<OperationResponse>> GetAvailableMenusPermissions([FromBody] Role bRole)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iRoleDao.GetAllMenusPermissions(bRole, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }
    }
}
