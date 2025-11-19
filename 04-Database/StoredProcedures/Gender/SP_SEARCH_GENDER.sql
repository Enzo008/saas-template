-- *****************************************************************************************************
-- Description       : Search genders with optional filters
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 20/10/2025
-- Purpose           : Query genders with optional filtering by code and name
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_SEARCH_GENDER
@P_GENCOD               VARCHAR(6) = NULL,
@P_GENNAM               VARCHAR(50) = NULL,
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
            @V_NAME_TABLE          NVARCHAR(300)  = 'TB_GENDER',
            @V_CODE_LOG_YEAR       CHAR(4)        = '',
            @V_CODE_LOG            CHAR(10)       = '',
            @V_DESCRIPTION_LOG       NVARCHAR(300)  = 'SEARCHED GENDERS',
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
                 ' FROM ' + @V_NAME_TABLE + 
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

    SET @P_MESSAGE_DESCRIPTION  = 'Genders retrieved successfully'
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
