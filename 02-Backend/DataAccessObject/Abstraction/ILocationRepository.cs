// *****************************************************************************************************
// Descripción       : Interface ILocationRepository
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar Ubicaciones
// *****************************************************************************************************

// Modelos
using saas_template.server.Models;
// Libreria Helper
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface ILocationRepository
    {
        Task<OperationResponse> Search(Location bUbicacion, Log bLog);
    }
}
