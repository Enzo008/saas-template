-- *****************************************************************************************************
-- Description       : Delete user (logical delete)
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Perform logical delete of user and related menu/permission assignments
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_DELETE_USER
@P_USEYEA                   CHAR(4),
@P_USECOD                   CHAR(6),
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
       SET @P_MESSAGE_DESCRIPTION  = 'The user you are trying to delete does not exist'
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

    -- Get user name before deleting
    SET @V_SQL_MENSAJE = '  SELECT ' + 
                         '  @V_CADENA = ''USER ['' + USU.USENAM + '' '' + USU.USELAS + '']'' ' +
                         '  FROM TM_USER AS USU ' +
                         '  WHERE USU.USEYEA = ''' + @P_USEYEA + ''' AND USU.USECOD = ''' + @P_USECOD + ''' '

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    -- ============================================================
    -- 1. DELETE USER (LOGICAL)
    -- ============================================================
    SET @V_SQL = ' UPDATE TM_USER SET ' +
                        'STAREG = ''D'',  -- D = DELETE' +
                        'USEUPD = ''' + LTRIM(RTRIM(UPPER(@P_USEUPD))) + ''',' +
                        'DATUPD = SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                        'ZONUPD = ''' + LTRIM(RTRIM(UPPER(@V_TIME_ZONE_NAME))) + '''' +
                 ' WHERE USEYEA = ''' + LTRIM(RTRIM(@P_USEYEA)) + ''' AND ' + 
                 ' USECOD = ''' + LTRIM(RTRIM(@P_USECOD)) + ''' AND ' + 
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL

    -- ============================================================
    -- 2. DELETE USER-MENU ASSIGNMENTS (LOGICAL)
    -- ============================================================
    UPDATE TV_USER_MENU 
    SET STAREG = 'D',  -- D = DELETE
        USEUPD = @P_USEUPD,
        DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
        ZONUPD = @V_TIME_ZONE_NAME
    WHERE USEYEA = @P_USEYEA 
      AND USECOD = @P_USECOD 
      AND STAREG <> 'D'

    -- ============================================================
    -- 3. DELETE USER PERMISSIONS (LOGICAL)
    -- ============================================================
    UPDATE TV_USER_PERMISSION 
    SET STAREG = 'D',  -- D = DELETE
        USEUPD = @P_USEUPD,
        DATUPD = SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
        ZONUPD = @V_TIME_ZONE_NAME
    WHERE USEYEA = @P_USEYEA 
      AND USECOD = @P_USECOD 
      AND STAREG <> 'D'

    COMMIT TRANSACTION

    -- ============================================================
    -- GENERATE SUCCESS MESSAGE
    -- ============================================================
    SET @V_DESCRIPTION_LOG = 'DELETED ' + @V_CADENA
    SET @V_CODE_COMPLETE = @P_USEYEA + @P_USECOD

    -- Register log
    EXEC SP_REGISTER_LOG  @V_DESCRIPTION_LOG,
                           'DELETE',
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

    SET @P_MESSAGE_DESCRIPTION  = 'User deleted successfully.'
    SET @P_MESSAGE_TYPE         = '3'

    EXEC SP_UPDATE_DATE_END_SQL  @V_CODE_LOG_YEAR,@V_CODE_LOG,@V_SQL

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTER_LOG  @V_ERROR,
                              'DELETE',
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
