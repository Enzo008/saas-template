// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para la autenticación de Users
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Autenticar y validar Users
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
    public class SqlServerAuthenticationDAO : BaseDAO, IAuthenticationRepository
    {
        // Declaración de variables
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;

        public SqlServerAuthenticationDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }

        public async Task<OperationResponse> Login(string useEma, string usePas)
        {
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                // Solo enviamos el correo, la verificación de contraseña se hará en el controller
                AddParameter(parameters, "@P_USEEMA", useEma);
                AddOutputParameter(parameters, "@P_DESCRIPCION_MENSAJE", SqlDbType.VarChar, 250);
                AddOutputParameter(parameters, "@P_TIPO_MENSAJE", SqlDbType.Int);

                strSql = "SP_START_SESSION";

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, parameters.ToArray(), dtsDatos))
                {
                    var data = DeserializeDataSetToList<User>(dtsDatos) ?? new List<User>();
                    var User = data.FirstOrDefault();

                    var strMessage = GetOutputParameterValue(parameters.ToList(), "@P_DESCRIPCION_MENSAJE") ?? "";
                    var strMessageType = GetOutputParameterValue(parameters.ToList(), "@P_TIPO_MENSAJE") ?? "1";
                    var messageType = (MessageType)int.Parse(strMessageType);

                    Console.WriteLine("Mensaje: " + strMessage);
                    Console.WriteLine("Tipo de mensaje: " + messageType);
                    return new OperationResponse
                    {
                        Success = true,
                        Message = strMessage,
                        MessageType = messageType,
                        Data = User
                    };
                }

                return new OperationResponse
                {
                    Success = false,
                    Message = "Error al obtener datos",
                    MessageType = MessageType.Error
                };
            }
            catch (Exception ex)
            {
                return new OperationResponse
                {
                    Success = false,
                    Message = ex.Message,
                    MessageType = MessageType.Error
                };
            }
            finally
            {
                dtsDatos.Dispose();
            }
        }

        public async Task<OperationResponse> ValidateSession(string useYea, string useCod, Log log)
        {
            // Declaración de variables
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_USEYEA", useYea);
                AddParameter(parameters, "@P_USECOD", useCod);
                AddOutputParameter(parameters, "@P_DESCRIPCION_MENSAJE", SqlDbType.VarChar, 250);
                AddOutputParameter(parameters, "@P_TIPO_MENSAJE", SqlDbType.Int);

                strSql = "SP_VALIDATE_SESSION";

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, parameters.ToArray(), dtsDatos))
                {
                    var data = DeserializeDataSetToList<User>(dtsDatos) ?? new List<User>();
                    var User = data.FirstOrDefault();

                    var strMessage = GetOutputParameterValue(parameters.ToList(), "@P_DESCRIPCION_MENSAJE") ?? "";
                    var strMessageType = GetOutputParameterValue(parameters.ToList(), "@P_TIPO_MENSAJE") ?? "1";
                    var messageType = (MessageType)int.Parse(strMessageType);

                    return new OperationResponse
                    {
                        Success = true,
                        Message = strMessage,
                        MessageType = messageType,
                        Data = User
                    };
                }

                return new OperationResponse
                {
                    Success = false,
                    Message = "Error al ejecutar el procedimiento almacenado",
                    MessageType = MessageType.Error
                };
            }
            catch (Exception ex)
            {
                return new OperationResponse
                {
                    Success = false,
                    Message = ex.Message,
                    MessageType = MessageType.Error
                };
            }
            finally
            {
                dtsDatos.Dispose();
            }
        }

        public async Task<OperationResponse> ChangePassword(User bUser, Log bLog)
        {
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_USEYEA", bUser.UseYea);
                AddParameter(parameters, "@P_USECOD", bUser.UseCod);
                AddParameter(parameters, "@P_USEPAS", bUser.UsePas);
                AddOutputParameter(parameters, "@P_DESCRIPCION_MENSAJE", SqlDbType.VarChar, 250);
                AddOutputParameter(parameters, "@P_TIPO_MENSAJE", SqlDbType.Int);

                strSql = "SP_CHANGE_PASSWORD_TEST";

                if (await ExecuteTransactionAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, parameters.ToArray()))
                {
                    var strMessage = GetOutputParameterValue(parameters.ToList(), "@P_DESCRIPCION_MENSAJE") ?? "";
                    var strMessageType = GetOutputParameterValue(parameters.ToList(), "@P_TIPO_MENSAJE") ?? "1";
                    var messageType = (MessageType)int.Parse(strMessageType);

                    return new OperationResponse
                    {
                        Success = messageType != MessageType.Error,
                        Message = strMessage,
                        MessageType = messageType
                    };
                }

                return new OperationResponse
                {
                    Success = false,
                    Message = "Error al cambiar la contraseña",
                    MessageType = MessageType.Error
                };
            }
            catch (Exception ex)
            {
                return new OperationResponse
                {
                    Success = false,
                    Message = ex.Message,
                    MessageType = MessageType.Error
                };
            }
        }

        public async Task<OperationResponse> GetUserByEmail(string email, Log bLog)
        {
            // Declaración de variables
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                Console.WriteLine("email: " + email);

                strSql = "SP_GET_USER_BY_EMAIL";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), bLog, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    var dtsData = DeserializeDataSet<List<User>>(dtsDatos) ?? new List<User>();
                    return CreateResponseFromParameters(logParameters.ToList(), dtsData.FirstOrDefault());
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

        public async Task<OperationResponse> UpdatePasswordByEmail(string email, string newPassword, Log bLog)
        {
            var parameters = CreateParameters();

            try
            {
                AddParameter(parameters, "@P_EMAIL", email);
                AddParameter(parameters, "@P_NEW_PASSWORD", newPassword);

                strSql = "SP_UPDATE_PASSWORD_BY_EMAIL";

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
    }
}