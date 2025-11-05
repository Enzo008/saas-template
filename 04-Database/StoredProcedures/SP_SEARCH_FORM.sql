-- *****************************************************************************************************
-- Description       : Search forms with optional filters and pagination
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 20/10/2025 (Modified: 23/10/2025)
-- Purpose           : Query forms with their fields, optional filtering and server-side pagination
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_SEARCH_FORM
(
    -- Filters based on new TM_FORM_MASTER table
    @P_FORMASYEA           CHAR(4) = NULL,
    @P_FORMASCOD           CHAR(6) = NULL,
    @P_FORMASNAM           VARCHAR(100) = NULL,
    
    -- Pagination params
    @P_PAGE_NUMBER         INT = NULL,
    @P_PAGE_SIZE           INT = NULL,
    
    -- User/Log params
    @P_LOGIPMAQ            VARCHAR(15),
    @P_USEYEA_U            CHAR(4),
    @P_USECOD_U            CHAR(6),
    @P_USENAM_U            VARCHAR(30),
    @P_USELAS_U            VARCHAR(30),
    
    -- Output params
    @P_TOTAL_RECORDS       INT OUTPUT,
    @P_DESCRIPCION_MENSAJE NVARCHAR(MAX) OUTPUT,
    @P_TIPO_MENSAJE        CHAR(1) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @V_SQL               NVARCHAR(MAX) = N'',
                @V_NOMBRE_TABLA      NVARCHAR(300) = 'TM_FORM_MASTER', -- Updated table name for log
                @V_CODIGO_LOG_ANIO   CHAR(4) = '',
                @V_CODIGO_LOG        CHAR(10) = '',
                @V_DESCRIPCION_LOG   NVARCHAR(300) = 'SEARCHED FORMS WITH FIELDS',
                @V_ERROR             NVARCHAR(MAX) = '',
                @V_OFFSET            INT = 0,
                @V_USE_PAGINATION    BIT = 0;

        -- Determine if pagination should be used
        IF @P_PAGE_NUMBER IS NOT NULL AND @P_PAGE_SIZE IS NOT NULL AND @P_PAGE_SIZE > 0
        BEGIN
            SET @V_USE_PAGINATION = 1;
            SET @V_OFFSET = (@P_PAGE_NUMBER - 1) * @P_PAGE_SIZE;
        END;

        -- Get total count for pagination
        SET @V_SQL = N'SELECT @TOTAL = COUNT(*) ' +
                     N'FROM TM_FORM_MASTER AS FORMAS ' + 
                     N'WHERE FORMAS.STAREG <> ''E'' '; -- Updated audit column

        -- Add optional filters to count query (using new param names)
        IF @P_FORMASYEA IS NOT NULL AND @P_FORMASYEA <> ''
            SET @V_SQL = @V_SQL + N' AND FORMAS.FORMASYEA = ''' + LTRIM(RTRIM(@P_FORMASYEA)) + N'''';

        IF @P_FORMASCOD IS NOT NULL AND @P_FORMASCOD <> ''
            SET @V_SQL = @V_SQL + N' AND FORMAS.FORMASCOD = ''' + LTRIM(RTRIM(@P_FORMASCOD)) + N'''';

        IF @P_FORMASNAM IS NOT NULL AND @P_FORMASNAM <> ''
            SET @V_SQL = @V_SQL + N' AND FORMAS.FORMASNAM LIKE ''%' + LTRIM(RTRIM(@P_FORMASNAM)) + N'%''';

        -- Execute count query
        EXEC sp_executesql @V_SQL, N'@TOTAL INT OUTPUT', @TOTAL = @P_TOTAL_RECORDS OUTPUT;

        -- Build main query with related fields (using new column names)
        SET @V_SQL = N'SELECT ' +
                     N'   FORMAS.FORMASYEA, ' +
                     N'   FORMAS.FORMASCOD, ' +
                     N'   FORMAS.FORMASNAM, ' +
                     N'   FORMAS.FORMASDES, ' +
                     N'   FORMAS.FORMASTYP, ' +
                     N'   FORMAS.FORMASSTA, ' +
                     N'   FORMAS.FORMASMUL, ' +
                     N'   FORMAS.FORMASDATINI, ' +
                     N'   FORMAS.FORMASDATEND, ' +
                     N'   FORMAS.FORMASORD, ' +
                     N'   FORMAS.USECRE, ' + -- Updated audit column
                     N'   FORMAS.DATCRE, ' + -- Updated audit column
                     N'   FORMAS.ZONCRE, ' + -- Updated audit column
                     N'   FORMAS.USEUPD, ' + -- Updated audit column
                     N'   FORMAS.DATUPD, ' + -- Updated audit column
                     N'   FORMAS.ZONUPD, ' + -- Updated audit column
                     N'   FORMAS.STAREG, ' + -- Updated audit column
                     N'   (SELECT ' +
                     N'       FORFIE.FORFIEYEA, ' +
                     N'       FORFIE.FORFIECOD, ' +
                     N'       FORFIE.FORFIENAM, ' +
                     N'       FORFIE.FORFIELAB, ' +
                     N'       FORFIE.FORFIETYP, ' +
                     N'       FORFIE.FORFIEREQ, ' +
                     N'       FORFIE.FORFIEORD, ' +
                     N'       FORFIE.FORFIEOPT, ' +
                     N'       FORFIE.FORFIEVAL, ' +
                     N'       FORFIE.FORFIEPLA, ' +
                     N'       FORFIE.FORFIEHEL, ' +
                     N'       FORFIE.FORFIECOL, ' +
                     N'       FORFIE.FORFIEMIN, ' +
                     N'       FORFIE.FORFIEMAX, ' +
                     N'       FORFIE.FORFIEPAT, ' +
                     N'       FORFIE.FORFIEERR, ' +
                     N'       FORFIE.FORFIESTA, ' +
                     N'       FORFIE.FORFIEVIS, ' +
                     N'       FORFIE.FORFIEEDI ' +
                     N'   FROM TM_FORM_FIELD AS FORFIE ' + -- Updated table and alias
                     N'   WHERE FORFIE.FORMASYEA = FORMAS.FORMASYEA ' + -- Updated FK join
                     N'     AND FORFIE.FORMASCOD = FORMAS.FORMASCOD ' + -- Updated FK join
                     N'     AND FORFIE.STAREG <> ''E'' ' + -- Updated audit column
                     N'   ORDER BY FORFIE.FORFIEORD, FORFIE.FORFIECOD ' + -- Updated ORDER BY
                     N'   FOR JSON PATH) AS fields ' + -- Updated JSON alias to 'fields'
                     N'FROM TM_FORM_MASTER AS FORMAS ' + -- Updated table and alias
                     N'WHERE FORMAS.STAREG <> ''E'' '; -- Updated audit column

        -- Add optional filters (using new param names)
        IF @P_FORMASYEA IS NOT NULL AND @P_FORMASYEA <> ''
            SET @V_SQL = @V_SQL + N' AND FORMAS.FORMASYEA = ''' + LTRIM(RTRIM(@P_FORMASYEA)) + N'''';

        IF @P_FORMASCOD IS NOT NULL AND @P_FORMASCOD <> ''
            SET @V_SQL = @V_SQL + N' AND FORMAS.FORMASCOD = ''' + LTRIM(RTRIM(@P_FORMASCOD)) + N'''';

        IF @P_FORMASNAM IS NOT NULL AND @P_FORMASNAM <> ''
            SET @V_SQL = @V_SQL + N' AND FORMAS.FORMASNAM LIKE ''%' + LTRIM(RTRIM(@P_FORMASNAM)) + N'%''';

        -- Add ORDER BY
        SET @V_SQL = @V_SQL + N' ORDER BY FORMAS.FORMASCOD '; -- Updated ORDER BY

        -- Apply pagination if specified
        IF @V_USE_PAGINATION = 1
        BEGIN
            SET @V_SQL = @V_SQL + N' OFFSET ' + CAST(@V_OFFSET AS VARCHAR(10)) + N' ROWS '
            SET @V_SQL = @V_SQL + N' FETCH NEXT ' + CAST(@P_PAGE_SIZE AS VARCHAR(10)) + N' ROWS ONLY ';
        END;

        SET @V_SQL = @V_SQL + N' FOR JSON PATH';

        -- Execute query
        EXECUTE sp_executesql @V_SQL;

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
                               @P_DESCRIPCION_MENSAJE = @P_DESCRIPC