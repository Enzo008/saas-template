-- *****************************************************************************************************
-- Description       : Update existing repository
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Update repository information
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_UPDATE_REPOSITORY
@P_REPYEA               CHAR(4),
@P_REPCOD               CHAR(6),
@P_REPNAM               VARCHAR(100),
@P_LOCYEA               CHAR(4),
@P_LOCCOD               CHAR(6),
@P_USEUPD               VARCHAR(50),
@P_LOGIPMAC             VARCHAR(15),
@P_USEYEA_U             CHAR(4),
@P_USECOD_U             CHAR(6),
@P_USENAM_U             VARCHAR(30),
@P_USELASNAM_U             VARCHAR(30),
@P_MESSAGE_DESCRIPTION  NVARCHAR(MAX)   OUTPUT,
@P_MESSAGE_TYPE         CHAR(1)         OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_SQL                   NVARCHAR(MAX)  = '',
            @V_SQL_MENSAJE           NVARCHAR(MAX)  = '',
            @V_SQL_MODIFICADO        NVARCHAR(MAX)  = '',
            @V_NAME_TABLE          NVARCHAR(300)  = 'TM_REPOSITORY',
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
            @V_TIME_ZONE_LOCALE   NVARCHAR(50)   = ''

    -- Validate repository exists
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE REPYEA = ''' + LTRIM(RTRIM(@P_REPYEA)) + ''' AND ' +
                 ' REPCOD = ''' + LTRIM(RTRIM(@P_REPCOD)) + ''' AND ' +
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO = 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'The repository you are trying to update does not exist'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    -- Validate no other repository exists with same name
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE REPNAM = ''' + LTRIM(RTRIM(@P_REPNAM)) + ''' AND ' +
                 ' (REPYEA <> ''' + LTRIM(RTRIM(@P_REPYEA)) + ''' OR REPCOD <> ''' + LTRIM(RTRIM(@P_REPCOD)) + ''') AND ' +
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'Another repository with the same name already exists'
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

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                             @P_USECOD_U,
                             @P_LOCOFFZON = @V_TIME_ZONE_OFFSET OUTPUT,
                             @P_LOCLOC = @V_TIME_ZONE_LOCALE OUTPUT,
                             @P_LOCNAMZON = @V_TIME_ZONE_NAME OUTPUT

    -- Update repository
    SET @V_SQL = ' UPDATE ' + @V_NAME_TABLE + 
                 ' SET ' +
                 ' REPNAM = ''' + LTRIM(RTRIM(UPPER(@P_REPNAM))) + ''',' + 
                 ' LOCYEA = ''' + @P_LOCYEA + ''',' +
                 ' LOCCOD = ''' + @P_LOCCOD + ''',' +
                 ' USEUPD = ''' + LTRIM(RTRIM(UPPER(@P_USEUPD))) + ''',' +
                 ' DATUPD = SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                 ' STAREG = ''U''' +  -- U = UPDATE
                 ' WHERE REPYEA = ''' + LTRIM(RTRIM(UPPER(@P_REPYEA))) + ''' AND ' +
                 ' REPCOD = ''' + LTRIM(RTRIM(UPPER(@P_REPCOD))) + ''''

    EXEC sp_executesql @V_SQL

    -- Get updated repository name for log
    SET @V_SQL_MODIFICADO = '  SELECT ' + 
                            '  @V_CADENA_MODIFICADO = ''REPOSITORY ['' + REP.REPNAM + '']'' ' +
                            '  FROM TM_REPOSITORY AS REP ' +
                            '  WHERE REP.REPYEA = ''' + LTRIM(RTRIM(UPPER(@P_REPYEA))) + ''' AND ' +
                            '  REP.REPCOD = ''' + LTRIM(RTRIM(UPPER(@P_REPCOD))) + ''' '

    EXEC sp_executesql @V_SQL_MODIFICADO, N'@V_CADENA_MODIFICADO NVARCHAR(MAX) OUTPUT', @V_CADENA_MODIFICADO OUTPUT

    SET @V_DESCRIPTION_LOG = 'UPDATED ' + @V_CADENA_MODIFICADO
    SET @V_CODE_COMPLETE = @P_REPYEA + '-' + @P_REPCOD

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

    SET @P_MESSAGE_DESCRIPTION  = 'Repository updated successfully'
    SET @P_MESSAGE_TYPE         = '3'

    EXEC SP_UPDATE_DATE_END_SQL  @V_CODE_LOG_YEAR,@V_CODE_LOG,@V_SQL

END TRY
BEGIN CATCH
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
