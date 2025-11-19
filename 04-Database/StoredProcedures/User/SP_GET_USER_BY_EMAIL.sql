-- *****************************************************************************************************
-- Description       : Get user by email address
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 20/10/2025
-- Purpose           : Search for a user by their email address (used in authentication)
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_GET_USER_BY_EMAIL
@P_EMAIL                VARCHAR(255),
@P_LOGIPMAC             VARCHAR(15),
@P_USEYEA_U             CHAR(4),
@P_USECOD_U             CHAR(6),
@P_USENAM_U             VARCHAR(30),
@P_USELASNAM_U             VARCHAR(30),
@P_TOTAL_RECORDS      INT             OUTPUT,
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
            @V_CODE_COMPLETE       NVARCHAR(20)   = ''

    -- Validate email parameter
    IF @P_EMAIL IS NULL OR LTRIM(RTRIM(@P_EMAIL)) = ''
    BEGIN
        SET @P_MESSAGE_DESCRIPTION = 'Email address is required'
        SET @P_MESSAGE_TYPE = '2'
        SET @P_TOTAL_RECORDS = 0
        RETURN
    END

    -- Search user by email
    SET @V_SQL = ' SELECT ' +
                 '     UsuAno, UsuCod, UsuNom, UsuApe, UsuCorEle, UsuPas, UsuEst, RolCod ' +
                 ' FROM TM_USUARIO ' +
                 ' WHERE UsuCorEle = ''' + LTRIM(RTRIM(@P_EMAIL)) + ''' ' +
                 ' AND EstReg <> ''E'' ' +
                 ' FOR JSON PATH '

    EXEC sp_executesql @V_SQL

    SET @P_TOTAL_RECORDS = @@ROWCOUNT

    -- Check if user was found
    IF @P_TOTAL_RECORDS > 0
    BEGIN
        SET @V_DESCRIPTION_LOG = 'USER FOUND BY EMAIL [' + @P_EMAIL + ']'
        SET @P_MESSAGE_DESCRIPTION = 'User found successfully'
        SET @P_MESSAGE_TYPE = '3'
    END
    ELSE
    BEGIN
        SET @V_DESCRIPTION_LOG = 'USER NOT FOUND BY EMAIL [' + @P_EMAIL + ']'
        SET @P_MESSAGE_DESCRIPTION = 'No user found with the provided email address'
        SET @P_MESSAGE_TYPE = '2'
    END

    SET @V_CODE_COMPLETE = @P_EMAIL

    -- Register log
    EXEC SP_REGISTER_LOG  @V_DESCRIPTION_LOG,
                           'QUERY',
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
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    SET @P_TOTAL_RECORDS = 0
    
    EXEC SP_REGISTER_LOG  @V_ERROR,
                           'QUERY',
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
