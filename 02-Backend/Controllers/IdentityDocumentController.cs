// *****************************************************************************************************
// Descripción       : Documento Identidad Controller
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar, Registrar, Modificar y Eliminar Documentos de Identidad 
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
    public class IdentityDocumentController : BaseController
    {
        // Declaración de variables globales
        private readonly IIdentityDocumentRepository iIdentityDocumentDao;
        private readonly LogHelper clsLogHelper;

        // Constructor
        public IdentityDocumentController(LogHelper logHelper, IConfiguration configuration)
        {
            clsLogHelper = logHelper;
            iIdentityDocumentDao = RepositoryFactory.GetInstanceSqlServer(configuration).GetIdentityDocumentRepository();
        }

        [HttpPost("buscar")]
        public async Task<ActionResult<OperationResponse>> Search([FromBody] IdentityDocument bIdentityDocument)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iIdentityDocumentDao.Search(bIdentityDocument, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPost]
        public async Task<ActionResult<OperationResponse>> Create([FromBody] IdentityDocument bIdentityDocument)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iIdentityDocumentDao.Create(bIdentityDocument, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpPut]
        public async Task<ActionResult<OperationResponse>> Update([FromBody] IdentityDocument bIdentityDocument)
        {
            try
            {   
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iIdentityDocumentDao.Update(bIdentityDocument, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }

        [HttpDelete]
        public async Task<ActionResult<OperationResponse>> Delete([FromBody] IdentityDocument bIdentityDocument)
        {
            try
            {
                var bLog = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
                var response = await iIdentityDocumentDao.Delete(bIdentityDocument, bLog);
                return FromOperationResponse<OperationResponse>(response);
            }
            catch (Exception ex)
            {
                return HandleException<OperationResponse>(ex);
            }
        }
    }
}
