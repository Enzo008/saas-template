-- *****************************************************************************************************
-- Description       : Search genders with optional filters
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 20/10/2025
-- Purpose           : Query genders with optional filtering by code and name
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_SEARCH_GENDER
@P_GENCOD               VARCHAR(6) = NULL,
@P_GENNAM               VARCHAR(50) = NULL,
@P_USEING               VARCHAR(50),
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
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TB_GENDER',
            @V_CODIGO_LOG_ANIO       CHAR(4)        = '',
            @V_CODIGO_LOG            CHAR(10)       = '',
            @V_DESCRIPCION_LOG       NVARCHAR(300)  = 'SEARCHED GENDERS',
            @V_ERROR                 NVARCHAR(MAX)  = ''

    -- Build dynamic query with optional filters
    SET @V_SQL = ' SELECT ' +
                 '     GENCOD, ' +
                 '     GENNAM, ' +
                 '     USECRE, ' +
                 '     DATCRE, ' +
                 '     USEUPD, ' +
                 '     DATUPD, ' +
                 '     STAREG ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE STAREG <> ''D'' '

    -- Add optional filters
    IF @P_GENCOD IS NOT NULL AND @P_GENCOD <> ''
        SET @V_SQL = @V_SQL + ' AND GENCOD = ''' + LTRIM(RTRIM(UPPER(@P_GENCOD))) + ''' '

    IF @P_GENNAM IS NOT NULL AND @P_GENNAM <> ''
        SET @V_SQL = @V_SQL + ' AND GENNAM LIKE ''%' + LTRIM(RTRIM(UPPER(@P_GENNAM))) + '%'' '

    SET @V_SQL = @V_SQL + ' ORDER BY GENNAM FOR JSON PATH '

    -- Execute query
    EXECUTE sp_executesql @V_SQL

    -- Register log
    EXEC SP_REGISTRAR_LOG  @V_DESCRIPCION_LOG,
                           'SELECT',
                           @P_LOGIPMAQ,
                           '',
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

    SET @P_DESCRIPCION_MENSAJE  = 'Genders retrieved successfully'
    SET @P_TIPO_MENSAJE         = '3'

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG  @V_ERROR,
                           'SELECT',
                           @P_LOGIPMAQ,
                           '',
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
