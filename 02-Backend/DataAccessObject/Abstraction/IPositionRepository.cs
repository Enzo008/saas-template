// *****************************************************************************************************
// Descripción       : Interface IPositionRepository
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Buscar, Registrar, Modificar y Eliminar Cargos
// *****************************************************************************************************

// Modelos
using saas_template.server.Models;
// Libreria Helper
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface IPositionRepository
    {
        Task<OperationResponse> Search(Position bPosition, Log bLog);
        Task<OperationResponse> Create(Position bPosition, Log bLog);
        Task<OperationResponse> Update(Position bPosition, Log bLog);
        Task<OperationResponse> Delete(Position bPosition, Log bLog);
    }
}
