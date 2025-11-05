// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para los repositorios
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar Repositorios
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
    public class SqlServerRepositoryDAO : BaseDAO, IRepositoryRepository
    {
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;
        public SqlServerRepositoryDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }

        public async Task<OperationResponse> Search(Repository bRepositorio, Log bLog)
        {
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_REPYEA", !string.IsNullOrEmpty(bRepositorio.RepYea) ? bRepositorio.RepYea : DBNull.Value);
                AddParameter(parameters, "@P_REPCOD", !string.IsNullOrEmpty(bRepositorio.RepCod) ? bRepositorio.RepCod : DBNull.Value);
                AddParameter(parameters, "@P_REPNAM", !string.IsNullOrEmpty(bRepositorio.RepNam) ? bRepositorio.RepNam : DBNull.Value);

                strSql = "SP_SEARCH_REPOSITORY";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    var dtsData = DeserializeDataSet<List<Repository>>(dtsDatos) ?? new List<Repository>();
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
        public async Task<OperationResponse> Create(Repository bRepositorio, Log bLog)
        {
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_REPNAM", bRepositorio.RepNam);
                AddParameter(parameters, "@P_LOCYEA", bRepositorio.LocYea);
                AddParameter(parameters, "@P_LOCCOD", bRepositorio.LocCod);

                AddOutputParameter(parameters, "@P_REPYEA_OUT", SqlDbType.Char, 4);
                AddOutputParameter(parameters, "@P_REPCOD_OUT", SqlDbType.Char, 6);

                strSql = "SP_CREATE_REPOSITORY";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Insert);
                if (await ExecuteTransactionAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters))
                {
                    return CreateResponseFromParameters(logParameters.ToList());
                }
                
                return CreateErrorResponse("Error al ejecutar el procedimiento almacenado");
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        public async Task<OperationResponse> Update(Repository bRepositorio, Log bLog)
        {
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_REPYEA", bRepositorio.RepYea);
                AddParameter(parameters, "@P_REPCOD", bRepositorio.RepCod);
                AddParameter(parameters, "@P_REPNAM", bRepositorio.RepNam);
                AddParameter(parameters, "@P_LOCYEA", bRepositorio.LocYea);
                AddParameter(parameters, "@P_LOCCOD", bRepositorio.LocCod);

                strSql = "SP_UPDATE_REPOSITORY";  

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Update);
                if (await ExecuteTransactionAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters))
                {
                    return CreateResponseFromParameters(logParameters.ToList());
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
        }

        public async Task<OperationResponse> Delete(Repository bRepositorio, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_REPYEA", bRepositorio.RepYea);
                AddParameter(parameters, "@P_REPCOD", bRepositorio.RepCod);

                strSql = "SP_DELETE_REPOSITORY";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Delete);
                if (await ExecuteTransactionAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters))
                {
                    return CreateResponseFromParameters(logParameters.ToList());
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
        }
    }
}