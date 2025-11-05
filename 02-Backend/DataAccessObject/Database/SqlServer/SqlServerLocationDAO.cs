// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para las ubicaciones
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar Ubicaciones
// *****************************************************************************************************

// Modelos
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.Models;
using System.Data;
// Libreria Helper
using static Helper.SqlHelper;
using static Helper.Types;
using static Helper.CommonHelper;
using Helper;

namespace saas_template.server.DataAccessObject.Database.SqlServer
{
    public class SqlServerLocationDAO : BaseDAO, ILocationRepository
    {
        // Declaración de variables
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;

        // Constructor
        public SqlServerLocationDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }

        public async Task<OperationResponse> Search(Location bUbicacion, Log bLog)
        {
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_LOCYEA", !string.IsNullOrEmpty(bUbicacion.LocYea) ? bUbicacion.LocYea : DBNull.Value);
                AddParameter(parameters, "@P_LOCCOD", !string.IsNullOrEmpty(bUbicacion.LocCod) ? bUbicacion.LocCod : DBNull.Value);
                AddParameter(parameters, "@P_LOCNAM", !string.IsNullOrEmpty(bUbicacion.LocNam) ? bUbicacion.LocNam : DBNull.Value);
                AddParameter(parameters, "@P_LOCTYP", !string.IsNullOrEmpty(bUbicacion.LocTyp) ? bUbicacion.LocTyp : "PAIS");

                strSql = "SP_SEARCH_LOCATION";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    var dtsData = DeserializeDataSet<List<Location>>(dtsDatos) ?? new List<Location>();
                    return CreateResponseFromParameters(logParameters.ToList(), dtsData);
                }
                else
                {
                    return CreateErrorResponse("Error al ejecutar el procedimiento almacenado");
                }
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
            finally
            {
                dtsDatos.Dispose();
            }
        }
    }
}