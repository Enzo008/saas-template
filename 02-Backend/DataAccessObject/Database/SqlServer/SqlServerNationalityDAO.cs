// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para las nacionalidades
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar Nacionalidades
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
    public class SqlServerNationalityDAO : BaseDAO, INationalityRepository
    {
        // Declaración de variables
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;

        // Constructor
        public SqlServerNationalityDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }

        public async Task<OperationResponse> Search(Nationality bNacionalidad, Log bLog)
        {
            // Declaración de variables
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_NATCOD", !string.IsNullOrEmpty(bNacionalidad.NatCod) ? bNacionalidad.NatCod : DBNull.Value);
                AddParameter(parameters, "@P_NATNAM", !string.IsNullOrEmpty(bNacionalidad.NatNam) ? bNacionalidad.NatNam : DBNull.Value);

                strSql = "SP_SEARCH_NATIONALITY";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    var dtsData = DeserializeDataSet<List<Nationality>>(dtsDatos) ?? new List<Nationality>();
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