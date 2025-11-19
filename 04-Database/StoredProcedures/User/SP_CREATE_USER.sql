-- *****************************************************************************************************
-- Description       : Create new user with menus and permissions (multi-step)
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Insert user with assigned menus and permissions in a single transaction
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_CREATE_USER
@P_USEYEA_OUT               CHAR(4) OUTPUT,
@P_USECOD_OUT               CHAR(6) OUTPUT,
@P_IDEDOCCOD                CHAR(2),
@P_USENUMDOC                VARCHAR(20),
@P_USENAM                   VARCHAR(50),
@P_USELAS                   VARCHAR(50),
@P_USEBIR                   DATE,
@P_USESEX                   CHAR(1),
@P_USEEMA                   VARCHAR(100),
@P_POSCOD                   CHAR(2),
@P_USEPHO                   VARCHAR(20),
@P_ROLCOD                   CHAR(2),
@P_LOCYEA                   CHAR(4),
@P_LOCCOD                   CHAR(6),
@P_REPYEA                   CHAR(4),
@P_REPCOD                   CHAR(6),
@P_USEPAS                   VARCHAR(255),
@P_USESTA                   CHAR(1),
@P_MENUS_PERMISOS           TT_USER_MENU_PERMISSION READONLY,
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
            @V_NAME_TABLE          NVARCHAR(300)  = 'TM_USER',
            @V_DEFAULT               NVARCHAR(04)   = '000001',
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
            @V_TIME_ZONE_LOCALE   NVARCHAR(50)   = '',
            @V_MENU_EXISTE           INT = 0

    -- Validate user doesn't already exist
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE USENUMDOC = ''' + LTRIM(RTRIM(@P_USENUMDOC)) + ''' AND ' + 
                 ' IDEDOCCOD = ''' + LTRIM(RTRIM(@P_IDEDOCCOD)) + ''' AND ' + 
                 ' STAREG <> ''E'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'A user with the same identity document already exists'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    -- Validate menus and permissions were sent
    IF NOT EXISTS (SELECT 1 FROM @P_MENUS_PERMISOS)
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'At least one menu with permissions must be assigned to the user'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    BEGIN TRANSACTION

    -- Generate code for user
    EXEC SP_GENERATE_CODE_WITH_YEAR @V_DEFAULT, 'TM_USER', 'USECOD','USEYEA', @V_CODE = @V_CODE_GENERATED OUTPUT
    SET @P_USEYEA_OUT = CAST(YEAR(SYSDATETIME()) AS CHAR(4))
    SET @P_USECOD_OUT = @V_CODE_GENERATED

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                              @P_USECOD_U,
                              @P_LOCOFFZON = @V_TIME_ZONE_OFFSET OUTPUT,
                              @P_LOCLOC = @V_TIME_ZONE_LOCALE OUTPUT,
                              @P_LOCNAMZON = @V_TIME_ZONE_NAME OUTPUT

    -- ============================================================
    -- 1. INSERT USER
    -- ============================================================
    SET @V_SQL = ' INSERT INTO TM_USER (' +
                        'USEYEA, USECOD, IDEDOCCOD, USENUMDOC, USENAM, USELAS, USEBIR, USESEX, USEEMA,'+ 
                        'POSCOD, USEPHO, ROLCOD, LOCYEA, LOCCOD, REPYEA, REPCOD, USEPAS, USESTA,'+
                        'USECRE, DATCRE, ZONCRE, USEUPD, DATUPD, ZONUPD, STAREG' +
                  ' ) VALUES ( ' + 
                        ' YEAR(SYSDATETIME()),' + 
                        '''' + LTRIM(RTRIM(UPPER(@V_CODE_GENERATED))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_IDEDOCCOD))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USENUMDOC))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USENAM))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USELAS))) + ''',' +
                        '''' + CONVERT(VARCHAR, @P_USEBIR, 120) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USESEX))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USEEMA))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_POSCOD))) + ''',' +
                        '''' + LTRIM(RTRIM(@P_USEPHO)) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_ROLCOD))) + ''',' +
                        '''' + LTRIM(RTRIM(@P_LOCYEA)) + ''',' +
                        '''' + LTRIM(RTRIM(@P_LOCCOD)) + ''',' +
                        CASE WHEN @P_REPYEA IS NOT NULL THEN '''' + LTRIM(RTRIM(@P_REPYEA)) + '''' ELSE 'NULL' END + ',' +
                        CASE WHEN @P_REPCOD IS NOT NULL THEN '''' + LTRIM(RTRIM(@P_REPCOD)) + '''' ELSE 'NULL' END + ',' +
                        '''' + LTRIM(RTRIM(@P_USEPAS)) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USESTA))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USECRE))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@V_TIME_ZONE_NAME))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USECRE))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@V_TIME_ZONE_NAME))) + ''',' +
                        '''C'')'  -- C = CREATE

    EXEC sp_executesql @V_SQL

    -- ============================================================
    -- 2. INSERT MENU AND PERMISSION ASSIGNMENTS
    -- ============================================================
    DECLARE menu_permiso_cursor CURSOR FOR
    SELECT MENYEA, MENCOD, PERCOD
    FROM @P_MENUS_PERMISOS

    DECLARE @MENYEA VARCHAR(4), @MENCOD VARCHAR(6), @PERCOD VARCHAR(2)

    OPEN menu_permiso_cursor
    FETCH NEXT FROM menu_permiso_cursor INTO @MENYEA, @MENCOD, @PERCOD

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- ============================================================
        -- 2.1. USER-MENU MANAGEMENT
        -- ============================================================
        SET @V_MENU_EXISTE = 0
        SELECT @V_MENU_EXISTE = COUNT(*)
        FROM TV_USER_MENU 
        WHERE USEYEA = @P_USEYEA_OUT 
          AND USECOD = @P_USECOD_OUT 
          AND MENYEA = @MENYEA 
          AND MENCOD = @MENCOD 
          AND STAREG <> 'D'

        IF @V_MENU_EXISTE = 0
        BEGIN
            -- Check if exists but deleted (reactivate)
            IF EXISTS (SELECT 1 FROM TV_USER_MENU 
                      WHERE USEYEA = @P_USEYEA_OUT AND USECOD = @P_USECOD_OUT 
                        AND MENYEA = @MENYEA AND MENCOD = @MENCOD AND STAREG = 'D')
            BEGIN
                -- Reactivate existing record
                UPDATE TV_USER_MENU 
                SET STAREG = 'C',  -- C = CREATE
                    USEUPD = @P_USECRE,
                    DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
                    ZONUPD = @V_TIME_ZONE_NAME
                WHERE USEYEA = @P_USEYEA_OUT AND USECOD = @P_USECOD_OUT 
                  AND MENYEA = @MENYEA AND MENCOD = @MENCOD
            END
            ELSE
            BEGIN
                -- Insert new user-menu record
                INSERT INTO TV_USER_MENU (MENYEA, MENCOD, USEYEA, USECOD, USECRE, DATCRE, ZONCRE, USEUPD, DATUPD, ZONUPD, STAREG)
                VALUES (@MENYEA, @MENCOD, @P_USEYEA_OUT, @P_USECOD_OUT, @P_USECRE, 
                        SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET), @V_TIME_ZONE_NAME,
                        @P_USECRE, SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET), @V_TIME_ZONE_NAME, 'C')  -- C = CREATE
            END
        END

        -- ============================================================
        -- 2.2. INSERT SPECIFIC PERMISSION
        -- ============================================================
        IF @PERCOD IS NOT NULL
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM TV_USER_PERMISSION 
                        WHERE USEYEA = @P_USEYEA_OUT AND USECOD = @P_USECOD_OUT 
                            AND MENYEA = @MENYEA AND MENCOD = @MENCOD AND PERCOD = @PERCOD
                            AND STAREG <> 'D')
            BEGIN
                -- Check if exists but deleted (reactivate)
                IF EXISTS (SELECT 1 FROM TV_USER_PERMISSION 
                        WHERE USEYEA = @P_USEYEA_OUT AND USECOD = @P_USECOD_OUT 
                            AND MENYEA = @MENYEA AND MENCOD = @MENCOD AND PERCOD = @PERCOD
                            AND STAREG = 'D')
                BEGIN
                    -- Reactivate existing permission
                    UPDATE TV_USER_PERMISSION 
                    SET STAREG = 'C',  -- C = CREATE
                        USEUPD = @P_USECRE,
                        DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
                        ZONUPD = @V_TIME_ZONE_NAME
                    WHERE USEYEA = @P_USEYEA_OUT AND USECOD = @P_USECOD_OUT 
                    AND MENYEA = @MENYEA AND MENCOD = @MENCOD AND PERCOD = @PERCOD
                END
                ELSE
                BEGIN
                    -- Insert new permission
                    INSERT INTO TV_USER_PERMISSION (USEYEA, USECOD, MENYEA, MENCOD, PERCOD, USECRE, DATCRE, ZONCRE, USEUPD, DATUPD, ZONUPD, STAREG)
                    VALUES (@P_USEYEA_OUT, @P_USECOD_OUT, @MENYEA, @MENCOD, @PERCOD, @P_USECRE,
                            SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET), @V_TIME_ZONE_NAME,
                            @P_USECRE, SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET), @V_TIME_ZONE_NAME, 'C')  -- C = CREATE
                END
            END
        END

        FETCH NEXT FROM menu_permiso_cursor INTO @MENYEA, @MENCOD, @PERCOD
    END

    CLOSE menu_permiso_cursor
    DEALLOCATE menu_permiso_cursor

    COMMIT TRANSACTION

    -- ============================================================
    -- GENERATE SUCCESS MESSAGE
    -- ============================================================
    SET @V_SQL_MENSAJE = '  SELECT ' + 
                         '  @V_CADENA = ''USER ['' + USU.USENAM + '' '' + USU.USELAS + '']'' ' +
                         '  FROM TM_USER AS USU ' +
                         '  WHERE USU.USEYEA = ''' + @P_USEYEA_OUT + ''' AND USU.USECOD = ''' + @P_USECOD_OUT + ''' '

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    SET @V_DESCRIPTION_LOG = 'CREATED ' + @V_CADENA
    SET @V_CODE_COMPLETE = @P_USEYEA_OUT + @P_USECOD_OUT

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

    SET @P_MESSAGE_DESCRIPTION  = 'User created successfully.'
    SET @P_MESSAGE_TYPE         = '3'

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
