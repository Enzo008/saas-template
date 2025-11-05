-- =============================================
-- Autor:           [Developer Name]
-- Fecha Creación:  [YYYY-MM-DD]
-- Descripción:     Template para eliminación lógica de registros - Tablas Base (TB_)
-- Modificaciones:  [Date] - [Author] - [Description]
-- =============================================
CREATE OR ALTER PROCEDURE SP_ELIMINAR_[ENTITY]
@P_[ENTITY]COD          [DATA_TYPE],
@P_USUMOD               VARCHAR(50),
@P_LOGIPMAQ             VARCHAR(15),
@P_USUANO_U             CHAR(4),
@P_USUCOD_U             CHAR(6),
@P_USUNOM_U             VARCHAR(30),
@P_USUAPE_U             VARCHAR(30),
@P_DESCRIPCION_MENSAJE  NVARCHAR(MAX) OUTPUT,
@P_TIPO_MENSAJE         CHAR(1) OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    -- Validaciones de entrada
    IF @P_[ENTITY]COD IS NULL OR LTRIM(RTRIM(@P_[ENTITY]COD)) = ''
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'El código de [ENTITY] es requerido'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END

    -- Verificar que el registro existe
    IF NOT EXISTS (SELECT 1 FROM TB_[ENTITY] WHERE [ENTITY]COD = LTRIM(RTRIM(@P_[ENTITY]COD)) AND ESTREG <> 'E')
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'El registro no existe en la Base de Datos'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END

    -- Verificar referencias en otras tablas (agregar según necesidad)
    /*
    IF EXISTS (SELECT 1 FROM TM_[RELATED_TABLE] WHERE [ENTITY]COD = LTRIM(RTRIM(@P_[ENTITY]COD)) AND ESTREG <> 'E')
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'No puedes eliminar el registro hasta que elimines todas sus referencias en otras tablas del sistema'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END
    */

    DECLARE @V_SQL                   NVARCHAR(MAX)  = '',
            @V_SQL_MENSAJE           NVARCHAR(MAX)  = '',
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TB_[ENTITY]',
            @V_CODIGO_LOG_ANIO       CHAR(4)        = '',
            @V_CODIGO_LOG            CHAR(10)       = '',
            @V_DESCRIPCION_LOG       NVARCHAR(300)  = '',
            @V_ERROR                 NVARCHAR(MAX)  = '',
            @V_CADENA                NVARCHAR(MAX)  = '',
            @V_CODIGO_COMPLETO       NVARCHAR(20)   = '',
            @V_ZONA_HORARIA_OFFSET   NVARCHAR(6)    = '',
            @V_ZONA_HORARIA_NOMBRE   NVARCHAR(50)   = '',
            @V_ZONA_HORARIA_LOCALE   NVARCHAR(50)   = ''

    -- Obtener zona horaria del usuario
    EXEC SP_OBTENER_ZONA_HORARIA_USUARIO 
        @P_USUANO_U,
        @P_USUCOD_U,
        @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
        @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
        @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- Realizar eliminación lógica
    SET @V_SQL = ' UPDATE ' + @V_NOMBRE_TABLA + 
                 ' SET ' + 
                 ' USUMOD = ''' + LTRIM(RTRIM(UPPER(@P_USUMOD))) + ''', ' +
                 ' FECMOD = SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''), ' +
                 ' ZONMOD = ''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''', ' +
                 ' ESTREG = ''E'' ' +
                 ' WHERE [ENTITY]COD = ''' + LTRIM(RTRIM(UPPER(@P_[ENTITY]COD))) + ''' '

    EXEC sp_executesql @V_SQL

    -- Obtener información del registro eliminado
    SET @V_SQL_MENSAJE = ' SELECT @V_CADENA = ''EL [ENTITY] ['' + [FIELD1] + '']'' ' +
                         ' FROM ' + @V_NOMBRE_TABLA + 
                         ' WHERE [ENTITY]COD = ''' + LTRIM(RTRIM(UPPER(@P_[ENTITY]COD))) + ''' '

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    SET @V_DESCRIPCION_LOG = 'ELIMINÓ ' + @V_CADENA
    SET @V_CODIGO_COMPLETO = LTRIM(RTRIM(UPPER(@P_[ENTITY]COD)))

    -- Registrar log de éxito
    EXEC SP_REGISTRAR_LOG @V_DESCRIPCION_LOG, 'ELIMINAR', @P_LOGIPMAQ, @V_CODIGO_COMPLETO, @V_NOMBRE_TABLA, @V_SQL, 'EXITO',
         @P_USUANO_U, @P_USUCOD_U, @P_USUNOM_U, @P_USUAPE_U,
         @P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,
         @P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,
         @P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,
         @P_LOGCOD = @V_CODIGO_LOG OUTPUT

    SET @P_DESCRIPCION_MENSAJE = 'El [ENTITY] se eliminó correctamente'
    SET @P_TIPO_MENSAJE = '3'

    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL @V_CODIGO_LOG_ANIO, @V_CODIGO_LOG, @V_SQL

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG @V_ERROR, 'ELIMINAR', @P_LOGIPMAQ, @V_CODIGO_COMPLETO, @V_NOMBRE_TABLA, @V_SQL, 'ERROR',
         @P_USUANO_U, @P_USUCOD_U, @P_USUNOM_U, @P_USUAPE_U,
         @P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,
         @P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,
         @P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,
         @P_LOGCOD = @V_CODIGO_LOG OUTPUT
    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL @V_CODIGO_LOG_ANIO, @V_CODIGO_LOG, @V_SQL
    SET @P_DESCRIPCION_MENSAJE = @V_ERROR
    SET @P_TIPO_MENSAJE = '1'
END CATCH
GO

-- =============================================
-- INSTRUCCIONES DE USO:
-- 1. Reemplazar [ENTITY] con el nombre de la entidad (ej: CARGO, GENERO)
-- 2. Reemplazar [FIELD1] con el campo descriptivo principal
-- 3. Reemplazar [DATA_TYPE] con el tipo de dato correspondiente
-- 4. Descomentar y configurar validaciones de integridad referencial
-- 5. Agregar más validaciones según reglas de negocio
-- 
-- VALIDACIONES DE INTEGRIDAD REFERENCIAL:
-- Descomentar y personalizar según las relaciones de la tabla:
-- 
-- Para tablas que son referenciadas por otras:
-- IF EXISTS (SELECT 1 FROM TM_USUARIO WHERE CARCOD = @P_CARCOD AND ESTREG <> 'E')
-- BEGIN
--     SET @P_DESCRIPCION_MENSAJE = 'No se puede eliminar: existen usuarios con este cargo'
--     SET @P_TIPO_MENSAJE = '2'
--     RETURN
-- END
-- 
-- CARACTERÍSTICAS:
-- - Eliminación lógica (ESTREG = 'E')
-- - Validación de existencia del registro
-- - Validaciones de integridad referencial
-- - Manejo de zona horaria del usuario
-- - Actualización de campos de auditoría (FECMOD, USUMOD, etc.)
-- - Logging detallado de operaciones
-- - Compatible con tablas base (TB_)
-- =============================================
