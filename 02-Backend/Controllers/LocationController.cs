// *****************************************************************************************************
// Descripción       : Location Controller
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar Ubicaciones 
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
    public class LocationController : BaseController
    {
        // Declaración de variables globales
        private readonly ILocationRepository iLocationDao;
        private readonly LogHelper clsLogHelper;

        // Constructor
        public LocationController(LogHelper logHelper, IConfiguration configuration)
        {
            clsLogHelper = logHelper;
            iLocationDao = RepositoryFactory.GetInstanceSqlServer(configuration).GetLocationRepository();
        }

        [HttpPost("buscar")]
        public async Task<ActionResult<OperationResponse>> Search([FromBody] Location bUbicacion)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iLocationDao.Search(bUbicacion, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }
    }
}
