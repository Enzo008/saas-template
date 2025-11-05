// *****************************************************************************************************
// Descripción       : Interface INationalityRepository
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar Nacionalidades
// *****************************************************************************************************

// Modelos
using saas_template.server.Models;
// Libreria Helper
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface INationalityRepository
    {
        Task<OperationResponse> Search(Nationality bNacionalidad, Log bLog);
    }
}
