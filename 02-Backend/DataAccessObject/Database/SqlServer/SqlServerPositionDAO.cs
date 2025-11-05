// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para los cargos
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Buscar, Registrar, Modificar y Eliminar Cargos
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
    public class SqlServerPositionDAO : BaseDAO, IPositionRepository
    {
        // Declaración de variables
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;

        // Constructor
        public SqlServerPositionDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }

        public async Task<OperationResponse> Search(Position bPosition, Log bLog)
        {
            // Declaración de variables
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_POSCOD", !string.IsNullOrEmpty(bPosition.PosCod) ? bPosition.PosCod : DBNull.Value);
                AddParameter(parameters, "@P_POSNAM", !string.IsNullOrEmpty(bPosition.PosNam) ? bPosition.PosNam : DBNull.Value);
                AddParameter(parameters, "@P_PAGE_NUMBER", bPosition.PageNumber.HasValue ? bPosition.PageNumber.Value : DBNull.Value);
                AddParameter(parameters, "@P_PAGE_SIZE", bPosition.PageSize.HasValue ? bPosition.PageSize.Value : DBNull.Value);

                strSql = "SP_SEARCH_POSITION";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    var dtsData = DeserializeDataSet<List<Position>>(dtsDatos) ?? new List<Position>();
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

        public async Task<OperationResponse> Create(Position bPosition, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                // Parámetros de entrada específicos para registro
                AddParameter(parameters, "@P_POSNAM", bPosition.PosNam);

                strSql = "SP_CREATE_POSITION";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Insert);
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

        public async Task<OperationResponse> Update(Position bPosition, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                // Parámetros de entrada específicos para modificación
                AddParameter(parameters, "@P_POSCOD", bPosition.PosCod);
                AddParameter(parameters, "@P_POSNAM", bPosition.PosNam);

                strSql = "SP_UPDATE_POSITION";

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

        public async Task<OperationResponse> Delete(Position bPosition, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_POSCOD", bPosition.PosCod);

                strSql = "SP_DELETE_POSITION";

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