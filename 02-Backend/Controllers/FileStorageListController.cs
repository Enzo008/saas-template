// *****************************************************************************************************
// Descripción       : Controlador para listar archivos almacenados
// Creado por        : Cascade
// Fecha de Creación : 20/06/2025
// Acción a Realizar : Listar archivos almacenados
// *****************************************************************************************************

// Extensiones
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
// Modelos
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.Models;
using saas_template.server.DataAccessObject.Helper;
using saas_template.server.Models.FileStorage;
// Libreria Helper
using static Helper.Types;
using Helper;
using saas_template.server.DataAccessObject.Core;

namespace saas_template.server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileStorageListController : ControllerBase
    {
        // Declaración de variables globales
        private readonly IFileStorageRepository _fileStorageRepository;
        private readonly LogHelper _logHelper;
        private readonly FileStorageHelper _fileStorageHelper;

        // Constructor
        public FileStorageListController(LogHelper logHelper, FileStorageHelper fileStorageHelper, IConfiguration configuration)
        {
            _logHelper = logHelper;
            _fileStorageHelper = fileStorageHelper;
            _fileStorageRepository = RepositoryFactory.GetInstanceSqlServer(configuration).GetFileStorageRepository();
        }

        /// <summary>
        /// Obtiene la lista de archivos almacenados
        /// </summary>
        /// <param name="filter">Filtros para la búsqueda</param>
        /// <returns>Lista de archivos almacenados</returns>
        [HttpPost("list")]
        public async Task<ActionResult<OperationResponse>> GetStoredFiles([FromBody] StoredFile filter)
        {
            try
            {
                var log = await _logHelper.CreateLogFromTokenAsync(HttpContext);
                
                // Si no se proporciona un filtro, creamos uno vacío
                filter ??= new StoredFile();
                
                return await _fileStorageRepository.GetStoredFiles(filter, log);
            }
            catch (Exception ex)
            {
                return new OperationResponse
                {
                    Success = false,
                    Message = ex.Message,
                    MessageType = MessageType.Error,
                    Data = new object()
                };
            }
        }
        
        /// <summary>
        /// Obtiene la lista de archivos almacenados en el sistema de archivos
        /// </summary>
        /// <param name="directory">Directorio personalizado (opcional)</param>
        /// <returns>Lista de archivos almacenados</returns>
        [HttpGet("filesystem")]
        public async Task<ActionResult<ApiResponse>> GetFilesFromFileSystem([FromQuery] string? directory = null)
        {
            try
            {
                var log = await _logHelper.CreateLogFromTokenAsync(HttpContext);
                
                // Obtener la lista de archivos desde el sistema de archivos
                var files = _fileStorageHelper.GetFilesFromDirectory(directory);
                
                return new ApiResponse
                {
                    Success = true,
                    Message = "Archivos obtenidos correctamente",
                    MessageType = "Success",
                    Data = files
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = ex.Message,
                    MessageType = "Error",
                    Data = new object()
                };
            }
        }
    }
}
