// *****************************************************************************************************
// Descripción       : Interface IRepositoryRepository
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar Repositorios
// *****************************************************************************************************

// Modelos
using saas_template.server.Models;
// Libreria Helper
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface IRepositoryRepository
    {
        Task<OperationResponse> Search(Repository bRepositorio, Log bLog);
        Task<OperationResponse> Create(Repository bRepositorio, Log bLog);
        Task<OperationResponse> Update(Repository bRepositorio, Log bLog);
        Task<OperationResponse> Delete(Repository bRepositorio, Log bLog);
    }
}
