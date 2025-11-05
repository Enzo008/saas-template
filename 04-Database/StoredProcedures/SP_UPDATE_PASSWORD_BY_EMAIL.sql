-- *****************************************************************************************************
-- Description       : Update user password by email address
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 20/10/2025
-- Purpose           : Update user password using email (used in password recovery)
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_UPDATE_PASSWORD_BY_EMAIL
@P_EMAIL                VARCHAR(255),
@P_NEW_PASSWORD         VARCHAR(500),
@P_USEMOD               VARCHAR(50),
@P_LOGIPMAQ             VARCHAR(15),
@P_USEYEA_U             CHAR(4),
@P_USECOD_U             CHAR(6),
@P_USENAM_U             VARCHAR(30),
@P_USELAS_U             VARCHAR(30),
@P_DESCRIPCION_MENSAJE  NVARCHAR(MAX)   OUTPUT,
@P_TIPO_MENSAJE         CHAR(1)         OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_SQL                   NVARCHAR(MAX)  = '',
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TM_USUARIO',
            @V_CODIGO_LOG_ANIO       CHAR(4)        = '',
            @V_CODIGO_LOG            CHAR(10)       = '',
            @V_DESCRIPCION_LOG       NVARCHAR(300)  = '',
            @V_ERROR                 NVARCHAR(MAX)  = '',
            @V_CODIGO_COMPLETO       NVARCHAR(20)   = '',
            @V_ZONA_HORARIA_OFFSET   NVARCHAR(6)    = '',
            @V_ZONA_HORARIA_NOMBRE   NVARCHAR(50)   = '',
            @V_ZONA_HORARIA_LOCALE   NVARCHAR(50)   = '',
            @V_USUYEA                CHAR(4)        = '',
            @V_USUCOD                CHAR(6)        = '',
            @V_ROWS_AFFECTED         INT

    -- Validate email parameter
    IF @P_EMAIL IS NULL OR LTRIM(RTRIM(@P_EMAIL)) = ''
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'Email address is required'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END

    -- Validate password parameter
    IF @P_NEW_PASSWORD IS NULL OR LTRIM(RTRIM(@P_NEW_PASSWORD)) = ''
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'New password is required'
        SET @P_TIPO_MENSAJE = '2'
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
        SET @P_DESCRIPCION_MENSAJE = 'No active user found with the provided email address'
        SET @P_TIPO_MENSAJE = '2'
        RETURN
    END

    BEGIN TRANSACTION

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                              @P_USECOD_U,
                              @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
                              @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
                              @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- Update password
    UPDATE TM_USUARIO 
    SET UsuPas = @P_NEW_PASSWORD,
        UsuMod = UPPER(@P_USEMOD),
        FecMod = SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
        ZonMod = UPPER(@V_ZONA_HORARIA_NOMBRE)
    WHERE UsuCorEle = @P_EMAIL
      AND EstReg <> 'E'

    SET @V_ROWS_AFFECTED = @@ROWCOUNT

    -- Check if update was successful
    IF @V_ROWS_AFFECTED > 0
    BEGIN
        COMMIT TRANSACTION

        SET @V_DESCRIPCION_LOG = 'PASSWORD UPDATED FOR USER [' + @V_USUYEA + '-' + @V_USUCOD + '] EMAIL [' + @P_EMAIL + ']'
        SET @P_DESCRIPCION_MENSAJE = 'Password updated successfully'
        SET @P_TIPO_MENSAJE = '3'
    END
    ELSE
    BEGIN
        ROLLBACK TRANSACTION
        SET @P_DESCRIPCION_MENSAJE = 'Could not update password'
        SET @P_TIPO_MENSAJE = '1'
        RETURN
    END

    SET @V_CODIGO_COMPLETO = @V_USUYEA + @V_USUCOD

    -- Register log
    EXEC SP_REGISTRAR_LOG  @V_DESCRIPCION_LOG,
                           'UPDATE',
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

    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL  @V_CODIGO_LOG_ANIO,@V_CODIGO_LOG,@V_SQL

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    
    EXEC SP_REGISTRAR_LOG  @V_ERROR,
                           'UPDATE',
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
    
    SET @P_DESCRIPCION_MENSAJE = @V_ERROR
    SET @P_TIPO_MENSAJE = '1'
END CATCH
GO
