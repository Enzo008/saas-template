-- *****************************************************************************************************
-- Description       : Update existing identity document
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Update identity document type
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_UPDATE_IDENTITY_DOCUMENT
@P_IDEDOCCOD                CHAR(2),
@P_IDEDOCNAM                VARCHAR(50),
@P_IDEDOCABR                VARCHAR(50),
@P_USEMOD                   VARCHAR(50),
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
            @V_SQL_MODIFICADO        NVARCHAR(MAX)  = '',
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TB_IDENTITY_DOCUMENT',
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
            @V_ZONA_HORARIA_LOCALE   NVARCHAR(5)    = ''

    -- Validate identity document exists
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE IDEDOCCOD = ''' + LTRIM(RTRIM(@P_IDEDOCCOD)) + ''' AND ' + 
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO = 0
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'The identity document you are trying to update does not exist'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    -- Validate no other identity document exists with same name
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE IDEDOCNAM = ''' + LTRIM(RTRIM(@P_IDEDOCNAM)) + ''' AND ' + 
                 ' IDEDOCCOD <> ''' + LTRIM(RTRIM(@P_IDEDOCCOD)) + ''' AND ' +
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'Another identity document with the same name already exists'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    BEGIN TRANSACTION

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                             @P_USECOD_U,
                             @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
                             @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
                             @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- Update identity document
    SET @V_SQL = ' UPDATE ' + @V_NOMBRE_TABLA + 
                 ' SET ' +
                 ' IDEDOCNAM = ''' + LTRIM(RTRIM(UPPER(@P_IDEDOCNAM))) + ''',' + 
                 ' IDEDOCABR = ''' + LTRIM(RTRIM(UPPER(@P_IDEDOCABR))) + ''',' + 
                 ' USEUPD = ''' + LTRIM(RTRIM(UPPER(@P_USEMOD))) + ''',' +
                 ' DATUPD = SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                 ' STAREG = ''U''' +  -- U = UPDATE
                 ' WHERE IDEDOCCOD = ''' + LTRIM(RTRIM(UPPER(@P_IDEDOCCOD))) + ''''

    EXEC sp_executesql @V_SQL

    -- Get updated identity document name for log
    SET @V_SQL_MODIFICADO = '  SELECT ' + 
                            '  @V_CADENA_MODIFICADO = ''IDENTITY DOCUMENT ['' + IDEDOC.IDEDOCNAM + '']'' ' +
                            '  FROM TB_IDENTITY_DOCUMENT AS IDEDOC ' +
                            '  WHERE IDEDOC.IDEDOCCOD = ''' + LTRIM(RTRIM(UPPER(@P_IDEDOCCOD))) + ''' '

    EXEC sp_executesql @V_SQL_MODIFICADO, N'@V_CADENA_MODIFICADO NVARCHAR(MAX) OUTPUT', @V_CADENA_MODIFICADO OUTPUT

    SET @V_DESCRIPCION_LOG = 'UPDATED ' + @V_CADENA_MODIFICADO
    SET @V_CODIGO_COMPLETO = @P_IDEDOCCOD

    -- Register log
    EXEC SP_REGISTRAR_LOG  @V_DESCRIPCION_LOG,
                           'UPDATE',
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

    SET @P_DESCRIPCION_MENSAJE  = 'Identity document updated successfully.'
    SET @P_TIPO_MENSAJE         = '3'

    COMMIT TRANSACTION

    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL  @V_CODIGO_LOG_ANIO,@V_CODIGO_LOG,@V_SQL

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG  @V_ERROR,
                              'UPDATE',
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
