-- *****************************************************************************************************
-- Description       : Search nationalities with optional filters
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 20/10/2025
-- Purpose           : Query nationalities with optional filtering by code and name
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_SEARCH_NATIONALITY
@P_NATCOD               VARCHAR(6) = NULL,
@P_NATNAM               VARCHAR(50) = NULL,
@P_USECRE               VARCHAR(50),
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
            @V_NAME_TABLE          NVARCHAR(300)  = 'TB_NATIONALITY',
            @V_CODE_LOG_YEAR       CHAR(4)        = '',
            @V_CODE_LOG            CHAR(10)       = '',
            @V_DESCRIPTION_LOG       NVARCHAR(300)  = 'SEARCHED NATIONALITIES',
            @V_ERROR                 NVARCHAR(MAX)  = ''

    -- Build dynamic query with optional filters
    SET @V_SQL = ' SELECT ' +
                 '     NATCOD, ' +
                 '     NATNAM, ' +
                 '     USECRE, ' +
                 '     DATCRE, ' +
                 '     USEUPD, ' +
                 '     DATUPD, ' +
                 '     STAREG ' +
                 ' FROM ' + @V_NAME_TABLE + 
                 ' WHERE STAREG <> ''D'' '

    -- Add optional filters
    IF @P_NATCOD IS NOT NULL AND @P_NATCOD <> ''
        SET @V_SQL = @V_SQL + ' AND NATCOD = ''' + LTRIM(RTRIM(UPPER(@P_NATCOD))) + ''' '

    IF @P_NATNAM IS NOT NULL AND @P_NATNAM <> ''
        SET @V_SQL = @V_SQL + ' AND NATNAM LIKE ''%' + LTRIM(RTRIM(UPPER(@P_NATNAM))) + '%'' '

    SET @V_SQL = @V_SQL + ' ORDER BY NATNAM FOR JSON PATH '

    -- Execute query
    EXECUTE sp_executesql @V_SQL

    -- Register log
    EXEC SP_REGISTER_LOG  @V_DESCRIPTION_LOG,
                           'SELECT',
                           @P_LOGIPMAC,
                           '',
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

    SET @P_MESSAGE_DESCRIPTION  = 'Nationalities retrieved successfully'
    SET @P_MESSAGE_TYPE         = '3'

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTER_LOG  @V_ERROR,
                           'SELECT',
                           @P_LOGIPMAC,
                           '',
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
