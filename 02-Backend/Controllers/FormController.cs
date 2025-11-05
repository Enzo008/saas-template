// *****************************************************************************************************
// Descripción       : Position Controller
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Buscar, Registrar, Modificar y Eliminar Cargos 
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
using Helper;
using saas_template.server.DataAccessObject.Core;

namespace saas_template.server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FormController : BaseController
    {
        // Declaración de variables globales
        private readonly IFormRepository iFormDao;
        private readonly LogHelper clsLogHelper;

        // Constructor
        public FormController(LogHelper logHelper, IConfiguration configuration)
        {
            clsLogHelper = logHelper;
            iFormDao = RepositoryFactory.GetInstanceSqlServer(configuration).GetFormRepository();
        }

        [HttpGet]
        public async Task<ActionResult<OperationResponse>> Buscar()
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iFormDao.Search(new FormMaster(), bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost("buscar")]
        public async Task<ActionResult<OperationResponse>> Buscar([FromBody] FormMaster bFormulario)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iFormDao.Search(bFormulario, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost]
        public async Task<ActionResult<OperationResponse>> Registrar([FromBody] FormMaster bFormulario)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iFormDao.Create(bFormulario, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPut]
        public async Task<ActionResult<OperationResponse>> Modificar([FromBody] FormMaster bFormulario)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iFormDao.Update(bFormulario, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpDelete]
        public async Task<ActionResult<OperationResponse>> Eliminar([FromBody] FormMaster bFormulario)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iFormDao.Delete(bFormulario, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }
    }
}