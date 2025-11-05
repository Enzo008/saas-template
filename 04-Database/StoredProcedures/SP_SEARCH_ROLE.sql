-- *****************************************************************************************************
-- Description       : Search roles with pagination support
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Search and retrieve role data with optional server-side pagination
-- *****************************************************************************************************

CREATE OR ALTER PROC SP_SEARCH_ROLE
@P_ROLCOD               CHAR(2) = NULL,
@P_ROLNAM               VARCHAR(50) = NULL,
@P_LOGIPMAQ             VARCHAR(15),
@P_USEYEA_U             CHAR(4),
@P_USECOD_U             CHAR(6),
@P_USENAM_U             VARCHAR(30),
@P_USELAS_U             VARCHAR(30),
@P_PAGE_NUMBER          INT = NULL,
@P_PAGE_SIZE            INT = NULL,
@P_TOTAL_RECORDS      INT             OUTPUT,
@P_DESCRIPCION_MENSAJE  NVARCHAR(MAX)   OUTPUT,
@P_TIPO_MENSAJE         CHAR(1)         OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_SQL               NVARCHAR(MAX)  = '',
            @V_NOMBRE_TABLA      NVARCHAR(300)  = 'TB_ROLE',
            @V_CODIGO_LOG_ANIO   CHAR(4)        = '',
            @V_CODIGO_LOG        CHAR(10)       = '',
            @V_DESCRIPCION_LOG   NVARCHAR(300)  = '',
            @V_ERROR             NVARCHAR(MAX)  = '',
            @V_OFFSET            INT            = 0,
            @V_USAR_PAGINACION   BIT            = 0

    SET @V_DESCRIPCION_LOG = 'SEARCHED ROLE COMPLETE'

    -- Determine if using pagination
    IF @P_PAGE_NUMBER IS NOT NULL AND @P_PAGE_SIZE IS NOT NULL AND @P_PAGE_SIZE > 0
    BEGIN
        SET @V_USAR_PAGINACION = 1
        SET @V_OFFSET = (@P_PAGE_NUMBER - 1) * @P_PAGE_SIZE
    END

    -- First get total records for pagination
    SET @V_SQL = 'SELECT @TOTAL = COUNT(*) ' +
                 'FROM TB_ROLE AS ROL ' +
                 'WHERE ROL.STAREG <> ''D''' 
    
    -- Add filters for count
    IF @P_ROLCOD IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND ROL.ROLCOD = ''' + LTRIM(RTRIM(@P_ROLCOD)) + ''''

    IF @P_ROLNAM IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND ROL.ROLNAM LIKE ''%' + LTRIM(RTRIM(@P_ROLNAM)) + '%'''
    
    -- Execute query to get total records
    EXEC sp_executesql @V_SQL, N'@TOTAL INT OUTPUT', @TOTAL = @P_TOTAL_RECORDS OUTPUT
    
    -- Build main query
    SET @V_SQL = 'SELECT ROL.ROLCOD, ROL.ROLNAM, ' +
                 'ROL.USECRE, ROL.DATCRE, ROL.USEUPD, ROL.DATUPD, ROL.STAREG'

    SET @V_SQL = @V_SQL + ' FROM TB_ROLE AS ROL ' +
                 'WHERE ROL.STAREG <> ''D'''

    -- Add filters
    IF @P_ROLCOD IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND ROL.ROLCOD = ''' + LTRIM(RTRIM(@P_ROLCOD)) + ''''

    IF @P_ROLNAM IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND ROL.ROLNAM LIKE ''%' + LTRIM(RTRIM(@P_ROLNAM)) + '%'''

    -- Ordering
    SET @V_SQL = @V_SQL + ' ORDER BY ROL.ROLNAM ASC'

    -- Pagination
    IF @V_USAR_PAGINACION = 1
    BEGIN
        SET @V_SQL = @V_SQL + 
                    ' OFFSET ' + CAST(@V_OFFSET AS VARCHAR) + ' ROWS ' +
                    ' FETCH NEXT ' + CAST(@P_PAGE_SIZE AS VARCHAR) + ' ROWS ONLY'
    END

    -- JSON format
    SET @V_SQL = @V_SQL + ' FOR JSON PATH'

    -- Execute final query
    EXECUTE sp_executesql @V_SQL

    SET @P_DESCRIPCION_MENSAJE = 'Role search completed successfully'
    SET @P_TIPO_MENSAJE = '3'

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG @V_ERROR,'SEARCH',@P_LOGIPMAQ,'',@V_NOMBRE_TABLA,@V_SQL,'ERROR',@P_USEYEA_U,@P_USECOD_U,@P_USENAM_U,@P_USELAS_U,@P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,@P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,@P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,@P_LOGCOD = @V_CODIGO_LOG OUTPUT
    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL @V_CODIGO_LOG_ANIO, @V_CODIGO_LOG, @V_SQL
    SET @P_DESCRIPCION_MENSAJE = @V_ERROR
    SET @P_TIPO_MENSAJE = '1'
END CATCH
GO
