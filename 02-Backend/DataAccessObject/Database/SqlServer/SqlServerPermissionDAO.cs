// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para permisos
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 16/11/2025
// Acción a Realizar : Obtener permisos de usuarios para validación de autorización
// *****************************************************************************************************

// Modelos
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.Models;
using System.Data;
using Newtonsoft.Json;
// Libreria Helper
using static Helper.SqlHelper;
using static Helper.Types;
using static Helper.CommonHelper;
using Helper;

namespace saas_template.server.DataAccessObject.Database.SqlServer
{
    public class SqlServerPermissionDAO : BaseDAO, IPermissionRepository
    {
        // Declaración de variables
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;

        // Constructor
        public SqlServerPermissionDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }

        /// <summary>
        /// Obtiene todos los permisos de un usuario desde la base de datos
        /// Retorna un diccionario: menuRef -> lista de códigos de permisos
        /// </summary>
        public async Task<OperationResponse> GetUserPermissions(string useYea, string useCod, Log bLog)
        {
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_USEYEA", useYea);
                AddParameter(parameters, "@P_USECOD", useCod);

                strSql = "SP_GET_USER_PERMISSIONS";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    // El SP retorna JSON con menús y permisos
                    var permissions = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);

                    if (dtsDatos.Tables.Count > 0 && dtsDatos.Tables[0].Rows.Count > 0)
                    {
                        var jsonResult = dtsDatos.Tables[0].Rows[0][0].ToString();

                        if (!string.IsNullOrEmpty(jsonResult))
                        {
                            var menus = JsonConvert.DeserializeObject<List<MenuPermissionDto>>(jsonResult);

                            if (menus != null)
                            {
                                foreach (var menu in menus)
                                {
                                    if (!string.IsNullOrEmpty(menu.MenRef) && menu.HasActive)
                                    {
                                        var menuKey = menu.MenRef.ToLower();

                                        if (!permissions.ContainsKey(menuKey))
                                        {
                                            permissions[menuKey] = new List<string>();
                                        }

                                        // Agregar permisos activos
                                        if (menu.Permissions != null)
                                        {
                                            foreach (var permission in menu.Permissions)
                                            {
                                                if (permission.HasActive && !string.IsNullOrEmpty(permission.PerCod))
                                                {
                                                    permissions[menuKey].Add(permission.PerCod);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    return CreateResponseFromParameters(logParameters.ToList(), permissions);
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

        #region DTOs internos

        private class MenuPermissionDto
        {
            public string? MenYea { get; set; }
            public string? MenCod { get; set; }
            public string? MenNam { get; set; }
            public string? MenRef { get; set; }
            public bool HasActive { get; set; }
            public List<PermissionDto>? Permissions { get; set; }
        }

        private class PermissionDto
        {
            public string? PerCod { get; set; }
            public string? PerNam { get; set; }
            public bool HasActive { get; set; }
        }

        #endregion
    }
}
