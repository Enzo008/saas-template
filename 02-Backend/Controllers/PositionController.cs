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
// Atributos de permisos
using saas_template.server.Attributes;

namespace saas_template.server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PositionController : BaseController
    {
        // Declaración de variables globales
        private readonly IPositionRepository iPositionDao;
        private readonly LogHelper clsLogHelper;

        // Constructor
        public PositionController(LogHelper logHelper, IConfiguration configuration)
        {
            clsLogHelper = logHelper;
            iPositionDao = RepositoryFactory.GetInstanceSqlServer(configuration).GetPositionRepository();
        }

        [HttpPost("buscar")]
        public async Task<ActionResult<OperationResponse>> Search([FromBody] Position bPosition)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iPositionDao.Search(bPosition, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost]
        public async Task<ActionResult<OperationResponse>> Create([FromBody] Position bPosition)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iPositionDao.Create(bPosition, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPut]
        public async Task<ActionResult<OperationResponse>> Update([FromBody] Position bPosition)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iPositionDao.Update(bPosition, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpDelete]
        public async Task<ActionResult<OperationResponse>> Delete([FromBody] Position bPosition)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iPositionDao.Delete(bPosition, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }
    }
}