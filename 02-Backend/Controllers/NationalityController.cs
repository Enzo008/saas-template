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
// Libreria Helper
using static Helper.Types;
using Helper;
using saas_template.server.DataAccessObject.Core;

namespace saas_template.server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NationalityController : ControllerBase
    {
        // Declaración de variables globales
        private readonly INationalityRepository iNationalityDao;
        private readonly LogHelper clsLogHelper;

        // Constructor
        public NationalityController(LogHelper logHelper, IConfiguration configuration)
        {
            clsLogHelper = logHelper;
            iNationalityDao = RepositoryFactory.GetInstanceSqlServer(configuration).GetNationalityRepository();
        }

        [HttpGet]
        public async Task<ActionResult<OperationResponse>> Search()
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                return await iNationalityDao.Search(new Nationality(), bLog); 
            }
            catch (Exception ex)
            {
                return new OperationResponse
                {
                    Success = false,
                    Message = ex.Message,
                    MessageType = MessageType.Error
                };
            }
        }
    }
}
