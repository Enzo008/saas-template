// *****************************************************************************************************
// Descripción       : Interface IGenderRepository
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar Generos
// *****************************************************************************************************

// Modelos
using saas_template.server.Models;
// Libreria Helper
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface IGenderRepository
    {
        Task<OperationResponse> Search(Gender bGenero, Log bLog);
    }
}
