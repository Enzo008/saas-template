-- *****************************************************************************************************
-- Description       : Search positions with pagination support
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Search and retrieve position data with optional server-side pagination
-- *****************************************************************************************************

CREATE OR ALTER PROC SP_SEARCH_POSITION
@P_POSCOD               CHAR(02),
@P_POSNAM               VARCHAR(100),
@P_LOGIPMAC             VARCHAR(15),
@P_USEYEA_U             CHAR(4),
@P_USECOD_U             CHAR(6),
@P_USENAM_U             VARCHAR(30),
@P_USELASNAM_U          VARCHAR(30),
@P_PAGE_NUMBER          INT = NULL,
@P_PAGE_SIZE            INT = NULL,
@P_TOTAL_RECORDS      INT             OUTPUT,
@P_MESSAGE_DESCRIPTION  NVARCHAR(MAX)   OUTPUT,
@P_MESSAGE_TYPE         CHAR(1)         OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_SQL               NVARCHAR(MAX)  = '',
            @V_NAME_TABLE      NVARCHAR(300)  = 'TB_POSITION',
            @V_CODE_LOG_YEAR   CHAR(4)        = '',
            @V_CODE_LOG        CHAR(10)       = '',
            @V_TOTAL_RECORD    INT,
            @V_DESCRIPTION_LOG   NVARCHAR(300)  = '',
            @V_ERROR             NVARCHAR(MAX)  = '',
            @V_CADENA            NVARCHAR(MAX)  = '',
            @V_CODE_COMPLETE   NVARCHAR(20)   = '',
            @V_OFFSET            INT            = 0,
            @V_USAR_PAGINACION   BIT            = 0

    SET @V_DESCRIPTION_LOG = 'SEARCHED POSITION COMPLETE'

    -- Determine if using pagination
    IF @P_PAGE_NUMBER IS NOT NULL AND @P_PAGE_SIZE IS NOT NULL AND @P_PAGE_SIZE > 0
    BEGIN
        SET @V_USAR_PAGINACION = 1
        SET @V_OFFSET = (@P_PAGE_NUMBER - 1) * @P_PAGE_SIZE
    END

    -- First get total records for pagination
    SET @V_SQL = 'SELECT @TOTAL = COUNT(*) ' +
                 'FROM TB_POSITION AS POS ' +
                 'WHERE POS.STAREG <> ''D''' 
    
    -- Add filters for count
    IF @P_POSCOD IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND POS.POSCOD = ''' + LTRIM(RTRIM(@P_POSCOD)) + ''''

    IF @P_POSNAM IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND POS.POSNAM LIKE ''%' + LTRIM(RTRIM(@P_POSNAM)) + '%'''
    
    -- Execute query to get total records
    EXEC sp_executesql @V_SQL, N'@TOTAL INT OUTPUT', @TOTAL = @P_TOTAL_RECORDS OUTPUT
    
    -- Build main query
    SET @V_SQL = 'SELECT POS.POSCOD, POS.POSNAM, POS.USECRE, POS.DATCRE, POS.USEUPD, POS.DATUPD, POS.STAREG'

    SET @V_SQL = @V_SQL + ' FROM TB_POSITION AS POS ' +
                 'WHERE POS.STAREG <> ''D'''

    -- Add filters
    IF @P_POSCOD IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND POS.POSCOD = ''' + LTRIM(RTRIM(@P_POSCOD)) + ''''

    IF @P_POSNAM IS NOT NULL
        SET @V_SQL = @V_SQL + ' AND POS.POSNAM LIKE ''%' + LTRIM(RTRIM(@P_POSNAM)) + '%'''

    -- Ordering
    SET @V_SQL = @V_SQL + ' ORDER BY POS.POSCOD'

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

    SET @P_MESSAGE_DESCRIPTION = 'Position search completed successfully'
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
