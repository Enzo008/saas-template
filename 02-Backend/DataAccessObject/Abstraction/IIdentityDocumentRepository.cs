// *****************************************************************************************************
// Descripción       : Interface IIdentityDocumentRepository
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar, Registrar, Modificar y Eliminar Documentos de Identidad
// *****************************************************************************************************

// Modelos
using saas_template.server.Models;
// Libreria Helper
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface IIdentityDocumentRepository
    {
        Task<OperationResponse> Search(IdentityDocument bIdentityDocument, Log bLog);
        Task<OperationResponse> Create(IdentityDocument bIdentityDocument, Log bLog);
        Task<OperationResponse> Update(IdentityDocument bIdentityDocument, Log bLog);
        Task<OperationResponse> Delete(IdentityDocument bIdentityDocument, Log bLog);
    }
}
