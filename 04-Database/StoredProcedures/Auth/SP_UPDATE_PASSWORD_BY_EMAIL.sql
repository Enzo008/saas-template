-- *****************************************************************************************************
-- Description       : Update user password by email address
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 20/10/2025
-- Purpose           : Update user password using email (used in password recovery)
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_UPDATE_PASSWORD_BY_EMAIL
@P_EMAIL                VARCHAR(255),
@P_NEW_PASSWORD         VARCHAR(500),
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
            @V_NAME_TABLE          NVARCHAR(300)  = 'TM_USUARIO',
            @V_CODE_LOG_YEAR       CHAR(4)        = '',
            @V_CODE_LOG            CHAR(10)       = '',
            @V_DESCRIPTION_LOG       NVARCHAR(300)  = '',
            @V_ERROR                 NVARCHAR(MAX)  = '',
            @V_CODE_COMPLETE       NVARCHAR(20)   = '',
            @V_TIME_ZONE_OFFSET   NVARCHAR(6)    = '',
            @V_TIME_ZONE_NAME   NVARCHAR(50)   = '',
            @V_TIME_ZONE_LOCALE   NVARCHAR(50)   = '',
            @V_USUYEA                CHAR(4)        = '',
            @V_USUCOD                CHAR(6)        = '',
            @V_ROWS_AFFECTED         INT

    -- Validate email parameter
    IF @P_EMAIL IS NULL OR LTRIM(RTRIM(@P_EMAIL)) = ''
    BEGIN
        SET @P_MESSAGE_DESCRIPTION = 'Email address is required'
        SET @P_MESSAGE_TYPE = '2'
        RETURN
    END

    -- Validate password parameter
    IF @P_NEW_PASSWORD IS NULL OR LTRIM(RTRIM(@P_NEW_PASSWORD)) = ''
    BEGIN
        SET @P_MESSAGE_DESCRIPTION = 'New password is required'
        SET @P_MESSAGE_TYPE = '2'
        RETURN
    END

    -- Check if user exists and is active
    SELECT @V_USUYEA = UsuAno, @V_USUCOD = UsuCod
    FROM TM_USUARIO 
    WHERE UsuCorEle = @P_EMAIL 
      AND UsuEst = 1
      AND EstReg <> 'E'

    IF @V_USUYEA IS NULL OR @V_USUCOD IS NULL
    BEGIN
        SET @P_MESSAGE_DESCRIPTION = 'No active user found with the provided email address'
        SET @P_MESSAGE_TYPE = '2'
        RETURN
    END

    BEGIN TRANSACTION

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                              @P_USECOD_U,
                              @P_LOCOFFZON = @V_TIME_ZONE_OFFSET OUTPUT,
                              @P_LOCLOC = @V_TIME_ZONE_LOCALE OUTPUT,
                              @P_LOCNAMZON = @V_TIME_ZONE_NAME OUTPUT

    -- Update password
    UPDATE TM_USUARIO 
    SET UsuPas = @P_NEW_PASSWORD,
        UsuMod = UPPER(@P_USEUPD),
        FecMod = SWITCHOFFSET(SYSDATETIME(), @V_TIME_ZONE_OFFSET),
        ZonMod = UPPER(@V_TIME_ZONE_NAME)
    WHERE UsuCorEle = @P_EMAIL
      AND EstReg <> 'E'

    SET @V_ROWS_AFFECTED = @@ROWCOUNT

    -- Check if update was successful
    IF @V_ROWS_AFFECTED > 0
    BEGIN
        COMMIT TRANSACTION

        SET @V_DESCRIPTION_LOG = 'PASSWORD UPDATED FOR USER [' + @V_USUYEA + '-' + @V_USUCOD + '] EMAIL [' + @P_EMAIL + ']'
        SET @P_MESSAGE_DESCRIPTION = 'Password updated successfully'
        SET @P_MESSAGE_TYPE = '3'
    END
    ELSE
    BEGIN
        ROLLBACK TRANSACTION
        SET @P_MESSAGE_DESCRIPTION = 'Could not update password'
        SET @P_MESSAGE_TYPE = '1'
        RETURN
    END

    SET @V_CODE_COMPLETE = @V_USUYEA + @V_USUCOD

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
    
    SET @P_MESSAGE_DESCRIPTION = @V_ERROR
    SET @P_MESSAGE_TYPE = '1'
END CATCH
GO
