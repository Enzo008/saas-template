-- *****************************************************************************************************
-- Description       : Create new identity document
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Insert new identity document type
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_CREATE_IDENTITY_DOCUMENT
@P_IDEDOCNAM                VARCHAR(50),
@P_IDEDOCABR                VARCHAR(50),
@P_USEING                   VARCHAR(50),
@P_LOGIPMAQ                 VARCHAR(15),
@P_USEYEA_U                 CHAR(4),
@P_USECOD_U                 CHAR(6),
@P_USENAM_U                 VARCHAR(30),
@P_USELAS_U                 VARCHAR(30),
@P_DESCRIPCION_MENSAJE      NVARCHAR(MAX) OUTPUT,
@P_TIPO_MENSAJE             CHAR(1) OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_SQL                   NVARCHAR(MAX)  = '',
            @V_SQL_MENSAJE           NVARCHAR(MAX)  = '',
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TB_IDENTITY_DOCUMENT',
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
            @V_ZONA_HORARIA_LOCALE   NVARCHAR(5)    = ''

    -- Validate identity document doesn't exist
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE IDEDOCNAM = ''' + LTRIM(RTRIM(@P_IDEDOCNAM)) + ''' AND ' + 
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'An identity document with the same name already exists'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    BEGIN TRANSACTION

    -- Generate code
    EXEC SP_GENERAR_CODIGO @V_DEFECTO, @V_NOMBRE_TABLA, 'IDEDOCCOD', @V_CODIGO = @V_CODIGO_GENERADO OUTPUT

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
        @P_USECOD_U,
        @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
        @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
        @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- Insert identity document
    SET @V_SQL = ' INSERT INTO TB_IDENTITY_DOCUMENT(' +
                        'IDEDOCCOD, ' +
                        'IDEDOCNAM, ' +
                        'IDEDOCABR, ' +
                        'USECRE, ' +
                        'DATCRE, ' +
                        'USEUPD, ' +
                        'DATUPD, ' +
                        'STAREG' +
                 ') VALUES(' +
                        '''' + LTRIM(RTRIM(UPPER(@V_CODIGO_GENERADO))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_IDEDOCNAM))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_IDEDOCABR))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USEING))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USEING))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                        '''C'')'  -- C = CREATE

    EXECUTE sp_executesql @V_SQL

    -- Generate success message
    SET @V_SQL_MENSAJE = '  SELECT ' + 
                         '  @V_CADENA = ''IDENTITY DOCUMENT ['' + IDEDOC.IDEDOCNAM + '']'' ' +
                         '  FROM TB_IDENTITY_DOCUMENT AS IDEDOC ' +
                         '  WHERE IDEDOC.IDEDOCCOD = ''' + @V_CODIGO_GENERADO + ''''

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    SET @V_DESCRIPCION_LOG = 'CREATED ' + @V_CADENA
    SET @V_CODIGO_COMPLETO = @V_CODIGO_GENERADO

    -- Register log
    EXEC SP_REGISTRAR_LOG  @V_DESCRIPCION_LOG,
                           'INSERT',
                           @P_LOGIPMAQ,
                           @V_CODIGO_COMPLETO,
                           @V_NOMBRE_TABLA,
                           @V_SQL,
                           'SUCCESS',
                           @P_USEYEA_U,
                           @P_USECOD_U,
                           @P_USENAM_U,
                           @P_USELAS_U,
                           @P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,
                           @P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,
                           @P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,
                           @P_LOGCOD = @V_CODIGO_LOG OUTPUT

    SET @P_DESCRIPCION_MENSAJE  = 'Identity document created successfully.'
    SET @P_TIPO_MENSAJE         = '3'

    COMMIT TRANSACTION

    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL  @V_CODIGO_LOG_ANIO,@V_CODIGO_LOG,@V_SQL

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG  @V_ERROR,
                              'INSERT',
                              @P_LOGIPMAQ,
                              @V_CODIGO_COMPLETO,
                              @V_NOMBRE_TABLA,
                              @V_SQL,
                              'ERROR',
                              @P_USEYEA_U,
                              @P_USECOD_U,
                              @P_USENAM_U,
                              @P_USELAS_U,
                              @P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,
                              @P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,
                              @P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,
                              @P_LOGCOD = @V_CODIGO_LOG OUTPUT
    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL  @V_CODIGO_LOG_ANIO,@V_CODIGO_LOG,@V_SQL
    SET @P_DESCRIPCION_MENSAJE  = @V_ERROR
    SET @P_TIPO_MENSAJE         = '1'
END CATCH
GO
