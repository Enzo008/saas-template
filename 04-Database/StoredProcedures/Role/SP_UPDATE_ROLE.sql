-- *****************************************************************************************************
-- Description       : Update existing role with menus and permissions
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Update role information and associated menus/permissions
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_UPDATE_ROLE
@P_ROLCOD               CHAR(2),
@P_ROLNAM               VARCHAR(50),
@P_MENUS_PERMISOS       TT_USER_MENU_PERMISSION READONLY,
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
            @V_NAME_TABLE          NVARCHAR(300)  = 'TB_ROLE',
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

    -- Validate role exists
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE ROLCOD = ''' + LTRIM(RTRIM(@P_ROLCOD)) + ''' AND ' + 
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO = 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'The role you are trying to update does not exist'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    -- Validate no other role exists with same name
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE ROLNAM = ''' + LTRIM(RTRIM(@P_ROLNAM)) + ''' AND ' + 
                 ' ROLCOD <> ''' + LTRIM(RTRIM(@P_ROLCOD)) + ''' AND ' +
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'Another role with the same name already exists'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    -- Validate menus and permissions were provided
    IF NOT EXISTS (SELECT 1 FROM @P_MENUS_PERMISOS)
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'At least one menu with permissions must be assigned to the role'
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

    -- Update role
    SET @V_SQL = ' UPDATE ' + @V_NAME_TABLE + 
                 ' SET ' +
                 ' ROLNAM = ''' + LTRIM(RTRIM(UPPER(@P_ROLNAM))) + ''',' + 
                 ' USEUPD = ''' + LTRIM(RTRIM(UPPER(@P_USEUPD))) + ''',' +
                 ' DATUPD = SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                 ' STAREG = ''U''' +  -- U = UPDATE
                 ' WHERE ROLCOD = ''' + LTRIM(RTRIM(UPPER(@P_ROLCOD))) + ''''

    EXEC sp_executesql @V_SQL

    -- Delete existing menus and permissions (logical delete)
    UPDATE TR_ROLE_MENU_PERMISSION
    SET STAREG = 'D',
        USEUPD = @P_USEUPD,
        DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET)
    WHERE ROLCOD = @P_ROLCOD
    AND STAREG <> 'D'

    -- Insert new menus and permissions
    INSERT INTO TR_ROLE_MENU_PERMISSION (ROLCOD, MENYEA, MENCOD, PERCOD, USECRE, DATCRE, USEUPD, DATUPD, STAREG)
    SELECT 
        @P_ROLCOD,
        MP.MENYEA,
        MP.MENCOD,
        MP.PERCOD,
        @P_USEUPD,
        SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
        @P_USEUPD,
        SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
        'C'
    FROM @P_MENUS_PERMISOS AS MP

    -- Get updated role name for log
    SET @V_SQL_MODIFICADO = '  SELECT ' + 
                            '  @V_CADENA_MODIFICADO = ''ROLE ['' + ROL.ROLNAM + '']'' ' +
                            '  FROM TB_ROLE AS ROL ' +
                            '  WHERE ROL.ROLCOD = ''' + LTRIM(RTRIM(UPPER(@P_ROLCOD))) + ''' '

    EXEC sp_executesql @V_SQL_MODIFICADO, N'@V_CADENA_MODIFICADO NVARCHAR(MAX) OUTPUT', @V_CADENA_MODIFICADO OUTPUT

    SET @V_DESCRIPTION_LOG = 'UPDATED ' + @V_CADENA_MODIFICADO
    SET @V_CODE_COMPLETE = @P_ROLCOD

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

    SET @P_MESSAGE_DESCRIPTION  = 'Role updated successfully'
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
