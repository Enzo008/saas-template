-- *****************************************************************************************************
-- Description       : Update existing user with menus and permissions (multi-step)
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Update user data and manage menus/permissions assignments
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_UPDATE_USER
@P_USEYEA                   CHAR(4),
@P_USECOD                   CHAR(6),
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
@P_USESTA                   CHAR(1),
@P_MENUS_PERMISOS           TT_USER_MENU_PERMISSION READONLY,
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
            @V_NAME_TABLE          NVARCHAR(300)  = 'TM_USER',
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

    -- Validate user exists
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE USEYEA = ''' + LTRIM(RTRIM(@P_USEYEA)) + ''' AND ' + 
                 ' USECOD = ''' + LTRIM(RTRIM(@P_USECOD)) + ''' AND ' + 
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO = 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'The user you are trying to update does not exist'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    -- Validate no other user exists with same document (excluding current)
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE USENUMDOC = ''' + LTRIM(RTRIM(@P_USENUMDOC)) + ''' AND ' + 
                 ' IDEDOCCOD = ''' + LTRIM(RTRIM(@P_IDEDOCCOD)) + ''' AND ' +
                 ' NOT (USEYEA = ''' + LTRIM(RTRIM(@P_USEYEA)) + ''' AND USECOD = ''' + LTRIM(RTRIM(@P_USECOD)) + ''') AND ' +
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'Another user with the same identity document already exists'
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

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                              @P_USECOD_U,
                              @P_LOCOFFZON = @V_TIME_ZONE_OFFSET OUTPUT,
                              @P_LOCLOC = @V_TIME_ZONE_LOCALE OUTPUT,
                              @P_LOCNAMZON = @V_TIME_ZONE_NAME OUTPUT

    -- ============================================================
    -- 1. UPDATE USER DATA
    -- ============================================================
    SET @V_SQL = ' UPDATE TM_USER SET ' +
                        'IDEDOCCOD = ''' + LTRIM(RTRIM(UPPER(@P_IDEDOCCOD))) + ''',' +
                        'USENUMDOC = ''' + LTRIM(RTRIM(UPPER(@P_USENUMDOC))) + ''',' +
                        'USENAM = ''' + LTRIM(RTRIM(UPPER(@P_USENAM))) + ''',' +
                        'USELAS = ''' + LTRIM(RTRIM(UPPER(@P_USELAS))) + ''',' +
                        'USEBIR = ''' + CONVERT(VARCHAR, @P_USEBIR, 120) + ''',' +
                        'USESEX = ''' + LTRIM(RTRIM(UPPER(@P_USESEX))) + ''',' +
                        'USEEMA = ''' + LTRIM(RTRIM(UPPER(@P_USEEMA))) + ''',' +
                        'POSCOD = ''' + LTRIM(RTRIM(UPPER(@P_POSCOD))) + ''',' +
                        'USEPHO = ''' + LTRIM(RTRIM(@P_USEPHO)) + ''',' +
                        'ROLCOD = ''' + LTRIM(RTRIM(UPPER(@P_ROLCOD))) + ''',' +
                        'LOCYEA = ''' + LTRIM(RTRIM(@P_LOCYEA)) + ''',' +
                        'LOCCOD = ''' + LTRIM(RTRIM(@P_LOCCOD)) + ''',' +
                        'REPYEA = ' + CASE WHEN @P_REPYEA IS NOT NULL THEN '''' + LTRIM(RTRIM(@P_REPYEA)) + '''' ELSE 'NULL' END + ',' +
                        'REPCOD = ' + CASE WHEN @P_REPCOD IS NOT NULL THEN '''' + LTRIM(RTRIM(@P_REPCOD)) + '''' ELSE 'NULL' END + ',' +
                        'USESTA = ''' + LTRIM(RTRIM(UPPER(@P_USESTA))) + ''',' +
                        'USEUPD = ''' + LTRIM(RTRIM(UPPER(@P_USEUPD))) + ''',' +
                        'DATUPD = SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                        'ZONUPD = ''' + LTRIM(RTRIM(UPPER(@V_TIME_ZONE_NAME))) + '''' +
                 ' WHERE USEYEA = ''' + LTRIM(RTRIM(@P_USEYEA)) + ''' AND ' + 
                 ' USECOD = ''' + LTRIM(RTRIM(@P_USECOD)) + ''' AND ' + 
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL

    -- ============================================================
    -- 2. MENU MANAGEMENT: COMPARE INCOMING VS EXISTING
    -- ============================================================
    -- 2.1. DELETE menus that exist in DB but NOT in @P_MENUS_PERMISOS
    UPDATE TV_USER_MENU 
    SET STAREG = 'D',  -- D = DELETE
        USEUPD = @P_USEUPD,
        DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
        ZONUPD = @V_TIME_ZONE_NAME
    WHERE USEYEA = @P_USEYEA 
      AND USECOD = @P_USECOD 
      AND STAREG <> 'D'
      AND NOT EXISTS (
          SELECT 1 FROM @P_MENUS_PERMISOS 
          WHERE MENYEA = TV_USER_MENU.MENYEA 
            AND MENCOD = TV_USER_MENU.MENCOD
      )

    -- ============================================================
    -- 3. PERMISSION MANAGEMENT: DELETE ALL EXISTING FIRST
    -- ============================================================
    UPDATE TV_USER_PERMISSION 
    SET STAREG = 'D',  -- D = DELETE
        USEUPD = @P_USEUPD,
        DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
        ZONUPD = @V_TIME_ZONE_NAME
    WHERE USEYEA = @P_USEYEA 
      AND USECOD = @P_USECOD 
      AND STAREG <> 'D'

    -- ============================================================
    -- 4. PROCESS MENUS AND PERMISSIONS FROM FRONTEND
    -- ============================================================
    DECLARE menu_permiso_cursor CURSOR FOR
    SELECT MENYEA, MENCOD, PERCOD
    FROM @P_MENUS_PERMISOS

    DECLARE @MENYEA VARCHAR(4), @MENCOD VARCHAR(6), @PERCOD VARCHAR(2), @V_MENU_EXISTE INT

    OPEN menu_permiso_cursor
    FETCH NEXT FROM menu_permiso_cursor INTO @MENYEA, @MENCOD, @PERCOD

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- ============================================================
        -- 4.1. USER-MENU MANAGEMENT
        -- ============================================================
        SET @V_MENU_EXISTE = 0
        SELECT @V_MENU_EXISTE = COUNT(*)
        FROM TV_USER_MENU 
        WHERE USEYEA = @P_USEYEA 
          AND USECOD = @P_USECOD 
          AND MENYEA = @MENYEA 
          AND MENCOD = @MENCOD 
          AND STAREG <> 'D'

        IF @V_MENU_EXISTE = 0
        BEGIN
            -- Check if exists but deleted (reactivate)
            IF EXISTS (SELECT 1 FROM TV_USER_MENU 
                      WHERE USEYEA = @P_USEYEA AND USECOD = @P_USECOD 
                        AND MENYEA = @MENYEA AND MENCOD = @MENCOD AND STAREG = 'D')
            BEGIN
                -- Reactivate existing record
                UPDATE TV_USER_MENU 
                SET STAREG = 'U',  -- U = UPDATE
                    USEUPD = @P_USEUPD,
                    DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
                    ZONUPD = @V_TIME_ZONE_NAME
                WHERE USEYEA = @P_USEYEA AND USECOD = @P_USECOD 
                  AND MENYEA = @MENYEA AND MENCOD = @MENCOD
            END
            ELSE
            BEGIN
                -- Insert new user-menu record
                INSERT INTO TV_USER_MENU (MENYEA, MENCOD, USEYEA, USECOD, USECRE, DATCRE, ZONCRE, USEUPD, DATUPD, ZONUPD, STAREG)
                VALUES (@MENYEA, @MENCOD, @P_USEYEA, @P_USECOD, @P_USEUPD, 
                        SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET), @V_TIME_ZONE_NAME,
                        @P_USEUPD, SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET), @V_TIME_ZONE_NAME, 'U')  -- U = UPDATE
            END
        END

        -- ============================================================
        -- 4.2. INSERT/REACTIVATE SPECIFIC PERMISSION
        -- ============================================================
        IF @PERCOD IS NOT NULL
        BEGIN
            IF EXISTS (SELECT 1 FROM TV_USER_PERMISSION 
                    WHERE USEYEA = @P_USEYEA AND USECOD = @P_USECOD 
                        AND MENYEA = @MENYEA AND MENCOD = @MENCOD AND PERCOD = @PERCOD
                        AND STAREG = 'D')
            BEGIN
                -- Reactivate existing permission
                UPDATE TV_USER_PERMISSION 
                SET STAREG = 'U',  -- U = UPDATE
                    USEUPD = @P_USEUPD,
                    DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
                    ZONUPD = @V_TIME_ZONE_NAME
                WHERE USEYEA = @P_USEYEA AND USECOD = @P_USECOD 
                AND MENYEA = @MENYEA AND MENCOD = @MENCOD AND PERCOD = @PERCOD
            END
            ELSE
            BEGIN
                -- Insert new permission
                INSERT INTO TV_USER_PERMISSION (USEYEA, USECOD, MENYEA, MENCOD, PERCOD, USECRE, DATCRE, ZONCRE, USEUPD, DATUPD, ZONUPD, STAREG)
                VALUES (@P_USEYEA, @P_USECOD, @MENYEA, @MENCOD, @PERCOD, @P_USEUPD,
                        SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET), @V_TIME_ZONE_NAME,
                        @P_USEUPD, SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET), @V_TIME_ZONE_NAME, 'U')  -- U = UPDATE
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
                         '  @V_CADENA = ''USER ['' + USU.USENAM + '' '' + USU.USELAS + ''] WITH '' + CAST(COUNT(MU.MENCOD) AS VARCHAR) + '' MENUS AND '' + CAST(COUNT(PU.PERCOD) AS VARCHAR) + '' ACTIVE PERMISSIONS'' ' +
                         '  FROM TM_USER AS USU ' +
                         '  LEFT JOIN TV_USER_MENU AS MU ON USU.USEYEA = MU.USEYEA AND USU.USECOD = MU.USECOD AND MU.STAREG <> ''D'' ' +
                         '  LEFT JOIN TV_USER_PERMISSION AS PU ON USU.USEYEA = PU.USEYEA AND USU.USECOD = PU.USECOD AND PU.STAREG <> ''D'' ' +
                         '  WHERE USU.USEYEA = ''' + @P_USEYEA + ''' AND USU.USECOD = ''' + @P_USECOD + ''' ' +
                         '  GROUP BY USU.USENAM, USU.USELAS'

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    SET @V_DESCRIPTION_LOG = 'UPDATED ' + @V_CADENA
    SET @V_CODE_COMPLETE = @P_USEYEA + @P_USECOD

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

    SET @P_MESSAGE_DESCRIPTION  = 'User updated successfully.'
    SET @P_MESSAGE_TYPE         = '3'

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
