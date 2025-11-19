-- *****************************************************************************************************
-- Description       : Create new identity document
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Insert new identity document type
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_CREATE_IDENTITY_DOCUMENT
@P_IDEDOCNAM                VARCHAR(50),
@P_IDEDOCABR                VARCHAR(50),
@P_USECRE                   VARCHAR(50),
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
            @V_NAME_TABLE          NVARCHAR(300)  = 'TB_IDENTITY_DOCUMENT',
            @V_DEFAULT               NVARCHAR(02)   = '01',
            @V_CODE_GENERATED       NVARCHAR(300)  = '',
            @V_CODE_LOG_YEAR       CHAR(4)        = '',
            @V_CODE_LOG            CHAR(10)       = '',
            @V_CANTIDAD_REGISTRO     INT,
            @V_DESCRIPTION_LOG       NVARCHAR(300)  = '',
            @V_ERROR                 NVARCHAR(MAX)  = '',
            @V_CADENA                NVARCHAR(MAX)  = '',
            @V_CODE_COMPLETE       NVARCHAR(20)   = '',
            @V_TIME_ZONE_OFFSET   NVARCHAR(6)    = '',
            @V_TIME_ZONE_NAME   NVARCHAR(50)   = '',
            @V_TIME_ZONE_LOCALE   NVARCHAR(5)    = ''

    -- Validate identity document doesn't exist
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE IDEDOCNAM = ''' + LTRIM(RTRIM(@P_IDEDOCNAM)) + ''' AND ' + 
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'An identity document with the same name already exists'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    BEGIN TRANSACTION

    -- Generate code
    EXEC SP_GENERAR_CODIGO @V_DEFAULT, @V_NAME_TABLE, 'IDEDOCCOD', @V_CODE = @V_CODE_GENERATED OUTPUT

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
        @P_USECOD_U,
        @P_LOCOFFZON = @V_TIME_ZONE_OFFSET OUTPUT,
        @P_LOCLOC = @V_TIME_ZONE_LOCALE OUTPUT,
        @P_LOCNAMZON = @V_TIME_ZONE_NAME OUTPUT

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
                        '''' + LTRIM(RTRIM(UPPER(@V_CODE_GENERATED))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_IDEDOCNAM))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_IDEDOCABR))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USECRE))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USECRE))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                        '''C'')'  -- C = CREATE

    EXECUTE sp_executesql @V_SQL

    -- Generate success message
    SET @V_SQL_MENSAJE = '  SELECT ' + 
                         '  @V_CADENA = ''IDENTITY DOCUMENT ['' + IDEDOC.IDEDOCNAM + '']'' ' +
                         '  FROM TB_IDENTITY_DOCUMENT AS IDEDOC ' +
                         '  WHERE IDEDOC.IDEDOCCOD = ''' + @V_CODE_GENERATED + ''''

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    SET @V_DESCRIPTION_LOG = 'CREATED ' + @V_CADENA
    SET @V_CODE_COMPLETE = @V_CODE_GENERATED

    -- Register log
    EXEC SP_REGISTER_LOG  @V_DESCRIPTION_LOG,
                           'INSERT',
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

    SET @P_MESSAGE_DESCRIPTION  = 'Identity document created successfully.'
    SET @P_MESSAGE_TYPE         = '3'

    COMMIT TRANSACTION

    EXEC SP_UPDATE_DATE_END_SQL  @V_CODE_LOG_YEAR,@V_CODE_LOG,@V_SQL

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTER_LOG  @V_ERROR,
                              'INSERT',
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
