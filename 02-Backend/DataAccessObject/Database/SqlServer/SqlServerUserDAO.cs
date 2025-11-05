// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para los Users
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Buscar, Registrar, Modificar y Eliminar Users
// *****************************************************************************************************

// Modelos
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.Models;
using System.Data;
// Libreria Helper
using static Helper.SqlHelper;
using static Helper.Types;
using static Helper.CommonHelper;
using static Helper.BaseDAO;
using Helper;

namespace saas_template.server.DataAccessObject.Database.SqlServer
{
    public class SqlServerUserDAO : BaseDAO, IUserRepository
    {
        // Declaración de variables
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;

        // Constructor
        public SqlServerUserDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }

        public async Task<OperationResponse> Search(User bUser, Log bLog)
        {
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_USEYEA", !string.IsNullOrEmpty(bUser.UseYea) ? bUser.UseYea : DBNull.Value);
                AddParameter(parameters, "@P_USECOD", !string.IsNullOrEmpty(bUser.UseCod) ? bUser.UseCod : DBNull.Value);
                AddParameter(parameters, "@P_USENAM", !string.IsNullOrEmpty(bUser.UseNam) ? bUser.UseNam : DBNull.Value);
                AddParameter(parameters, "@P_USELAS", !string.IsNullOrEmpty(bUser.UseLas) ? bUser.UseLas : DBNull.Value);
                AddParameter(parameters, "@P_PAGE_NUMBER", bUser.PageNumber.HasValue ? bUser.PageNumber.Value : DBNull.Value);
                AddParameter(parameters, "@P_PAGE_SIZE", bUser.PageSize.HasValue ? bUser.PageSize.Value : DBNull.Value);

                strSql = "SP_SEARCH_USER";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    var dtsData = DeserializeDataSet<List<User>>(dtsDatos) ?? new List<User>();
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

        public async Task<OperationResponse> GetAllMenusPermissions(User bUser, Log bLog)
        {
            // Declaración de variables
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                // Agregar parámetros del User (pueden ser null para obtener todos los menús sin marcar)
                AddParameter(parameters, "@P_USEYEA", bUser?.UseYea);
                AddParameter(parameters, "@P_USECOD", bUser?.UseCod);
                AddParameter(parameters, "@P_ROLCOD", bUser?.RolCod);

                strSql = "SP_GET_ALL_MENUS_PERMISSIONS";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    // Obtener los datos de menús y permisos
                    var dtsData = DeserializeDataSet<List<Menu>>(dtsDatos) ?? new List<Menu>();
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

        public async Task<OperationResponse> CreateMultiStep(User bUser, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                // Parámetros de entrada del User
                AddParameter(parameters, "@P_IDEDOCCOD", bUser.IdeDocCod);
                AddParameter(parameters, "@P_USENUMDOC", bUser.UseNumDoc);
                AddParameter(parameters, "@P_USENAM", bUser.UseNam);
                AddParameter(parameters, "@P_USELAS", bUser.UseLas);
                AddParameter(parameters, "@P_USEBIR", bUser.UseBir);
                AddParameter(parameters, "@P_USESEX", bUser.UseSex);
                AddParameter(parameters, "@P_USEEMA", bUser.UseEma);
                AddParameter(parameters, "@P_POSCOD", bUser.PosCod);
                AddParameter(parameters, "@P_USEPHO", bUser.UsePho);
                AddParameter(parameters, "@P_ROLCOD", bUser.RolCod);
                AddParameter(parameters, "@P_LOCYEA", bUser.LocYea);
                AddParameter(parameters, "@P_LOCCOD", bUser.LocCod);
                AddParameter(parameters, "@P_REPYEA", bUser.RepYea);
                AddParameter(parameters, "@P_REPCOD", bUser.RepCod);
                AddParameter(parameters, "@P_USEPAS", bUser.UsePas);
                AddParameter(parameters, "@P_USESTA", "A");

                // Convertir menús y permisos a DataTable
                var menusPermisosDataTable = ConvertMenusPermissionsToDataTable(bUser.Menus);
                AddTableParameter(parameters, "@P_MENUS_PERMISOS", menusPermisosDataTable, "TT_USER_MENU_PERMISSION");

                // Parámetros de salida específicos del SP
                AddOutputParameter(parameters, "@P_USEYEA_OUT", SqlDbType.Char, 4);
                AddOutputParameter(parameters, "@P_USECOD_OUT", SqlDbType.Char, 6);

                strSql = "SP_CREATE_USER";

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

        public async Task<OperationResponse> UpdateMultiStep(User bUser, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                // Parámetros de entrada del User para modificación
                AddParameter(parameters, "@P_USEYEA", bUser.UseYea);
                AddParameter(parameters, "@P_USECOD", bUser.UseCod);
                AddParameter(parameters, "@P_IDEDOCCOD", bUser.IdeDocCod);
                AddParameter(parameters, "@P_USENUMDOC", bUser.UseNumDoc);
                AddParameter(parameters, "@P_USENAM", bUser.UseNam);
                AddParameter(parameters, "@P_USELAS", bUser.UseLas);
                AddParameter(parameters, "@P_USEBIR", bUser.UseBir);
                AddParameter(parameters, "@P_USESEX", bUser.UseSex);
                AddParameter(parameters, "@P_USEEMA", bUser.UseEma);
                AddParameter(parameters, "@P_POSCOD", bUser.PosCod);
                AddParameter(parameters, "@P_USEPHO", bUser.UsePho);
                AddParameter(parameters, "@P_ROLCOD", bUser.RolCod);
                AddParameter(parameters, "@P_LOCYEA", bUser.LocYea);
                AddParameter(parameters, "@P_LOCCOD", bUser.LocCod);
                AddParameter(parameters, "@P_REPYEA", bUser.RepYea ?? string.Empty);
                AddParameter(parameters, "@P_REPCOD", bUser.RepCod ?? string.Empty);
                AddParameter(parameters, "@P_USESTA", "A");

                // Convertir menús y permisos a DataTable
                var menusPermisosDataTable = ConvertMenusPermissionsToDataTable(bUser.Menus);
                AddTableParameter(parameters, "@P_MENUS_PERMISOS", menusPermisosDataTable, "TT_USER_MENU_PERMISSION");

                strSql = "SP_UPDATE_USER";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Update);
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

        private DataTable ConvertMenusPermissionsToDataTable(List<Menu>? menus)
        {
            var dataTable = new DataTable();
            dataTable.Columns.Add("MENYEA", typeof(string));  // Actualizado a inglés
            dataTable.Columns.Add("MENCOD", typeof(string));
            dataTable.Columns.Add("PERCOD", typeof(string));

            if (menus != null)
            {
                // Procesar todos los menús asignados al User
                foreach (var menu in menus)
                {
                    if (menu.Permissions != null && menu.Permissions.Count > 0)
                    {
                        // Si el menú tiene permisos, agregar una fila por cada permiso
                        foreach (var permiso in menu.Permissions)
                        {
                            var row = dataTable.NewRow();
                            row["MENYEA"] = menu.MenYea;  // Actualizado a inglés
                            row["MENCOD"] = menu.MenCod;
                            row["PERCOD"] = permiso.PerCod;
                            dataTable.Rows.Add(row);
                        }
                    }
                    else
                    {
                        // Si el menú NO tiene permisos, agregar solo el menú con PERCOD vacío
                        var row = dataTable.NewRow();
                        row["MENYEA"] = menu.MenYea;  // Actualizado a inglés
                        row["MENCOD"] = menu.MenCod;
                        row["PERCOD"] = DBNull.Value; // NULL para indicar que no tiene permisos específicos
                        dataTable.Rows.Add(row);
                    }
                }
            }

            return dataTable;
        }
    }
}