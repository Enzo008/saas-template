// *****************************************************************************************************
// Descripción       : Interface IAuthenticationRepository
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Autenticación y validación de usuarios
// *****************************************************************************************************

// Modelos
using saas_template.server.Models;
// Libreria Helper
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface IAuthenticationRepository
    {
        Task<OperationResponse> Login(string useEma, string usePas);
        Task<OperationResponse> ValidateSession(string useYea, string useCod, Log bLog);
        Task<OperationResponse> ChangePassword(User bUser, Log bLog);
        Task<OperationResponse> GetUserByEmail(string email, Log bLog);
        Task<OperationResponse> UpdatePasswordByEmail(string email, string newPassword, Log bLog);
    }
}
