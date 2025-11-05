// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para los formularios
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Buscar, Registrar, Modificar y Eliminar Formularios
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
    public class SqlServerFormDAO : BaseDAO, IFormRepository
    {
        // Declaración de variables
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;

        // Constructor
        public SqlServerFormDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }

        public async Task<OperationResponse> Search(FormMaster bFormulario, Log bLog)
        {
            // Declaración de variables
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_FORMASYEA", !string.IsNullOrEmpty(bFormulario.ForMasYea) ? bFormulario.ForMasYea : DBNull.Value);
                AddParameter(parameters, "@P_FORMASCOD", !string.IsNullOrEmpty(bFormulario.ForMasCod) ? bFormulario.ForMasCod : DBNull.Value);
                AddParameter(parameters, "@P_FORMASNAM", !string.IsNullOrEmpty(bFormulario.ForMasNam) ? bFormulario.ForMasNam : DBNull.Value);
                AddParameter(parameters, "@P_PAGE_NUMBER", bFormulario.PageNumber.HasValue ? bFormulario.PageNumber.Value : DBNull.Value);
                AddParameter(parameters, "@P_PAGE_SIZE", bFormulario.PageSize.HasValue ? bFormulario.PageSize.Value : DBNull.Value);

                strSql = "SP_SEARCH_FORM";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    var dtsData = DeserializeDataSet<List<FormMaster>>(dtsDatos) ?? new List<FormMaster>();
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

        public async Task<OperationResponse> Create(FormMaster bFormulario, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                // Parámetros de entrada del formulario maestro
                AddParameter(parameters, "@P_FORMASNAM", bFormulario.ForMasNam);
                AddParameter(parameters, "@P_FORMASDES", bFormulario.ForMasDes ?? string.Empty);
                AddParameter(parameters, "@P_FORMASTYP", bFormulario.ForMasTyp ?? "GENERAL");
                AddParameter(parameters, "@P_FORMASSTA", bFormulario.ForMasSta ?? "A");
                AddParameter(parameters, "@P_FORMASMUL", bFormulario.ForMasMul ?? false);
                AddParameter(parameters, "@P_FORMASDATSTA", bFormulario.ForMasDatSta ?? string.Empty);
                AddParameter(parameters, "@P_FORMASDATEND", bFormulario.ForMasDatEnd ?? string.Empty);
                AddParameter(parameters, "@P_FORMASORD", bFormulario.ForMasOrd ?? 0);

                // Convertir la lista de campos a DataTable usando la versión optimizada de Helper
                var columnMappings = new Dictionary<string, string>
                {
                    { "ForFieYea", "FORFIEYEA" },
                    { "ForFieCod", "FORFIECOD" },
                    { "ForFieNam", "FORFIENAM" },
                    { "ForFieLab", "FORFIELAB" },
                    { "ForFieTyp", "FORFIETYP" },
                    { "ForFieReq", "FORFIEREQ" },
                    { "ForFieOrd", "FORFIORD" },
                    { "ForFieOpt", "FORFIOPC" },
                    { "ForFieVal", "FORFIVAL" },
                    { "ForFiePla", "FORFIPLA" },
                    { "ForFieHel", "FORFIHEL" },
                    { "ForFieCol", "FORFIECOL" },
                    { "ForFieMin", "FORFIEMIN" },
                    { "ForFieMax", "FORFIEMAX" },
                    { "ForFiePat", "FORFIEPAT" },
                    { "ForFieErr", "FORFIERR" },
                    { "ForFieSta", "FORFIESTA" },
                    { "ForFieVis", "FORFIVIS" },
                    { "ForFieEdi", "FORFIEDI" }
                };
                
                var camposDataTable = ConvertToDataTableFiltered(bFormulario.Fields, columnMappings);
                
                AddTableParameter(parameters, "@P_CAMPOS", camposDataTable, "TT_FORMULARIO_CAMPO");

                // Parámetros de salida específicos del SP (SqlServerLogDAO ya agrega @P_DESCRIPCION_MENSAJE y @P_TIPO_MENSAJE)
                AddOutputParameter(parameters, "@P_FORMASYEA_OUT", SqlDbType.Char, 4);
                AddOutputParameter(parameters, "@P_FORMASCOD_OUT", SqlDbType.Char, 6);

                strSql = "SP_CREATE_FORM";

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





        public async Task<OperationResponse> Update(FormMaster bFormulario, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                // Parámetros de entrada del formulario maestro para modificación
                AddParameter(parameters, "@P_FORMASANO", bFormulario.ForMasYea);
                AddParameter(parameters, "@P_FORMASCOD", bFormulario.ForMasCod);
                AddParameter(parameters, "@P_FORMASNAM", bFormulario.ForMasNam);
                AddParameter(parameters, "@P_FORMASDES", bFormulario.ForMasDes ?? string.Empty);
                AddParameter(parameters, "@P_FORMASTIP", bFormulario.ForMasTyp ?? "GENERAL");
                AddParameter(parameters, "@P_FORMASSTA", bFormulario.ForMasSta ?? "A");
                AddParameter(parameters, "@P_FORMASPERMUL", bFormulario.ForMasMul ?? false);
                AddParameter(parameters, "@P_FORMASFECINI", bFormulario.ForMasDatSta ?? string.Empty);
                AddParameter(parameters, "@P_FORMASFECFIN", bFormulario.ForMasDatEnd ?? string.Empty);
                AddParameter(parameters, "@P_FORMASORD", bFormulario.ForMasOrd ?? 0);

                // Convertir la lista de campos a DataTable usando la versión optimizada de Helper
                // Para modición, incluimos también FORCAMANO y FORCAMCOD para campos existentes
                var columnMappings = new Dictionary<string, string>
                {
                    { "ForFieYea", "FORFIEYEA" },
                    { "ForFieCod", "FORFIECOD" },
                    { "ForFieNam", "FORFIENAM" },
                    { "ForFieLab", "FORFIELAB" },
                    { "ForFieTyp", "FORFIETYP" },
                    { "ForFieReq", "FORFIEREQ" },
                    { "ForFieOrd", "FORFIEORD" },
                    { "ForFieOpt", "FORFIEOPC" },
                    { "ForFieVal", "FORFIEVAL" },
                    { "ForFiePla", "FORFIEPLA" },
                    { "ForFieHel", "FORFIEAYU" },
                    { "ForFieCol", "FORFIECOL" },
                    { "ForFieMin", "FORFIEMIN" },
                    { "ForFieMax", "FORFIEMAX" },
                    { "ForFiePat", "FORFIEPAT" },
                    { "ForFieErr", "FORFIEERR" },
                    { "ForFieSta", "FORFIESTA" },
                    { "ForFieVis", "FORFIEVIS" },
                    { "ForFieEdi", "FORFIEEDI" }
                };
                
                var camposDataTable = ConvertToDataTableFiltered(bFormulario.Fields, columnMappings);
                
                AddTableParameter(parameters, "@P_CAMPOS", camposDataTable, "TT_FORMULARIO_CAMPO");

                strSql = "SP_UPDATE_FORM";

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

        public async Task<OperationResponse> Delete(FormMaster bFormulario, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_FORMASYEA", bFormulario.ForMasYea);
                AddParameter(parameters, "@P_FORMASCOD", bFormulario.ForMasCod);

                strSql = "SP_DELETE_FORM";

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