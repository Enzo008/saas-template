// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para los documentos de identidad
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 27/06/2025
// Acción a Realizar : Buscar Documentos de Identidad
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
    public class SqlServerIdentityDocumentDAO : BaseDAO, IIdentityDocumentRepository
    {
        // Declaración de variables
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;

        // Constructor
        public SqlServerIdentityDocumentDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }

        public async Task<OperationResponse> Search(IdentityDocument bIdentityDocument, Log bLog)
        {
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_IDEDOCCOD", !string.IsNullOrEmpty(bIdentityDocument.IdeDocCod) ? bIdentityDocument.IdeDocCod : DBNull.Value);
                AddParameter(parameters, "@P_IDEDOCNAM", !string.IsNullOrEmpty(bIdentityDocument.IdeDocNam) ? bIdentityDocument.IdeDocNam : DBNull.Value);

                strSql = "SP_SEARCH_IDENTITY_DOCUMENT";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    var dtsData = DeserializeDataSet<List<IdentityDocument>>(dtsDatos) ?? new List<IdentityDocument>();
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

        public async Task<OperationResponse> Create(IdentityDocument bIdentityDocument, Log bLog)
        {
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_IDEDOCNAM", bIdentityDocument.IdeDocNam);

                strSql = "SP_CREATE_IDENTITY_DOCUMENT";

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

        public async Task<OperationResponse> Update(IdentityDocument bIdentityDocument, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                // Parámetros de entrada específicos para modificación
                AddParameter(parameters, "@P_IDEDOCCOD", bIdentityDocument.IdeDocCod);
                AddParameter(parameters, "@P_IDEDOCNAM", bIdentityDocument.IdeDocNam);

                strSql = "SP_UPDATE_IDENTITY_DOCUMENT";

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

        public async Task<OperationResponse> Delete(IdentityDocument bIdentityDocument, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_IDEDOCCOD", bIdentityDocument.IdeDocCod);

                strSql = "SP_DELETE_IDENTITY_DOCUMENT";

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