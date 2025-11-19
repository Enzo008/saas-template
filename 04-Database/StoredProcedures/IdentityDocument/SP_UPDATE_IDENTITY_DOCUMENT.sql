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
@P_USEUPD                   VARCHAR(50),
@P_LOGIPMAC                 VARCHAR(15),
@P_USEYEA_U                 CHAR(4),
@P_USECOD_U                 CHAR(6),
@P_USENAM_U                 VARCHAR(30),
@P_USELASNAM_U                 VARCHAR(30),
@P_MESSAGE_DESCRIPTION      NVARCHAR(MAX) OUTPUT,
@P_MESSAGE_TYPE             CHAR(1) OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_SQL                   NVARCHAR(MAX)  = '',
            @V_SQL_MENSAJE           NVARCHAR(MAX)  = '',
            @V_SQL_MODIFICADO        NVARCHAR(MAX)  = '',
            @V_NAME_TABLE          NVARCHAR(300)  = 'TB_IDENTITY_DOCUMENT',
            @V_CODE_LOG_YEAR       CHAR(4)        = '',
            @V_CODE_LOG            CHAR(10)       = '',
            @V_CANTIDAD_REGISTRO     INT,
            @V_DESCRIPTION_LOG       NVARCHAR(300)  = '',
            @V_ERROR                 NVARCHAR(MAX)  = '',
            @V_CADENA                NVARCHAR(MAX)  = '',
            @V_CADENA_MODIFICADO     NVARCHAR(MAX)  = '',
            @V_CODE_COMPLETE       NVARCHAR(20)   = '',
            @V_TIME_ZONE_OFFSET   NVARCHAR(6)    = '',
            @V_TIME_ZONE_NAME   NVARCHAR(50)   = '',
            @V_TIME_ZONE_LOCALE   NVARCHAR(5)    = ''

    -- Validate identity document exists
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE IDEDOCCOD = ''' + LTRIM(RTRIM(@P_IDEDOCCOD)) + ''' AND ' + 
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO = 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'The identity document you are trying to update does not exist'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    -- Validate no other identity document exists with same name
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE IDEDOCNAM = ''' + LTRIM(RTRIM(@P_IDEDOCNAM)) + ''' AND ' + 
                 ' IDEDOCCOD <> ''' + LTRIM(RTRIM(@P_IDEDOCCOD)) + ''' AND ' +
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'Another identity document with the same name already exists'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    BEGIN TRANSACTION

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                             @P_USECOD_U,
                             @P_LOCOFFZON = @V_TIME_ZONE_OFFSET OUTPUT,
                             @P_LOCLOC = @V_TIME_ZONE_LOCALE OUTPUT,
                             @P_LOCNAMZON = @V_TIME_ZONE_NAME OUTPUT

    -- Update identity document
    SET @V_SQL = ' UPDATE ' + @V_NAME_TABLE + 
                 ' SET ' +
                 ' IDEDOCNAM = ''' + LTRIM(RTRIM(UPPER(@P_IDEDOCNAM))) + ''',' + 
                 ' IDEDOCABR = ''' + LTRIM(RTRIM(UPPER(@P_IDEDOCABR))) + ''',' + 
                 ' USEUPD = ''' + LTRIM(RTRIM(UPPER(@P_USEUPD))) + ''',' +
                 ' DATUPD = SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                 ' STAREG = ''U''' +  -- U = UPDATE
                 ' WHERE IDEDOCCOD = ''' + LTRIM(RTRIM(UPPER(@P_IDEDOCCOD))) + ''''

    EXEC sp_executesql @V_SQL

    -- Get updated identity document name for log
    SET @V_SQL_MODIFICADO = '  SELECT ' + 
                            '  @V_CADENA_MODIFICADO = ''IDENTITY DOCUMENT ['' + IDEDOC.IDEDOCNAM + '']'' ' +
                            '  FROM TB_IDENTITY_DOCUMENT AS IDEDOC ' +
                            '  WHERE IDEDOC.IDEDOCCOD = ''' + LTRIM(RTRIM(UPPER(@P_IDEDOCCOD))) + ''' '

    EXEC sp_executesql @V_SQL_MODIFICADO, N'@V_CADENA_MODIFICADO NVARCHAR(MAX) OUTPUT', @V_CADENA_MODIFICADO OUTPUT

    SET @V_DESCRIPTION_LOG = 'UPDATED ' + @V_CADENA_MODIFICADO
    SET @V_CODE_COMPLETE = @P_IDEDOCCOD

    -- Register log
    EXEC SP_REGISTER_LOG  @V_DESCRIPTION_LOG,
                           'UPDATE',
                           @P_LOGIPMAC,
                           @V_CODE_COMPLETE,
                           @V_NAME_TABLE,
                           @V_SQL,
                           'SUCCESS',
                           @P_USEYEA_U,
                           @P_USECOD_U,
                           @P_USENAM_U,
                           @P_USELASNAM_U,
                           @P_MESSAGE_DESCRIPTION = @P_MESSAGE_DESCRIPTION OUTPUT,
                           @P_MESSAGE_TYPE = @P_MESSAGE_TYPE OUTPUT,
                           @P_LOGYEA = @V_CODE_LOG_YEAR OUTPUT,
                           @P_LOGCOD = @V_CODE_LOG OUTPUT

    SET @P_MESSAGE_DESCRIPTION  = 'Identity document updated successfully.'
    SET @P_MESSAGE_TYPE         = '3'

    COMMIT TRANSACTION

    EXEC SP_UPDATE_DATE_END_SQL  @V_CODE_LOG_YEAR,@V_CODE_LOG,@V_SQL

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTER_LOG  @V_ERROR,
                              'UPDATE',
                              @P_LOGIPMAC,
                              @V_CODE_COMPLETE,
                              @V_NAME_TABLE,
                              @V_SQL,
                              'ERROR',
                              @P_USEYEA_U,
                              @P_USECOD_U,
                              @P_USENAM_U,
                              @P_USELASNAM_U,
                              @P_MESSAGE_DESCRIPTION = @P_MESSAGE_DESCRIPTION OUTPUT,
                              @P_MESSAGE_TYPE = @P_MESSAGE_TYPE OUTPUT,
                              @P_LOGYEA = @V_CODE_LOG_YEAR OUTPUT,
                              @P_LOGCOD = @V_CODE_LOG OUTPUT
    EXEC SP_UPDATE_DATE_END_SQL  @V_CODE_LOG_YEAR,@V_CODE_LOG,@V_SQL
    SET @P_MESSAGE_DESCRIPTION  = @V_ERROR
    SET @P_MESSAGE_TYPE         = '1'
END CATCH
GO
