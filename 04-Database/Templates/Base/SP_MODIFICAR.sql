-- =============================================
-- Autor:           [Developer Name]
-- Fecha Creación:  [YYYY-MM-DD]
-- Descripción:     Template para modificación de registros - Tablas Base (TB_)
-- Modificaciones:  [Date] - [Author] - [Description]
-- =============================================
CREATE OR ALTER PROCEDURE SP_MODIFICAR_[ENTITY]
@P_[ENTITY]COD          CHAR(2),
@P_[FIELD1]             [DATA_TYPE],
@P_[FIELD2]             [DATA_TYPE],
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

    DECLARE @V_SQL                   NVARCHAR(MAX)  = '',
            @V_SQL_MODIFICADO        NVARCHAR(MAX)  = '',
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TB_[ENTITY]',
            @V_CODIGO_LOG_ANIO       CHAR(4)        = '',
            @V_CODIGO_LOG            CHAR(10)       = '',
            @V_CANTIDAD_REGISTRO     INT,
            @V_DESCRIPCION_LOG       NVARCHAR(300)  = '',
            @V_ERROR                 NVARCHAR(MAX)  = '',
            @V_CADENA                NVARCHAR(MAX)  = '',
            @V_CADENA_MODIFICADO     NVARCHAR(MAX)  = '',
            @V_CODIGO_COMPLETO       NVARCHAR(20)   = '',
            @V_ZONA_HORARIA_OFFSET   NVARCHAR(6)    = '',
            @V_ZONA_HORARIA_NOMBRE   NVARCHAR(50)   = '',
            @V_ZONA_HORARIA_LOCALE   NVARCHAR(50)   = ''

    -- Validaciones de entrada
    IF @P_[ENTITY]COD IS NULL OR LTRIM(RTRIM(@P_[ENTITY]COD)) = ''
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'El código de [ENTITY] es requerido'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END

    IF @P_[FIELD1] IS NULL OR LTRIM(RTRIM(@P_[FIELD1])) = ''
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'El campo [FIELD1] es requerido'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END

    -- Verificar que el registro existe
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE [ENTITY]COD = ''' + LTRIM(RTRIM(@P_[ENTITY]COD)) + ''' ' +
                 ' AND ESTREG <> ''E'' '

    EXECUTE sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO = 0
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'El registro no existe en la Base de Datos'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END

    -- Obtener datos antes de la modificación
    SET @V_SQL = ' SELECT @V_CADENA = ''EL [ENTITY] ['' + [FIELD1] + '']'' ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE [ENTITY]COD = ''' + LTRIM(RTRIM(UPPER(@P_[ENTITY]COD))) + ''' '

    EXEC sp_executesql @V_SQL, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    -- Verificar duplicados (excluyendo el registro actual)
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE [FIELD1] = ''' + LTRIM(RTRIM(UPPER(@P_[FIELD1]))) + ''' ' +
                 ' AND [ENTITY]COD <> ''' + LTRIM(RTRIM(@P_[ENTITY]COD)) + ''' ' +
                 ' AND ESTREG <> ''E'' '

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'Ya existe otro registro con el mismo [FIELD1]'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END

    -- Obtener zona horaria del usuario
    EXEC SP_OBTENER_ZONA_HORARIA_USUARIO 
        @P_USUANO_U,
        @P_USUCOD_U,
        @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
        @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
        @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- Actualizar registro
    SET @V_SQL = ' UPDATE ' + @V_NOMBRE_TABLA + ' SET ' +
                 ' [FIELD1] = ''' + LTRIM(RTRIM(UPPER(@P_[FIELD1]))) + ''', ' +
                 ' [FIELD2] = ''' + LTRIM(RTRIM(UPPER(@P_[FIELD2]))) + ''', ' +
                 ' USUMOD = ''' + LTRIM(RTRIM(UPPER(@P_USUMOD))) + ''', ' +
                 ' FECMOD = SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''), ' +
                 ' ZONMOD = ''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''', ' +
                 ' ESTREG = ''M'' ' +
                 ' WHERE [ENTITY]COD = ''' + LTRIM(RTRIM(UPPER(@P_[ENTITY]COD))) + ''' '

    EXEC sp_executesql @V_SQL

    -- Obtener datos después de la modificación
    SET @V_SQL_MODIFICADO = ' SELECT @V_CADENA_MODIFICADO = ''EL [ENTITY] ['' + [FIELD1] + '']'' ' +
                            ' FROM ' + @V_NOMBRE_TABLA + 
                            ' WHERE [ENTITY]COD = ''' + LTRIM(RTRIM(UPPER(@P_[ENTITY]COD))) + ''' '

    EXEC sp_executesql @V_SQL_MODIFICADO, N'@V_CADENA_MODIFICADO NVARCHAR(MAX) OUTPUT', @V_CADENA_MODIFICADO OUTPUT

    SET @V_DESCRIPCION_LOG = 'MODIFICÓ ' + @V_CADENA + ' POR ' + @V_CADENA_MODIFICADO
    SET @V_CODIGO_COMPLETO = LTRIM(RTRIM(UPPER(@P_[ENTITY]COD)))

    -- Registrar log de éxito
    EXEC SP_REGISTRAR_LOG @V_DESCRIPCION_LOG, 'MODIFICAR', @P_LOGIPMAQ, @V_CODIGO_COMPLETO, @V_NOMBRE_TABLA, @V_SQL, 'EXITO',
         @P_USUANO_U, @P_USUCOD_U, @P_USUNOM_U, @P_USUAPE_U,
         @P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,
         @P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,
         @P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,
         @P_LOGCOD = @V_CODIGO_LOG OUTPUT

    SET @P_DESCRIPCION_MENSAJE = 'El [ENTITY] se modificó correctamente'
    SET @P_TIPO_MENSAJE = '3'

    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL @V_CODIGO_LOG_ANIO, @V_CODIGO_LOG, @V_SQL

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG @V_ERROR, 'MODIFICAR', @P_LOGIPMAQ, @V_CODIGO_COMPLETO, @V_NOMBRE_TABLA, @V_SQL, 'ERROR',
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
-- 2. Reemplazar [FIELD1], [FIELD2] con los campos específicos
-- 3. Reemplazar [DATA_TYPE] con el tipo de dato correspondiente
-- 4. Agregar campos adicionales según la estructura de la tabla
-- 5. Modificar validaciones según reglas de negocio
-- 
-- CARACTERÍSTICAS:
-- - Validación de existencia del registro
-- - Verificación de duplicados excluyendo registro actual
-- - Auditoría de cambios (antes y después)
-- - Manejo de zona horaria del usuario
-- - Actualización de campos de auditoría (FECMOD, USUMOD, etc.)
-- - Estado ESTREG = 'M' para modificado
-- - Logging detallado de operaciones
-- - Compatible con tablas base (TB_)
-- =============================================
