// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para los roles
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Buscar, Registrar, Modificar y Eliminar Roles
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
    public class SqlServerRoleDAO : BaseDAO, IRoleRepository
    {
        // Declaración de variables
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;

        // Constructor
        public SqlServerRoleDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }

        public async Task<OperationResponse> Search(Role bRole, Log bLog)
        {
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_ROLCOD", !string.IsNullOrEmpty(bRole.RolCod) ? bRole.RolCod : DBNull.Value);
                AddParameter(parameters, "@P_ROLNAM", !string.IsNullOrEmpty(bRole.RolNam) ? bRole.RolNam : DBNull.Value);

                strSql = "SP_SEARCH_ROLE";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    var dtsData = DeserializeDataSet<List<Role>>(dtsDatos) ?? new List<Role>();
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

        public async Task<OperationResponse> Create(Role bRole, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                // Parámetros de entrada específicos para registro
                AddParameter(parameters, "@P_ROLNAM", bRole.RolNam);

                var menusPermissionsDataTable = ConvertMenusPermissionsToDataTable(bRole.Menus);
                AddTableParameter(parameters, "@P_MENUS_PERMISOS", menusPermissionsDataTable, "TT_USER_MENU_PERMISSION");

                strSql = "SP_CREATE_ROLE";

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

        public async Task<OperationResponse> Update(Role bRole, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                // Parámetros de entrada específicos para modificación
                AddParameter(parameters, "@P_ROLCOD", bRole.RolCod);
                AddParameter(parameters, "@P_ROLNAM", bRole.RolNam);

                var menusPermissionsDataTable = ConvertMenusPermissionsToDataTable(bRole.Menus);
                AddTableParameter(parameters, "@P_MENUS_PERMISOS", menusPermissionsDataTable, "TT_USER_MENU_PERMISSION");

                strSql = "SP_UPDATE_ROLE";

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

        public async Task<OperationResponse> Delete(Role bRole, Log bLog)
        {
            // Declaración de variables
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_ROLCOD", bRole.RolCod);

                strSql = "SP_DELETE_ROLE";

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

        public async Task<OperationResponse> GetAllMenusPermissions(Role bRole, Log bLog)
        {
            // Declaración de variables
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                // Agregar parámetros del usuario (pueden ser null para obtener todos los menús sin marcar)
                AddParameter(parameters, "@P_ROLCOD", bRole?.RolCod);

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

        private DataTable ConvertMenusPermissionsToDataTable(List<Menu>? menus)
        {
            var dataTable = new DataTable();
            dataTable.Columns.Add("MENYEA", typeof(string));
            dataTable.Columns.Add("MENCOD", typeof(string));
            dataTable.Columns.Add("PERCOD", typeof(string));

            if (menus != null)
            {
                // Procesar todos los menús asignados al usuario
                foreach (var menu in menus)
                {
                    if (menu.Permissions != null && menu.Permissions.Count > 0)
                    {
                        // Si el menú tiene permisos, agregar una fila por cada permiso
                        foreach (var permiso in menu.Permissions)
                        {
                            var row = dataTable.NewRow();
                            row["MENYEA"] = menu.MenYea;
                            row["MENCOD"] = menu.MenCod;
                            row["PERCOD"] = permiso.PerCod;
                            dataTable.Rows.Add(row);
                        }
                    }
                    else
                    {
                        // Si el menú NO tiene permisos, agregar solo el menú con PERCOD vacío
                        var row = dataTable.NewRow();
                        row["MENYEA"] = menu.MenYea;
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