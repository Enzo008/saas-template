-- *****************************************************************************************************
-- Description       : Update existing location
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Update location information
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_UPDATE_LOCATION
@P_LOCYEA               CHAR(4),
@P_LOCCOD               CHAR(6),
@P_LOCNAM               VARCHAR(100),
@P_LOCTYP               VARCHAR(50),
@P_LOCYEAPAR            CHAR(4) = NULL,
@P_LOCCODPAR            CHAR(6) = NULL,
@P_LOCLAT               VARCHAR(20) = NULL,
@P_LOCLON               VARCHAR(20) = NULL,
@P_LOCADD               VARCHAR(200) = NULL,
@P_LOCSTA               CHAR(1),
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
            @V_NAME_TABLE          NVARCHAR(300)  = 'TM_LOCATION',
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

    -- Validate location exists
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE LOCYEA = ''' + LTRIM(RTRIM(@P_LOCYEA)) + ''' AND ' +
                 ' LOCCOD = ''' + LTRIM(RTRIM(@P_LOCCOD)) + ''' AND ' +
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO = 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'The location you are trying to update does not exist'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    -- Validate no other location exists with same name and type
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE LOCNAM = ''' + LTRIM(RTRIM(@P_LOCNAM)) + ''' AND ' +
                 ' LOCTYP = ''' + LTRIM(RTRIM(@P_LOCTYP)) + ''' AND ' +
                 ' (LOCYEA <> ''' + LTRIM(RTRIM(@P_LOCYEA)) + ''' OR LOCCOD <> ''' + LTRIM(RTRIM(@P_LOCCOD)) + ''') AND ' +
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'Another location with the same name and type already exists'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    -- Validate parent location exists if specified
    IF @P_LOCYEAPAR IS NOT NULL AND @P_LOCCODPAR IS NOT NULL
    BEGIN
        SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                     ' FROM TM_LOCATION ' +
                     ' WHERE LOCYEA = ''' + @P_LOCYEAPAR + ''' AND ' +
                     ' LOCCOD = ''' + @P_LOCCODPAR + ''' AND ' +
                     ' STAREG <> ''D'' ';

        EXECUTE sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

        IF @V_CANTIDAD_REGISTRO = 0
        BEGIN
            SET @P_MESSAGE_DESCRIPTION  = 'The parent location does not exist'
            SET @P_MESSAGE_TYPE         = '2'
            RETURN
        END
    END

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                             @P_USECOD_U,
                             @P_LOCOFFZON = @V_TIME_ZONE_OFFSET OUTPUT,
                             @P_LOCLOC = @V_TIME_ZONE_LOCALE OUTPUT,
                             @P_LOCNAMZON = @V_TIME_ZONE_NAME OUTPUT

    -- Update location
    SET @V_SQL = ' UPDATE ' + @V_NAME_TABLE + 
                 ' SET ' +
                 ' LOCNAM = ''' + LTRIM(RTRIM(UPPER(@P_LOCNAM))) + ''',' + 
                 ' LOCTYP = ''' + LTRIM(RTRIM(UPPER(@P_LOCTYP))) + ''',' +
                 ' LOCYEAPAR = ' + CASE WHEN @P_LOCYEAPAR IS NULL THEN 'NULL' ELSE '''' + @P_LOCYEAPAR + '''' END + ',' +
                 ' LOCCODPAR = ' + CASE WHEN @P_LOCCODPAR IS NULL THEN 'NULL' ELSE '''' + @P_LOCCODPAR + '''' END + ',' +
                 ' LOCLAT = ' + CASE WHEN @P_LOCLAT IS NULL THEN 'NULL' ELSE '''' + @P_LOCLAT + '''' END + ',' +
                 ' LOCLON = ' + CASE WHEN @P_LOCLON IS NULL THEN 'NULL' ELSE '''' + @P_LOCLON + '''' END + ',' +
                 ' LOCADD = ' + CASE WHEN @P_LOCADD IS NULL THEN 'NULL' ELSE '''' + LTRIM(RTRIM(UPPER(@P_LOCADD))) + '''' END + ',' +
                 ' LOCSTA = ''' + @P_LOCSTA + ''',' +
                 ' USEUPD = ''' + LTRIM(RTRIM(UPPER(@P_USEUPD))) + ''',' +
                 ' DATUPD = SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                 ' ZONUPD = ''' + LTRIM(RTRIM(UPPER(@V_TIME_ZONE_NAME))) + ''',' +
                 ' STAREG = ''U''' +  -- U = UPDATE
                 ' WHERE LOCYEA = ''' + LTRIM(RTRIM(UPPER(@P_LOCYEA))) + ''' AND ' +
                 ' LOCCOD = ''' + LTRIM(RTRIM(UPPER(@P_LOCCOD))) + ''''

    EXEC sp_executesql @V_SQL

    -- Get updated location name for log
    SET @V_SQL_MODIFICADO = '  SELECT ' + 
                            '  @V_CADENA_MODIFICADO = ''LOCATION ['' + LOC.LOCNAM + '']'' ' +
                            '  FROM TM_LOCATION AS LOC ' +
                            '  WHERE LOC.LOCYEA = ''' + LTRIM(RTRIM(UPPER(@P_LOCYEA))) + ''' AND ' +
                            '  LOC.LOCCOD = ''' + LTRIM(RTRIM(UPPER(@P_LOCCOD))) + ''' '

    EXEC sp_executesql @V_SQL_MODIFICADO, N'@V_CADENA_MODIFICADO NVARCHAR(MAX) OUTPUT', @V_CADENA_MODIFICADO OUTPUT

    SET @V_DESCRIPTION_LOG = 'UPDATED ' + @V_CADENA_MODIFICADO
    SET @V_CODE_COMPLETE = @P_LOCYEA + '-' + @P_LOCCOD

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

    SET @P_MESSAGE_DESCRIPTION  = 'Location updated successfully'
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
