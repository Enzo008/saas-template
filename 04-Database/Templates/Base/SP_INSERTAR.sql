-- =============================================
-- Autor:           [Developer Name]
-- Fecha Creación:  [YYYY-MM-DD]
-- Descripción:     Template para inserción de registros - Tablas Base (TB_)
-- Modificaciones:  [Date] - [Author] - [Description]
-- =============================================
CREATE OR ALTER PROCEDURE SP_INSERTAR_[ENTITY]
@P_[FIELD1]             [DATA_TYPE],
@P_[FIELD2]             [DATA_TYPE],
@P_USUING               VARCHAR(50),
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
            @V_SQL_MENSAJE           NVARCHAR(MAX)  = '',
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TB_[ENTITY]',
            @V_DEFECTO               NVARCHAR(02)   = '01',
            @V_CODIGO_GENERADO       NVARCHAR(300)  = '',
            @V_CODIGO_LOG_ANIO       CHAR(4)        = '',
            @V_CODIGO_LOG            CHAR(10)       = '',
            @V_CANTIDAD_REGISTRO     INT,
            @V_DESCRIPCION_LOG       NVARCHAR(300)  = '',
            @V_ERROR                 NVARCHAR(MAX)  = '',
            @V_CADENA                NVARCHAR(MAX)  = '',
            @V_CODIGO_COMPLETO       NVARCHAR(20)   = '',
            @V_ZONA_HORARIA_OFFSET   NVARCHAR(6)    = '',
            @V_ZONA_HORARIA_NOMBRE   NVARCHAR(50)   = '',
            @V_ZONA_HORARIA_LOCALE   NVARCHAR(50)   = ''

    -- Validaciones de entrada
    IF @P_[FIELD1] IS NULL OR LTRIM(RTRIM(@P_[FIELD1])) = ''
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'El campo [FIELD1] es requerido'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END

    -- Verificar duplicados
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE [FIELD1] = ''' + LTRIM(RTRIM(UPPER(@P_[FIELD1]))) + ''' AND ' + 
                 ' ESTREG <> ''E'' '

    EXECUTE sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'El registro ya existe en la Base de Datos'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END

    -- Generar código automático
    EXEC SP_GENERAR_CODIGO @V_DEFECTO, @V_NOMBRE_TABLA, '[ENTITY]COD', @V_CODIGO = @V_CODIGO_GENERADO OUTPUT

    -- Obtener zona horaria del usuario
    EXEC SP_OBTENER_ZONA_HORARIA_USUARIO
        @P_USUANO_U,
        @P_USUCOD_U,
        @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
        @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
        @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- Insertar registro
    SET @V_SQL = ' INSERT INTO ' + @V_NOMBRE_TABLA + '(' +
                 '  [ENTITY]COD, ' +
                 '  [FIELD1], ' +
                 '  [FIELD2], ' +
                 '  USUING, ' +
                 '  FECING, ' +
                 '  ZONING, ' +
                 '  USUMOD, ' +
                 '  FECMOD, ' +
                 '  ZONMOD, ' +
                 '  ESTREG' +
                 ' ) VALUES(' +
                 '  ''' + LTRIM(RTRIM(UPPER(@V_CODIGO_GENERADO))) + ''', ' +
                 '  ''' + LTRIM(RTRIM(UPPER(@P_[FIELD1]))) + ''', ' +
                 '  ''' + LTRIM(RTRIM(UPPER(@P_[FIELD2]))) + ''', ' +
                 '  ''' + LTRIM(RTRIM(UPPER(@P_USUING))) + ''', ' +
                 '  SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''), ' +
                 '  ''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''', ' +
                 '  ''' + LTRIM(RTRIM(UPPER(@P_USUING))) + ''', ' +
                 '  SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''), ' +
                 '  ''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''', ' +
                 '  ''I'')'

    EXECUTE sp_executesql @V_SQL

    -- Generar mensaje de éxito
    SET @V_SQL_MENSAJE = ' SELECT @V_CADENA = ''EL [ENTITY] ['' + [FIELD1] + '']'' ' +
                         ' FROM ' + @V_NOMBRE_TABLA + 
                         ' WHERE [ENTITY]COD = ''' + @V_CODIGO_GENERADO + ''''

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    SET @V_DESCRIPCION_LOG = 'REGISTRÓ ' + @V_CADENA
    SET @V_CODIGO_COMPLETO = @V_CODIGO_GENERADO

    -- Registrar log de éxito
    EXEC SP_REGISTRAR_LOG @V_DESCRIPCION_LOG, 'INSERTAR', @P_LOGIPMAQ, @V_CODIGO_COMPLETO, @V_NOMBRE_TABLA, @V_SQL, 'EXITO',
         @P_USUANO_U, @P_USUCOD_U, @P_USUNOM_U, @P_USUAPE_U,
         @P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,
         @P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,
         @P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,
         @P_LOGCOD = @V_CODIGO_LOG OUTPUT

    SET @P_DESCRIPCION_MENSAJE = 'El [ENTITY] se registró correctamente'
    SET @P_TIPO_MENSAJE = '3'

    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL @V_CODIGO_LOG_ANIO, @V_CODIGO_LOG, @V_SQL

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG @V_ERROR, 'INSERTAR', @P_LOGIPMAQ, @V_CODIGO_COMPLETO, @V_NOMBRE_TABLA, @V_SQL, 'ERROR',
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
-- 4. Ajustar @V_DEFECTO según el patrón de códigos requerido
-- 5. Agregar campos adicionales según la estructura de la tabla
-- 6. Modificar validaciones según reglas de negocio
-- 
-- CARACTERÍSTICAS:
-- - Generación automática de códigos
-- - Validación de duplicados
-- - Manejo de zona horaria del usuario
-- - Auditoría completa (FECING, USUMOD, etc.)
-- - Logging de operaciones
-- - Manejo de errores robusto
-- - Compatible con tablas base (TB_)
-- =============================================
