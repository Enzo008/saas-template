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
@P_LOGIPMAC             VARCHAR(15),
@P_USEYEA_U             CHAR(4),
@P_USECOD_U             CHAR(6),
@P_USENAM_U             VARCHAR(30),
@P_USELASNAM_U             VARCHAR(30),
@P_PAGE_NUMBER          INT = NULL,
@P_PAGE_SIZE            INT = NULL,
@P_TOTAL_RECORDS      INT             OUTPUT,
@P_MESSAGE_DESCRIPTION  NVARCHAR(MAX)   OUTPUT,
@P_MESSAGE_TYPE         CHAR(1)         OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_SQL               NVARCHAR(MAX)  = '',
            @V_NAME_TABLE      NVARCHAR(300)  = 'TM_USER',
            @V_CODE_LOG_YEAR   CHAR(4)        = '',
            @V_CODE_LOG        CHAR(10)       = '',
            @V_TOTAL_RECORDS   INT,
            @V_MESSAGE_DESCRIPTION   NVARCHAR(300)  = '',
            @V_ERROR             NVARCHAR(MAX)  = '',
            @V_CADENA            NVARCHAR(MAX)  = '',
            @V_CODE_COMPLETE   NVARCHAR(20)   = '',
            @V_OFFSET            INT            = 0,
            @V_USAR_PAGINACION   BIT            = 0

    SET @V_MESSAGE_DESCRIPTION = 'SEARCHED USER COMPLETE'

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

    SET @P_MESSAGE_DESCRIPTION = 'User search completed successfully'
    SET @P_MESSAGE_TYPE = '3'

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTER_LOG @V_ERROR,'SEARCH',@P_LOGIPMAC,'',@V_NAME_TABLE,@V_SQL,'ERROR',@P_USEYEA_U,@P_USECOD_U,@P_USENAM_U,@P_USELASNAM_U,@P_MESSAGE_DESCRIPTION = @P_MESSAGE_DESCRIPTION OUTPUT,@P_MESSAGE_TYPE = @P_MESSAGE_TYPE OUTPUT,@P_LOGYEA = @V_CODE_LOG_YEAR OUTPUT,@P_LOGCOD = @V_CODE_LOG OUTPUT
    EXEC SP_UPDATE_DATE_END_SQL @V_CODE_LOG_YEAR, @V_CODE_LOG, @V_SQL
    SET @P_MESSAGE_DESCRIPTION = @V_ERROR
    SET @P_MESSAGE_TYPE = '1'
END CATCH
GO
