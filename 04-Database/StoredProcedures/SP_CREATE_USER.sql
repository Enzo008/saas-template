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
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TM_USER',
            @V_DEFECTO               NVARCHAR(04)   = '000001',
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
            @V_ZONA_HORARIA_LOCALE   NVARCHAR(50)   = '',
            @V_MENU_EXISTE           INT = 0

    -- Validate user doesn't already exist
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE USENUMDOC = ''' + LTRIM(RTRIM(@P_USENUMDOC)) + ''' AND ' + 
                 ' IDEDOCCOD = ''' + LTRIM(RTRIM(@P_IDEDOCCOD)) + ''' AND ' + 
                 ' STAREG <> ''E'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'A user with the same identity document already exists'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    -- Validate menus and permissions were sent
    IF NOT EXISTS (SELECT 1 FROM @P_MENUS_PERMISOS)
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'At least one menu with permissions must be assigned to the user'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    BEGIN TRANSACTION

    -- Generate code for user
    EXEC SP_GENERAR_CODIGO_CON_ANIO @V_DEFECTO, 'TM_USER', 'USECOD','USEYEA', @V_CODIGO = @V_CODIGO_GENERADO OUTPUT
    SET @P_USEYEA_OUT = CAST(YEAR(SYSDATETIME()) AS CHAR(4))
    SET @P_USECOD_OUT = @V_CODIGO_GENERADO

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                              @P_USECOD_U,
                              @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
                              @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
                              @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- ============================================================
    -- 1. INSERT USER
    -- ============================================================
    SET @V_SQL = ' INSERT INTO TM_USER (' +
                        'USEYEA, USECOD, IDEDOCCOD, USENUMDOC, USENAM, USELAS, USEBIR, USESEX, USEEMA,'+ 
                        'POSCOD, USEPHO, ROLCOD, LOCYEA, LOCCOD, REPYEA, REPCOD, USEPAS, USESTA,'+
                        'USECRE, DATCRE, ZONCRE, USEUPD, DATUPD, ZONUPD, STAREG' +
                  ' ) VALUES ( ' + 
                        ' YEAR(SYSDATETIME()),' + 
                        '''' + LTRIM(RTRIM(UPPER(@V_CODIGO_GENERADO))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_IDEDOCCOD))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USENUMDOC))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USENAM))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USELAS))) + ''',' +
                        '''' + CONVERT(VARCHAR, @P_USEBIR, 120) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USESEX))) + ''',' +
                        '''' + LTRIM(RTRIM(@P_USEEMA)) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_POSCOD))) + ''',' +
                        '''' + LTRIM(RTRIM(@P_USEPHO)) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_ROLCOD))) + ''',' +
                        '''' + LTRIM(RTRIM(@P_LOCYEA)) + ''',' +
                        '''' + LTRIM(RTRIM(@P_LOCCOD)) + ''',' +
                        CASE WHEN @P_REPYEA IS NOT NULL THEN '''' + LTRIM(RTRIM(@P_REPYEA)) + '''' ELSE 'NULL' END + ',' +
                        CASE WHEN @P_REPCOD IS NOT NULL THEN '''' + LTRIM(RTRIM(@P_REPCOD)) + '''' ELSE 'NULL' END + ',' +
                        '''' + LTRIM(RTRIM(@P_USEPAS)) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USESTA))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USEING))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USEING))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''',' +
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
                    USEUPD = @P_USEING,
                    DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
                    ZONUPD = @V_ZONA_HORARIA_NOMBRE
                WHERE USEYEA = @P_USEYEA_OUT AND USECOD = @P_USECOD_OUT 
                  AND MENYEA = @MENYEA AND MENCOD = @MENCOD
            END
            ELSE
            BEGIN
                -- Insert new user-menu record
                INSERT INTO TV_USER_MENU (MENYEA, MENCOD, USEYEA, USECOD, USECRE, DATCRE, ZONCRE, USEUPD, DATUPD, ZONUPD, STAREG)
                VALUES (@MENYEA, @MENCOD, @P_USEYEA_OUT, @P_USECOD_OUT, @P_USEING, 
                        SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET), @V_ZONA_HORARIA_NOMBRE,
                        @P_USEING, SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET), @V_ZONA_HORARIA_NOMBRE, 'C')  -- C = CREATE
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
                        USEUPD = @P_USEING,
                        DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
                        ZONUPD = @V_ZONA_HORARIA_NOMBRE
                    WHERE USEYEA = @P_USEYEA_OUT AND USECOD = @P_USECOD_OUT 
                    AND MENYEA = @MENYEA AND MENCOD = @MENCOD AND PERCOD = @PERCOD
                END
                ELSE
                BEGIN
                    -- Insert new permission
                    INSERT INTO TV_USER_PERMISSION (USEYEA, USECOD, MENYEA, MENCOD, PERCOD, USECRE, DATCRE, ZONCRE, USEUPD, DATUPD, ZONUPD, STAREG)
                    VALUES (@P_USEYEA_OUT, @P_USECOD_OUT, @MENYEA, @MENCOD, @PERCOD, @P_USEING,
                            SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET), @V_ZONA_HORARIA_NOMBRE,
                            @P_USEING, SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET), @V_ZONA_HORARIA_NOMBRE, 'C')  -- C = CREATE
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

    SET @V_DESCRIPCION_LOG = 'CREATED ' + @V_CADENA
    SET @V_CODIGO_COMPLETO = @P_USEYEA_OUT + @P_USECOD_OUT

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

    SET @P_DESCRIPCION_MENSAJE  = 'User created successfully.'
    SET @P_TIPO_MENSAJE         = '3'

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
