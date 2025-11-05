// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para los logs
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Agregar parámetros a un log
// *****************************************************************************************************

// Extensiones
using Microsoft.Data.SqlClient;
// Modelos
using System.Data;
using saas_template.server.Models;
using saas_template.server.DataAccessObject.Abstraction;
// Libreria Helper
using static Helper.SqlHelper;
using static Helper.Types;

namespace saas_template.server.DataAccessObject.Database.SqlServer
{
    public class SqlServerLogDAO : ILogRepository
    {
        public SqlParameter[] AgregarParametrosLog(SqlParameter[] parametrosExistentes, Log log, OperationType operationType = OperationType.Query)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            // Agregar los parámetros existentes a la nueva lista
            parameters.AddRange(parametrosExistentes);

            // Agregar los parámetros de log
            AddParameter(parameters, "@P_LOGIPMAQ", log.LogIpMac);
            AddParameter(parameters, "@P_USEYEA_U", log.UseYea);
            AddParameter(parameters, "@P_USECOD_U", log.UseCod);
            AddParameter(parameters, "@P_USENAM_U", log.UseNam);
            AddParameter(parameters, "@P_USELAS_U", log.UseLas);

            // Agregar parámetros de usuario según el tipo de operación
            switch (operationType)
            {
                case OperationType.Insert:
                    AddParameter(parameters, "@P_USEING", $"{log.UseNam} {log.UseLas}");
                    break;
                case OperationType.Update:
                case OperationType.Delete:
                    AddParameter(parameters, "@P_USEMOD", $"{log.UseNam} {log.UseLas}");
                    break;
            }

            if (operationType == OperationType.Query)
            {
                AddOutputParameter(parameters, "@P_TOTAL_RECORDS", SqlDbType.Int);
            }
            
            // Agregar los parámetros de salida con tamaños específicos
            AddOutputParameter(parameters, "@P_DESCRIPCION_MENSAJE", SqlDbType.NVarChar, 1000);
            AddOutputParameter(parameters, "@P_TIPO_MENSAJE", SqlDbType.Char, 1);

            return parameters.ToArray();
        }
    }
}