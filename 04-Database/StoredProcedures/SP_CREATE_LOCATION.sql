-- *****************************************************************************************************
-- Description       : Create new location
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Insert a new location (country, state, city, etc.)
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_CREATE_LOCATION
@P_LOCNAM               VARCHAR(100),
@P_LOCTYP               VARCHAR(50),
@P_LOCYEAPAR            CHAR(4) = NULL,
@P_LOCCODPAR            CHAR(6) = NULL,
@P_LOCLAT               VARCHAR(20) = NULL,
@P_LOCLON               VARCHAR(20) = NULL,
@P_LOCADD               VARCHAR(200) = NULL,
@P_LOCSTA               CHAR(1) = 'A',
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
            @V_SQL_MENSAJE           NVARCHAR(MAX)  = '',
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TM_LOCATION',
            @V_DEFECTO               NVARCHAR(02)   = '01',
            @V_YEAR                  CHAR(4)        = '',
            @V_CODIGO_GENERADO       NVARCHAR(300)  = '',
            @V_CODIGO_LOG_ANIO       CHAR(4)        = '',
            @V_CODIGO_LOG            CHAR(10)       = '',
            @V_CANTIDAD_REGISTRO     INT,
            @V_DESCRIPCION_LOG       NVARCHAR(300)  = '',
            @V_ERROR                 NVARCHAR(MAX)  = '',
            @V_CADENA                NVARCHAR(MAX)  = '',
            @V_CODIGO_COMPLETO       NVARCHAR(20)   = '',
            @V_ZONA_HORARIA_OFFSET   NVARCHAR(6)    = '',
            @V_ZONA_HORARIA_NOMBRE   NVARCHAR(50)   = '',
            @V_ZONA_HORARIA_LOCALE   NVARCHAR(50)   = ''

    -- Validate location doesn't already exist
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE LOCNAM = ''' + LTRIM(RTRIM(UPPER(@P_LOCNAM))) + ''' AND ' +
                 ' LOCTYP = ''' + LTRIM(RTRIM(UPPER(@P_LOCTYP))) + ''' AND ' +
                 ' STAREG <> ''D'' ';

    EXECUTE sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
        SET @P_DESCRIPCION_MENSAJE  = 'The location already exists in the database'
        SET @P_TIPO_MENSAJE         = '2'
        RETURN
    END

    -- Validate parent location exists if specified
    IF @P_LOCYEAPAR IS NOT NULL AND @P_LOCCODPAR IS NOT NULL
    BEGIN
        SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                     ' FROM TM_LOCATION ' +
                     ' WHERE LOCYEA = ''' + @P_LOCYEAPAR + ''' AND ' +
                     ' LOCCOD = ''' + @P_LOCCODPAR + ''' AND ' +
                     ' STAREG <> ''D'' ';

        EXECUTE sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

        IF @V_CANTIDAD_REGISTRO = 0
        BEGIN
            SET @P_DESCRIPCION_MENSAJE  = 'The parent location does not exist'
            SET @P_TIPO_MENSAJE         = '2'
            RETURN
        END
    END

    -- Get current year
    SET @V_YEAR = CAST(YEAR(GETDATE()) AS CHAR(4))

    -- Generate code
    EXEC SP_GENERAR_CODIGO @V_DEFECTO, 'TM_LOCATION', 'LOCCOD', @V_CODIGO = @V_CODIGO_GENERADO OUTPUT
    
    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE
        @P_USEYEA_U,
        @P_USECOD_U,
        @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
        @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
        @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- Insert location
    SET @V_SQL = ' INSERT INTO TM_LOCATION(' +
                        'LOCYEA, ' +
                        'LOCCOD, ' +
                        'LOCNAM, ' +
                        'LOCTYP, ' +
                        'LOCYEAPAR, ' +
                        'LOCCODPAR, ' +
                        'LOCLAT, ' +
                        'LOCLON, ' +
                        'LOCADD, ' +
                        'LOCSTA, ' +
                        'LOCOFFZON, ' +
                        'LOCLOC, ' +
                        'LOCNOMZON, ' +
                        'USECRE, ' +
                        'DATCRE, ' +
                        'ZONCRE, ' +
                        'USEUPD, ' +
                        'DATUPD, ' +
                        'ZONUPD, ' +
                        'STAREG' +
                 ') VALUES(' +
                        '''' + @V_YEAR + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@V_CODIGO_GENERADO))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_LOCNAM))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_LOCTYP))) + ''',' +
                        CASE WHEN @P_LOCYEAPAR IS NULL THEN 'NULL' ELSE '''' + @P_LOCYEAPAR + '''' END + ',' +
                        CASE WHEN @P_LOCCODPAR IS NULL THEN 'NULL' ELSE '''' + @P_LOCCODPAR + '''' END + ',' +
                        CASE WHEN @P_LOCLAT IS NULL THEN 'NULL' ELSE '''' + @P_LOCLAT + '''' END + ',' +
                        CASE WHEN @P_LOCLON IS NULL THEN 'NULL' ELSE '''' + @P_LOCLON + '''' END + ',' +
                        CASE WHEN @P_LOCADD IS NULL THEN 'NULL' ELSE '''' + LTRIM(RTRIM(UPPER(@P_LOCADD))) + '''' END + ',' +
                        '''' + @P_LOCSTA + ''',' +
                        '''' + @V_ZONA_HORARIA_OFFSET + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_LOCALE))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USEING))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USEING))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''',' +
                        '''C'')'  -- C = CREATE

    EXECUTE sp_executesql @V_SQL

    -- Generate success message
    SET @V_SQL_MENSAJE = '  SELECT ' + 
                         '  @V_CADENA = ''LOCATION ['' + LOC.LOCNAM + '']'' ' +
                         '  FROM TM_LOCATION AS LOC ' +
                         '  WHERE LOC.LOCYEA = ''' + @V_YEAR + ''' AND LOC.LOCCOD = ''' + @V_CODIGO_GENERADO + ''''

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    SET @V_DESCRIPCION_LOG = 'CREATED ' + @V_CADENA
    SET @V_CODIGO_COMPLETO = @V_YEAR + '-' + @V_CODIGO_GENERADO

    -- Register log
    EXEC SP_REGISTRAR_LOG  @V_DESCRIPCION_LOG,
                           'INSERT',
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

    SET @P_DESCRIPCION_MENSAJE  = 'Location created successfully'
    SET @P_TIPO_MENSAJE         = '3'
    
    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL  @V_CODIGO_LOG_ANIO,@V_CODIGO_LOG,@V_SQL

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG  @V_ERROR,
                           'INSERT',
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
    SET @P_DESCRIPCION_MENSAJE  = @V_ERROR
    SET @P_TIPO_MENSAJE         = '1'
END CATCH
GO
