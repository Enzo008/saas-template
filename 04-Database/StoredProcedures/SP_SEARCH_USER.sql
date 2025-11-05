-- *****************************************************************************************************
-- Description       : Search users with pagination support
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Search and retrieve user data with optional server-side pagination
-- *****************************************************************************************************

CREATE OR ALTER PROC SP_SEARCH_USER
@P_USEYEA               CHAR(04),
@P_USECOD               CHAR(06),
@P_USENAM               VARCHAR(50),
@P_USELAS               VARCHAR(50),
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
            @V_NOMBRE_TABLA      NVARCHAR(300)  = 'TM_USER',
            @V_CODIGO_LOG_ANIO   CHAR(4)        = '',
            @V_CODIGO_LOG        CHAR(10)       = '',
            @V_CANTIDAD_REGISTRO INT,
            @V_DESCRIPCION_LOG   NVARCHAR(300)  = '',
            @V_ERROR             NVARCHAR(MAX)  = '',
            @V_CADENA            NVARCHAR(MAX)  = '',
            @V_CODIGO_COMPLETO   NVARCHAR(20)   = '',
            @V_OFFSET            INT            = 0,
            @V_USAR_PAGINACION   BIT            = 0

    SET @V_DESCRIPCION_LOG = 'SEARCHED USER COMPLETE'

    -- Determine if using pagination
    IF @P_PAGE_NUMBER IS NOT NULL AND @P_PAGE_SIZE IS NOT NULL AND @P_PAGE_SIZE > 0
    BEGIN
        SET @V_USAR_PAGINACION = 1
        SET @V_OFFSET = (@P_PAGE_NUMBER - 1) * @P_PAGE_SIZE
    END

    -- First get total records for pagination
    SET @V_SQL = 'SELECT @TOTAL = COUNT(*) ' +
                 'FROM TM_USER AS USU ' +
                 'WHERE USU.STAREG <> ''D''' 
    
    -- Add filters for count
    IF @P_USEYEA IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND USU.USEYEA = ''' + LTRIM(RTRIM(@P_USEYEA)) + ''''

    IF @P_USECOD IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND USU.USECOD = ''' + LTRIM(RTRIM(@P_USECOD)) + ''''

    IF @P_USENAM IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND USU.USENAM LIKE ''%' + LTRIM(RTRIM(@P_USENAM)) + '%'''

    IF @P_USELAS IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND USU.USELAS LIKE ''%' + LTRIM(RTRIM(@P_USELAS)) + '%'''
    
    -- Execute query to get total records
    EXEC sp_executesql @V_SQL, N'@TOTAL INT OUTPUT', @TOTAL = @P_TOTAL_RECORDS OUTPUT
    
    -- Build main query (without menus/permissions)
    SET @V_SQL = 'SELECT USU.USEYEA, USU.USECOD, IDEDOC.IDEDOCCOD, IDEDOC.IDEDOCNAM, IDEDOC.IDEDOCABR, ' +
                 'USU.USENUMDOC, USU.USENAM, USU.USELAS, USU.USEBIR, USU.USESEX, USU.USEEMA, ' +
                 'POS.POSCOD, POS.POSNAM, USU.USEPHO, USU.USEPAS, ' +
                 'USU.USESTA, USU.USESES, ROL.ROLCOD, ROL.ROLNAM, LOC.LOCYEA, LOC.LOCCOD, ' +
                 'LOC.LOCNAM, USU.REPYEA, USU.REPCOD, REP.REPNAM, USU.USECRE, USU.DATCRE, USU.ZONCRE, USU.USEUPD, USU.DATUPD, USU.ZONUPD, USU.STAREG'

    SET @V_SQL = @V_SQL + ' FROM TM_USER AS USU ' +
                 'INNER JOIN TB_IDENTITY_DOCUMENT AS IDEDOC ON USU.IDEDOCCOD = IDEDOC.IDEDOCCOD ' +
                 'INNER JOIN TB_POSITION AS POS ON USU.POSCOD = POS.POSCOD ' +
                 'INNER JOIN TB_ROLE AS ROL ON USU.ROLCOD = ROL.ROLCOD ' +
                 'INNER JOIN TM_LOCATION AS LOC ON USU.LOCYEA = LOC.LOCYEA AND USU.LOCCOD = LOC.LOCCOD ' +
                 'INNER JOIN TM_REPOSITORY AS REP ON USU.REPYEA = REP.REPYEA AND USU.REPCOD = REP.REPCOD ' +
                 'WHERE USU.STAREG <> ''D'''

    -- Add filters
    IF @P_USEYEA IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND USU.USEYEA = ''' + LTRIM(RTRIM(@P_USEYEA)) + ''''

    IF @P_USECOD IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND USU.USECOD = ''' + LTRIM(RTRIM(@P_USECOD)) + ''''

    IF @P_USENAM IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND USU.USENAM LIKE ''%' + LTRIM(RTRIM(@P_USENAM)) + '%'''

    IF @P_USELAS IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND USU.USELAS LIKE ''%' + LTRIM(RTRIM(@P_USELAS)) + '%'''

    -- Ordering
    SET @V_SQL = @V_SQL + ' ORDER BY USU.USEYEA, USU.USECOD'

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

    SET @P_DESCRIPCION_MENSAJE = 'User search completed successfully'
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
