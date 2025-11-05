// *****************************************************************************************************
// Descripción       : Interface ILogRepository
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Agregar parametros a un log
// *****************************************************************************************************

// Extensiones
using Microsoft.Data.SqlClient;
// Modelos
using saas_template.server.Models;
// Libreria Helper
using static Helper.Types;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface ILogRepository
    {
        SqlParameter[] AgregarParametrosLog(SqlParameter[] parametrosExistentes, Log bLog, OperationType operationType = OperationType.Query);
    }
}
