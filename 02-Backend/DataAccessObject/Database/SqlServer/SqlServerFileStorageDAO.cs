// *****************************************************************************************************
// Descripción       : Clase que define las acciones de la base de datos SQLServer para los archivos almacenados
// Creado por        : Cascade
// Fecha de Creación : 20/06/2025
// Modificado por    : Enzo Gago Aguirre
// Fecha de Modificación: 24/06/2025
// Acción a Realizar : Buscar archivos almacenados y manejar contenido binario
// *****************************************************************************************************

// Modelos
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.Models;
using saas_template.server.Models.FileStorage;
using System.Data;
// Libreria Helper
using static Helper.SqlHelper;
using static Helper.Types;
using static Helper.CommonHelper;
using Helper;
using Newtonsoft.Json;
using Microsoft.Data.SqlClient;

namespace saas_template.server.DataAccessObject.Database.SqlServer
{
    public class SqlServerFileStorageDAO : IFileStorageRepository
    {
        // Declaración de variables
        private string? strSql;
        private readonly SqlServerLogDAO clsLogDao;
        private string strCadenaConexion;

        // Constructor
        public SqlServerFileStorageDAO(string strConexion, SqlServerLogDAO clsLogDao)
        {
            strCadenaConexion = strConexion;
            this.clsLogDao = clsLogDao;
        }
        
        /// <summary>
        /// Guarda los metadatos y el contenido binario de un archivo en la base de datos
        /// </summary>
        /// <param name="fileData">Datos del archivo a guardar</param>
        /// <param name="fileContent">Contenido binario del archivo</param>
        /// <param name="log">Información de log</param>
        /// <returns>Respuesta de la operación</returns>
        // Método optimizado para ejecutar transacciones con archivos binarios grandes
        private async Task<bool> ExecuteLargeBinaryTransactionAsync(string sqlQuery, CommandType commandType, string connectionString, SqlParameter[] parameters, int timeoutSeconds = 300)
        {
            var startTime = DateTime.Now;
            Console.WriteLine($"[DEBUG] Iniciando transacción binaria grande con timeout de {timeoutSeconds} segundos");
            
            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    // Configurar la conexión para optimizar la transferencia de datos binarios grandes
                    connection.StatisticsEnabled = true;
                    
                    Console.WriteLine($"[DEBUG] Abriendo conexión a la base de datos...");
                    await connection.OpenAsync();
                    
                    using (var command = new SqlCommand(sqlQuery, connection))
                    {
                        command.CommandType = commandType;
                        command.CommandTimeout = timeoutSeconds; // Timeout extendido para archivos grandes
                        
                        if (parameters != null)
                        {
                            foreach (var param in parameters)
                            {
                                command.Parameters.Add(param);
                            }
                        }
                        
                        Console.WriteLine($"[DEBUG] Ejecutando comando SQL...");
                        var executeStartTime = DateTime.Now;
                        await command.ExecuteNonQueryAsync();
                        var executeEndTime = DateTime.Now;
                        
                        var stats = connection.RetrieveStatistics();
                        Console.WriteLine($"[DEBUG] Transacción completada en {(executeEndTime - executeStartTime).TotalSeconds:F2} segundos");
                        Console.WriteLine($"[DEBUG] Bytes enviados: {stats["BytesSent"]}, Bytes recibidos: {stats["BytesReceived"]}");
                        
                        return true;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine($"[ERROR] Error SQL en transacción binaria: {ex.Message}");
                Console.WriteLine($"[ERROR] Código de error: {ex.Number}, Estado: {ex.State}");
                if (ex.Number == -2) // Timeout
                {
                    Console.WriteLine($"[ERROR] La operación excedió el timeout de {timeoutSeconds} segundos");
                }
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error general en transacción binaria: {ex.Message}");
                throw;
            }
            finally
            {
                var endTime = DateTime.Now;
                Console.WriteLine($"[DEBUG] Tiempo total de la transacción: {(endTime - startTime).TotalSeconds:F2} segundos");
            }
        }
        
        public async Task<OperationResponse> SaveFileWithBinaryContent(FileUploadResponse fileData, byte[] fileContent, Log log)
        {
            // Declaración de variables
            var parameters = CreateParameters();
            
            try
            {
                // Determinar si es un archivo grande para ajustar timeout
                // Basado en pruebas: 15MB ~ 1-2 minutos
                // Calculamos el timeout de forma progresiva según el tamaño
                
                // Tamaños en bytes
                const int MB = 1048576;
                const int MAX_SIZE = 100 * MB; // Máximo 100MB
                
                // Verificar que no exceda el tamaño máximo
                if (fileContent.Length > MAX_SIZE)
                {
                    return new OperationResponse
                    {
                        Success = false,
                        Message = $"El archivo excede el tamaño máximo permitido de 100MB. Tamaño actual: {fileContent.Length / MB}MB",
                        MessageType = MessageType.Error
                    };
                }
                
                // Calcular timeout basado en el tamaño del archivo
                int timeout;
                if (fileContent.Length <= MB) // <= 1MB
                {
                    timeout = 60; // 1 minuto
                }
                else if (fileContent.Length <= 5 * MB) // 1-5MB
                {
                    timeout = 120; // 2 minutos
                }
                else if (fileContent.Length <= 20 * MB) // 5-20MB
                {
                    timeout = 180; // 3 minutos
                }
                else if (fileContent.Length <= 50 * MB) // 20-50MB
                {
                    timeout = 300; // 5 minutos
                }
                else // 50-100MB
                {
                    timeout = 600; // 10 minutos
                }
                
                bool isLargeFile = fileContent.Length > MB; // 1MB
                
                Console.WriteLine($"[DEBUG] Tamaño del archivo: {fileContent.Length} bytes, timeout: {timeout} segundos");
                
                // Agregar parámetros para la inserción
                AddParameter(parameters, "@P_FILENAME", fileData.FileName);
                AddParameter(parameters, "@P_FILEPATH", fileData.FilePath);
                AddParameter(parameters, "@P_FILEURL", fileData.FileUrl);
                AddParameter(parameters, "@P_FILESIZE", fileData.FileSize);
                AddParameter(parameters, "@P_FILETYPE", !string.IsNullOrEmpty(fileData.FileType) ? fileData.FileType : DBNull.Value);
                AddParameter(parameters, "@P_MIMETYPE", !string.IsNullOrEmpty(fileData.MimeType) ? fileData.MimeType : DBNull.Value);
                AddParameter(parameters, "@P_CUSTOMDIRECTORY", fileData.CustomDirectory);
                AddParameter(parameters, "@P_ISIMAGE", fileData.IsImage);
                AddBinaryParameter(parameters, "@P_FILECONTENT", fileContent); // Contenido binario del archivo optimizado
                AddParameter(parameters, "@P_HASBINARYCONTENT", true); // Indicar que tiene contenido binario
                AddOutputParameter(parameters, "@P_FILEID", SqlDbType.Int);
                
                // Procedimiento almacenado para insertar archivo con contenido binario
                strSql = "SP_INSERTAR_ARCHIVO";
                
                // Agregar parámetros de log
                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), log, OperationType.Insert);
                
                var startTime = DateTime.Now;
                bool success = false;
                string fileId = "0";
                
                try
                {
                    // Ejecutar la transacción con el método optimizado para archivos grandes
                    if (isLargeFile)
                    {
                        Console.WriteLine($"[DEBUG] Usando método optimizado para archivo grande");
                        success = await ExecuteLargeBinaryTransactionAsync(strSql, CommandType.StoredProcedure, strCadenaConexion, logParameters, timeout);
                    }
                    else
                    {
                        // Para archivos pequeños, usar el método estándar
                        success = await ExecuteTransactionAsync(strSql, CommandType.StoredProcedure, strCadenaConexion, logParameters);
                    }
                    
                    if (success)
                    {
                        var strMessage = GetOutputParameterValue(logParameters.ToList(), "@P_DESCRIPCION_MENSAJE") ?? "";
                        var strMessageType = GetOutputParameterValue(logParameters.ToList(), "@P_TIPO_MENSAJE") ?? "1";
                        fileId = GetOutputParameterValue(logParameters.ToList(), "@P_FILEID") ?? "0";
                        var messageType = (MessageType)int.Parse(strMessageType);
                        
                        // Calcular tiempo total y tasa de transferencia
                        var endTime = DateTime.Now;
                        var totalSeconds = (endTime - startTime).TotalSeconds;
                        var transferRateMBps = fileData.FileSize / (1024.0 * 1024.0) / totalSeconds;
                        
                        // Agregar información de rendimiento al mensaje
                        var performanceInfo = $"\nArchivo guardado en {totalSeconds:F2} segundos. ";
                        performanceInfo += $"Tasa de transferencia: {transferRateMBps:F2} MB/s";
                        
                        return new OperationResponse
                        {
                            Success = messageType != MessageType.Error,
                            Message = strMessage + (messageType != MessageType.Error ? performanceInfo : ""),
                            MessageType = messageType,
                            Data = fileId
                        };
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] Error al guardar archivo binario: {ex.Message}");
                    return new OperationResponse
                    {
                        Success = false,
                        Message = $"Error al guardar el archivo: {ex.Message}",
                        MessageType = MessageType.Error,
                        Data = fileId
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
        }
        
        /// <summary>
        /// Obtiene el contenido binario de un archivo almacenado en la base de datos
        /// </summary>
        /// <param name="fileId">ID del archivo a obtener</param>
        /// <param name="log">Información de log</param>
        /// <returns>Archivo con su contenido binario</returns>
        public async Task<OperationResponse> GetFileBinaryContent(int fileId, Log log)
        {
            // Declaración de variables
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                Console.WriteLine($"Obteniendo archivo binario con ID: {fileId}");
                // Agregar parámetros para obtener el archivo
                AddParameter(parameters, "@P_FILEID", fileId);

                strSql = "SP_OBTENER_ARCHIVO_BINARIO";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), log, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    Console.WriteLine($"DataSet obtenido. Tablas: {dtsDatos.Tables.Count}");
                    
                    // Verificar si hay tablas en el DataSet
                    if (dtsDatos.Tables.Count == 0 || dtsDatos.Tables[0].Rows.Count == 0)
                    {
                        Console.WriteLine("Error: El DataSet no contiene datos");
                        return new OperationResponse
                        {
                            Success = false,
                            Message = "No se encontró el archivo solicitado",
                            MessageType = MessageType.Warning
                        };
                    }
                    
                    // Usar DeserializeDataSet para obtener la lista de archivos
                    var files = DeserializeDataSet<List<StoredFile>>(dtsDatos);
                    
                    if (files == null || files.Count == 0)
                    {
                        Console.WriteLine("Error: No se pudo deserializar el archivo");
                        return new OperationResponse
                        {
                            Success = false,
                            Message = "Error al procesar la información del archivo",
                            MessageType = MessageType.Error
                        };
                    }
                    
                    // Obtener el primer (y único) archivo
                    StoredFile fileData = files[0];
                    
                    // Verificar que tenga contenido binario
                    if (fileData.FileContent == null || fileData.FileContent.Length == 0)
                    {
                        Console.WriteLine("Advertencia: El archivo no tiene contenido binario");
                        return new OperationResponse
                        {
                            Success = false,
                            Message = "El archivo no tiene contenido binario almacenado",
                            MessageType = MessageType.Warning
                        };
                    }
                    
                    Console.WriteLine($"Archivo obtenido: {fileData.FileName}, Tamaño: {fileData.FileContent.Length} bytes");

                    var strMessage = GetOutputParameterValue(logParameters.ToList(), "@P_DESCRIPCION_MENSAJE") ?? "";
                    var strMessageType = GetOutputParameterValue(logParameters.ToList(), "@P_TIPO_MENSAJE") ?? "1";
                    var messageType = (MessageType)int.Parse(strMessageType);

                    return new OperationResponse
                    {
                        Success = true,
                        Message = strMessage,
                        MessageType = messageType,
                        Data = fileData
                    };
                }
                else
                {
                    return new OperationResponse
                    {
                        Success = false,
                        Message = "Error al ejecutar el procedimiento almacenado",
                        MessageType = MessageType.Error
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetFileBinaryContent: {ex.Message}");
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
        
        /// <summary>
        /// Guarda los metadatos de un archivo en la base de datos
        /// </summary>
        /// <param name="fileData">Datos del archivo a guardar</param>
        /// <param name="log">Información de log</param>
        /// <returns>Respuesta de la operación</returns>
        public async Task<OperationResponse> SaveFileMetadata(FileUploadResponse fileData, Log log)
        {
            // Declaración de variables
            var parameters = CreateParameters();
            
            try
            {
                Console.WriteLine("Guardando metadatos del archivo en la base de datos: " + fileData.CustomDirectory);
                // Agregar parámetros para la inserción
                AddParameter(parameters, "@P_FILENAME", fileData.FileName);
                AddParameter(parameters, "@P_FILEPATH", fileData.FilePath);
                AddParameter(parameters, "@P_FILEURL", fileData.FileUrl);
                AddParameter(parameters, "@P_FILESIZE", fileData.FileSize);
                AddParameter(parameters, "@P_FILETYPE", !string.IsNullOrEmpty(fileData.FileType) ? fileData.FileType : DBNull.Value);
                AddParameter(parameters, "@P_MIMETYPE", !string.IsNullOrEmpty(fileData.MimeType) ? fileData.MimeType : DBNull.Value);
                AddParameter(parameters, "@P_CUSTOMDIRECTORY", fileData.CustomDirectory);
                AddParameter(parameters, "@P_ISIMAGE", fileData.IsImage);
                AddBinaryParameter(parameters, "@P_FILECONTENT", new byte[]{}); // Sin contenido binario
                AddParameter(parameters, "@P_HASBINARYCONTENT", false); // Indicar que no tiene contenido binario
                AddOutputParameter(parameters, "@P_FILEID", SqlDbType.Int);
                
                // Procedimiento almacenado para insertar archivo
                strSql = "SP_INSERTAR_ARCHIVO";
                
                // Agregar parámetros de log y ejecutar la transacción
                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), log, OperationType.Insert);
                if (await ExecuteTransactionAsync(strSql, CommandType.StoredProcedure, strCadenaConexion, logParameters))
                {
                    var strMessage = GetOutputParameterValue(logParameters.ToList(), "@P_DESCRIPCION_MENSAJE") ?? "";
                    var strMessageType = GetOutputParameterValue(logParameters.ToList(), "@P_TIPO_MENSAJE") ?? "1";
                    var fileId = GetOutputParameterValue(logParameters.ToList(), "@P_FILEID") ?? "0";
                    var messageType = (MessageType)int.Parse(strMessageType);
                    
                    return new OperationResponse
                    {
                        Success = messageType != MessageType.Error,
                        Message = strMessage,
                        MessageType = messageType,
                        Data = fileId
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
        }

        /// <summary>
        /// Elimina los metadatos de un archivo de la base de datos
        /// </summary>
        /// <param name="filePath">Ruta del archivo a eliminar</param>
        /// <param name="customDirectory">Directorio personalizado del archivo</param>
        /// <param name="log">Información de log</param>
        /// <returns>Respuesta de la operación</returns>
        public async Task<OperationResponse> DeleteFileMetadata(string filePath, string? customDirectory, Log log)
        {
            // Declaración de variables
            var parameters = CreateParameters();
            
            try
            {
                // Decodificar la ruta del archivo si está codificada como URL
                string decodedFilePath = System.Net.WebUtility.UrlDecode(filePath);
                Console.WriteLine($"Eliminando metadatos del archivo de la base de datos: {decodedFilePath}");
                
                // Agregar parámetros para la eliminación
                AddParameter(parameters, "@P_FILE_ID", DBNull.Value);
                AddParameter(parameters, "@P_FILEPATH", decodedFilePath);
                AddParameter(parameters, "@P_CUSTOMDIRECTORY", !string.IsNullOrEmpty(customDirectory) ? customDirectory : DBNull.Value);
                
                // Procedimiento almacenado para eliminar archivo
                strSql = "SP_ELIMINAR_ARCHIVO";
                
                // Agregar parámetros de log y ejecutar la transacción
                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), log, OperationType.Delete);
                if (await ExecuteTransactionAsync(strSql, CommandType.StoredProcedure, strCadenaConexion, logParameters))
                {
                    var strMessage = GetOutputParameterValue(logParameters.ToList(), "@P_DESCRIPCION_MENSAJE") ?? "";
                    var strMessageType = GetOutputParameterValue(logParameters.ToList(), "@P_TIPO_MENSAJE") ?? "1";
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
        }

        public async Task<OperationResponse> GetStoredFiles(StoredFile filter, Log log)
        {
            // Declaración de variables
            var dtsDatos = new DataSet();
            var parameters = CreateParameters();

            try
            {
                // Agregar parámetros para filtrar
                AddParameter(parameters, "@P_FILE_TYPE", !string.IsNullOrEmpty(filter.FileType) ? filter.FileType : DBNull.Value);
                AddParameter(parameters, "@P_CUSTOM_DIRECTORY", !string.IsNullOrEmpty(filter.CustomDirectory) ? filter.CustomDirectory : DBNull.Value);
                AddParameter(parameters, "@P_FILE_NAME", !string.IsNullOrEmpty(filter.FileName) ? filter.FileName : DBNull.Value);

                strSql = "SP_BUSCAR_ARCHIVOS_ALMACENADOS";

                var logParameters = clsLogDao.AgregarParametrosLog(parameters.ToArray(), log, OperationType.Query);

                if (await GetDataSetAsync(strSql, CommandType.StoredProcedure, 
                    strCadenaConexion, logParameters, dtsDatos))
                {
                    var dtsData = DeserializeDataSet<List<StoredFile>>(dtsDatos) ?? new List<StoredFile>();

                    var strMessage = GetOutputParameterValue(logParameters.ToList(), "@P_DESCRIPCION_MENSAJE") ?? "";
                    var strMessageType = GetOutputParameterValue(logParameters.ToList(), "@P_TIPO_MENSAJE") ?? "1";
                    var messageType = (MessageType)int.Parse(strMessageType);

                    return new OperationResponse
                    {
                        Success = true,
                        Message = strMessage,
                        MessageType = messageType,
                        Data = dtsData
                    };
                }
                else
                {
                    return new OperationResponse
                    {
                        Success = false,
                        Message = "Error al ejecutar el procedimiento almacenado",
                        MessageType = MessageType.Error
                    };
                }
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
    }
}
