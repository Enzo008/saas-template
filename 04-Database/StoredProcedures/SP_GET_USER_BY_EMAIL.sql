-- *****************************************************************************************************
-- Description       : Get user by email address
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 20/10/2025
-- Purpose           : Search for a user by their email address (used in authentication)
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_GET_USER_BY_EMAIL
@P_EMAIL                VARCHAR(255),
@P_LOGIPMAQ             VARCHAR(15),
@P_USEYEA_U             CHAR(4),
@P_USECOD_U             CHAR(6),
@P_USENAM_U             VARCHAR(30),
@P_USELAS_U             VARCHAR(30),
@P_TOTAL_RECORDS      INT             OUTPUT,
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
            @V_CODIGO_COMPLETO       NVARCHAR(20)   = ''

    -- Validate email parameter
    IF @P_EMAIL IS NULL OR LTRIM(RTRIM(@P_EMAIL)) = ''
    BEGIN
        SET @P_DESCRIPCION_MENSAJE = 'Email address is required'
        SET @P_TIPO_MENSAJE = '2'
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
        SET @V_DESCRIPCION_LOG = 'USER FOUND BY EMAIL [' + @P_EMAIL + ']'
        SET @P_DESCRIPCION_MENSAJE = 'User found successfully'
        SET @P_TIPO_MENSAJE = '3'
    END
    ELSE
    BEGIN
        SET @V_DESCRIPCION_LOG = 'USER NOT FOUND BY EMAIL [' + @P_EMAIL + ']'
        SET @P_DESCRIPCION_MENSAJE = 'No user found with the provided email address'
        SET @P_TIPO_MENSAJE = '2'
    END

    SET @V_CODIGO_COMPLETO = @P_EMAIL

    -- Register log
    EXEC SP_REGISTRAR_LOG  @V_DESCRIPCION_LOG,
                           'QUERY',
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
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    SET @P_TOTAL_RECORDS = 0
    
    EXEC SP_REGISTRAR_LOG  @V_ERROR,
                           'QUERY',
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
