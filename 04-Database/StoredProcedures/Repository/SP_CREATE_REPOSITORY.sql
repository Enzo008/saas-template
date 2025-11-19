-- *****************************************************************************************************
-- Description       : Create new repository
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Insert a new repository
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_CREATE_REPOSITORY
@P_REPNAM               VARCHAR(100),
@P_LOCYEA               CHAR(4),
@P_LOCCOD               CHAR(6),
@P_USECRE               VARCHAR(50),
@P_LOGIPMAC             VARCHAR(15),
@P_USEYEA_U             CHAR(4),
@P_USECOD_U             CHAR(6),
@P_USENAM_U             VARCHAR(30),
@P_USELASNAM_U          VARCHAR(30),
@P_REPYEA_OUT           CHAR(4)         OUTPUT,
@P_REPCOD_OUT           CHAR(6)         OUTPUT,
@P_MESSAGE_DESCRIPTION  NVARCHAR(MAX)   OUTPUT,
@P_MESSAGE_TYPE         CHAR(1)         OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_SQL                   NVARCHAR(MAX)  = '',
            @V_SQL_MENSAJE           NVARCHAR(MAX)  = '',
            @V_NAME_TABLE            NVARCHAR(300)  = 'TM_REPOSITORY',
            @V_DEFAULT               NVARCHAR(02)   = '01',
            @V_YEAR                  CHAR(4)        = '',
            @V_CODE_GENERATED        NVARCHAR(300)  = '',
            @V_CODE_LOG_YEAR         CHAR(4)        = '',
            @V_CODE_LOG              CHAR(10)       = '',
            @V_CANTIDAD_REGISTRO     INT,
            @V_DESCRIPTION_LOG       NVARCHAR(300)  = '',
            @V_ERROR                 NVARCHAR(MAX)  = '',
            @V_STRING                NVARCHAR(MAX)  = '',
            @V_CODE_COMPLETE         NVARCHAR(20)   = '',
            @V_TIME_ZONE_OFFSET      NVARCHAR(6)    = '',
            @V_TIME_ZONE_NAME        NVARCHAR(50)   = '',
            @V_TIME_ZONE_LOCALE      NVARCHAR(50)   = ''

    -- Validate repository doesn't already exist
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE REPNAM = ''' + LTRIM(RTRIM(UPPER(@P_REPNAM))) + ''' AND ' + 
                 ' STAREG <> ''D'' ';

    EXECUTE sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
        SET @P_MESSAGE_DESCRIPTION  = 'The repository already exists in the database'
        SET @P_MESSAGE_TYPE         = '2'
        RETURN
    END

    -- Validate location exists
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM TM_LOCATION ' +
                 ' WHERE LOCYEA = ''' + @P_LOCYEA + ''' AND LOCCOD = ''' + @P_LOCCOD + ''' AND STAREG <> ''D'' ';

    EXECUTE sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO = 0
    BEGIN
        SET @P_MESSAGE_DESCRIPTION  = 'The specified location does not exist'
        SET @P_MESSAGE_TYPE         = '2'
        RETURN
    END

    -- Generate code
    EXEC SP_GENERATE_CODE_WITH_YEAR @V_DEFAULT, 'TM_REPOSITORY', 'REPCOD', 'REPYEA', @V_CODE = @V_CODE_GENERATED OUTPUT
    SET @P_REPYEA_OUT = CAST(YEAR(GETDATE()) AS CHAR(4))
    SET @P_REPCOD_OUT = @V_CODE_GENERATED
    
    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                             @P_USECOD_U,
                             @P_LOCOFFZON = @V_TIME_ZONE_OFFSET OUTPUT,
                             @P_LOCLOC = @V_TIME_ZONE_LOCALE OUTPUT,
                             @P_LOCNAMZON = @V_TIME_ZONE_NAME OUTPUT

    -- Insert repository
    SET @V_SQL = ' INSERT INTO TM_REPOSITORY(' +
                        'REPYEA, ' +
                        'REPCOD, ' +
                        'LOCYEA, ' +
                        'LOCCOD, ' +
                        'REPNAM, ' +
                        'USECRE, ' +
                        'DATCRE, ' +
                        'USEUPD, ' +
                        'DATUPD, ' +
                        'STAREG' +
                 ') VALUES(' +
                        '''' + @V_YEAR + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@V_CODE_GENERATED))) + ''',' +
                        '''' + @P_LOCYEA + ''',' +
                        '''' + @P_LOCCOD + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_REPNAM))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USECRE))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USECRE))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                        '''C'')'  -- C = CREATE

    EXECUTE sp_executesql @V_SQL

    -- Generate success message
    SET @V_SQL_MENSAJE = '  SELECT ' + 
                         '  @V_STRING = ''REPOSITORY ['' + REP.REPNAM + '']'' ' +
                         '  FROM TM_REPOSITORY AS REP ' +
                         '  WHERE REP.REPYEA = ''' + @V_YEAR + ''' AND REP.REPCOD = ''' + @V_CODE_GENERATED + ''''

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_STRING NVARCHAR(MAX) OUTPUT', @V_STRING OUTPUT

    SET @V_DESCRIPTION_LOG = 'CREATED ' + @V_STRING
    SET @V_CODE_COMPLETE = @V_YEAR + '-' + @V_CODE_GENERATED

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

    SET @P_MESSAGE_DESCRIPTION  = 'Repository created successfully'
    SET @P_MESSAGE_TYPE         = '3'
    
    EXEC SP_UPDATE_DATE_END_SQL  @V_CODE_LOG_YEAR,@V_CODE_LOG,@V_SQL

END TRY
BEGIN CATCH
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
