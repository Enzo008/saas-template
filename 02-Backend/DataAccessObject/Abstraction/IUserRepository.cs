// *****************************************************************************************************
// Descripción       : Interface IUserRepository
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Buscar Usuarios
// *****************************************************************************************************

// Modelos
using saas_template.server.Models;
// Libreria Helper
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface IUserRepository
    {
        Task<OperationResponse> Search(User bUser, Log bLog);
        Task<OperationResponse> GetAllMenusPermissions(User bUser, Log bLog);
        Task<OperationResponse> CreateMultiStep(User bUser, Log bLog);
        Task<OperationResponse> UpdateMultiStep(User bUser, Log bLog);
    }
}
