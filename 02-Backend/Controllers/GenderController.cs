// *****************************************************************************************************
// Descripción       : Gender Controller
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar Generos 
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
    public class GenderController : BaseController
    {
        // Declaración de variables globales
        private readonly IGenderRepository iGenderDao;
        private readonly LogHelper clsLogHelper;

        // Constructor
        public GenderController(LogHelper logHelper, IConfiguration configuration)
        {
            clsLogHelper = logHelper;
            iGenderDao = RepositoryFactory.GetInstanceSqlServer(configuration).GetGenderRepository();
        }

        [HttpGet]
        public async Task<ActionResult<OperationResponse>> Search()
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iGenderDao.Search(new Gender(), bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }
    }
}
