// *****************************************************************************************************
// Descripción       : Interface IPermissionRepository
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 16/11/2025
// Acción a Realizar : Obtener permisos de usuarios para validación de autorización
// *****************************************************************************************************

// Modelos
using saas_template.server.Models;
// Libreria Helper
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface IPermissionRepository
    {
        /// <summary>
        /// Obtiene todos los permisos de un usuario para cache de validación
        /// </summary>
        /// <param name="useYea">Año del usuario</param>
        /// <param name="useCod">Código del usuario</param>
        /// <param name="bLog">Log de operación</param>
        /// <returns>OperationResponse con los permisos del usuario en formato Dictionary</returns>
        Task<OperationResponse> GetUserPermissions(string useYea, string useCod, Log bLog);
    }
}
