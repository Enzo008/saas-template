-- *****************************************************************************************************
-- Description       : Create new location
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Insert a new location (country, state, city, etc.)
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_CREATE_LOCATION
@P_LOCNAM               VARCHAR(100),
@P_LOCTYP               VARCHAR(50),
@P_LOCYEAPAR            CHAR(4) = NULL,
@P_LOCCODPAR            CHAR(6) = NULL,
@P_LOCLAT               VARCHAR(20) = NULL,
@P_LOCLON               VARCHAR(20) = NULL,
@P_LOCADD               VARCHAR(200) = NULL,
@P_LOCSTA               CHAR(1) = 'A',
@P_USECRE               VARCHAR(50),
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
            @V_NAME_TABLE          NVARCHAR(300)  = 'TM_LOCATION',
            @V_DEFAULT               NVARCHAR(02)   = '01',
            @V_YEAR                  CHAR(4)        = '',
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
            @V_TIME_ZONE_LOCALE   NVARCHAR(50)   = ''

    -- Validate location doesn't already exist
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE LOCNAM = ''' + LTRIM(RTRIM(UPPER(@P_LOCNAM))) + ''' AND ' +
                 ' LOCTYP = ''' + LTRIM(RTRIM(UPPER(@P_LOCTYP))) + ''' AND ' +
                 ' STAREG <> ''D'' ';

    EXECUTE sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
        SET @P_MESSAGE_DESCRIPTION  = 'The location already exists in the database'
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

    -- Get current year
    SET @V_YEAR = CAST(YEAR(GETDATE()) AS CHAR(4))

    -- Generate code
    EXEC SP_GENERAR_CODIGO @V_DEFAULT, 'TM_LOCATION', 'LOCCOD', @V_CODE = @V_CODE_GENERATED OUTPUT
    
    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE
        @P_USEYEA_U,
        @P_USECOD_U,
        @P_LOCOFFZON = @V_TIME_ZONE_OFFSET OUTPUT,
        @P_LOCLOC = @V_TIME_ZONE_LOCALE OUTPUT,
        @P_LOCNAMZON = @V_TIME_ZONE_NAME OUTPUT

    -- Insert location
    SET @V_SQL = ' INSERT INTO TM_LOCATION(' +
                        'LOCYEA, ' +
                        'LOCCOD, ' +
                        'LOCNAM, ' +
                        'LOCTYP, ' +
                        'LOCYEAPAR, ' +
                        'LOCCODPAR, ' +
                        'LOCLAT, ' +
                        'LOCLON, ' +
                        'LOCADD, ' +
                        'LOCSTA, ' +
                        'LOCOFFZON, ' +
                        'LOCLOC, ' +
                        'LOCNOMZON, ' +
                        'USECRE, ' +
                        'DATCRE, ' +
                        'ZONCRE, ' +
                        'USEUPD, ' +
                        'DATUPD, ' +
                        'ZONUPD, ' +
                        'STAREG' +
                 ') VALUES(' +
                        '''' + @V_YEAR + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@V_CODE_GENERATED))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_LOCNAM))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_LOCTYP))) + ''',' +
                        CASE WHEN @P_LOCYEAPAR IS NULL THEN 'NULL' ELSE '''' + @P_LOCYEAPAR + '''' END + ',' +
                        CASE WHEN @P_LOCCODPAR IS NULL THEN 'NULL' ELSE '''' + @P_LOCCODPAR + '''' END + ',' +
                        CASE WHEN @P_LOCLAT IS NULL THEN 'NULL' ELSE '''' + @P_LOCLAT + '''' END + ',' +
                        CASE WHEN @P_LOCLON IS NULL THEN 'NULL' ELSE '''' + @P_LOCLON + '''' END + ',' +
                        CASE WHEN @P_LOCADD IS NULL THEN 'NULL' ELSE '''' + LTRIM(RTRIM(UPPER(@P_LOCADD))) + '''' END + ',' +
                        '''' + @P_LOCSTA + ''',' +
                        '''' + @V_TIME_ZONE_OFFSET + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@V_TIME_ZONE_LOCALE))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@V_TIME_ZONE_NAME))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USECRE))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@V_TIME_ZONE_NAME))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USECRE))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@V_TIME_ZONE_NAME))) + ''',' +
                        '''C'')'  -- C = CREATE

    EXECUTE sp_executesql @V_SQL

    -- Generate success message
    SET @V_SQL_MENSAJE = '  SELECT ' + 
                         '  @V_CADENA = ''LOCATION ['' + LOC.LOCNAM + '']'' ' +
                         '  FROM TM_LOCATION AS LOC ' +
                         '  WHERE LOC.LOCYEA = ''' + @V_YEAR + ''' AND LOC.LOCCOD = ''' + @V_CODE_GENERATED + ''''

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    SET @V_DESCRIPTION_LOG = 'CREATED ' + @V_CADENA
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

    SET @P_MESSAGE_DESCRIPTION  = 'Location created successfully'
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
