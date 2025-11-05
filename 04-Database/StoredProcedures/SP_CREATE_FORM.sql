-- *****************************************************************************************************
-- Description       : Create new form with fields
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 20/10/2025
-- Purpose           : Insert a new form with associated fields in a transaction
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_CREATE_FORM
@P_FORMAEANO_OUT        CHAR(4)         OUTPUT,
@P_FORMAECOD_OUT        CHAR(6)         OUTPUT,
@P_FORMAENOM            VARCHAR(200),
@P_FORMAEDES            VARCHAR(500),
@P_FORMAETIP            VARCHAR(20),
@P_FORMAEEST            CHAR(1),
@P_FORMAEPERMUL         BIT,
@P_FORMAEFECINI         DATETIME,
@P_FORMAEFECFIN         DATETIME,
@P_FORMAEORD            INT,
@P_CAMPOS               TT_FORMULARIO_CAMPO READONLY,
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
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TM_FORMULARIO_MAESTRO',
            @V_DEFECTO               NVARCHAR(04)   = '000001',
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
            @V_ZONA_HORARIA_LOCALE   NVARCHAR(50)   = '',
            @V_CAMPO_CODIGO          NVARCHAR(6)    = '',
            @V_CONTADOR_CAMPO        INT = 1

    -- Validate form doesn't already exist
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE FORMAENOM = ''' + LTRIM(RTRIM(UPPER(@P_FORMAENOM))) + ''' AND ' + 
                 ' ESTREG <> ''E'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'A form with the same name already exists'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    -- Validate fields were provided
    IF NOT EXISTS (SELECT 1 FROM @P_CAMPOS)
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'At least one field must be added to the form'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    BEGIN TRANSACTION

    -- Generate code for master form
    EXEC SP_GENERAR_CODIGO_CON_ANIO @V_DEFECTO, 'TM_FORMULARIO_MAESTRO', 'FORMAECOD','FORMAEANO', @V_CODIGO = @V_CODIGO_GENERADO OUTPUT
    SET @P_FORMAEANO_OUT = CAST(YEAR(SYSDATETIME()) AS CHAR(4))
    SET @P_FORMAECOD_OUT = @V_CODIGO_GENERADO

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                              @P_USECOD_U,
                              @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
                              @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
                              @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- Insert master form
    INSERT INTO TM_FORMULARIO_MAESTRO (
        FORMAEANO, FORMAECOD, FORMAENOM, FORMAEDES, FORMAETIP, FORMAEEST, FORMAEPERMUL,
        FORMAEFECINI, FORMAEFECFIN, FORMAEORD, USUING, FECING, ZONING, USUMOD, FECMOD, ZONMOD, ESTREG
    ) VALUES (
        YEAR(SYSDATETIME()),
        @V_CODIGO_GENERADO,
        UPPER(@P_FORMAENOM),
        UPPER(ISNULL(@P_FORMAEDES, '')),
        UPPER(@P_FORMAETIP),
        UPPER(@P_FORMAEEST),
        @P_FORMAEPERMUL,
        @P_FORMAEFECINI,
        @P_FORMAEFECFIN,
        ISNULL(@P_FORMAEORD, 1),
        UPPER(@P_USEING),
        SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
        UPPER(@V_ZONA_HORARIA_NOMBRE),
        UPPER(@P_USEING),
        SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
        UPPER(@V_ZONA_HORARIA_NOMBRE),
        'I'
    )

    -- Insert form fields using cursor
    DECLARE campo_cursor CURSOR FOR
    SELECT FORCAMNOM, FORCAMETI, FORCAMTIP, FORCAMREQ, FORCAMORD, FORCAMOPC, FORCAMVAL, 
           FORCAMPLA, FORCAMAYU, FORCAMCOL, FORCAMMIN, FORCAMMAX, FORCAMPAT, FORCAMMSGERR,
           FORCAMEST, FORCAMVIS, FORCAMEDI
    FROM @P_CAMPOS
    ORDER BY FORCAMORD

    DECLARE @FORCAMNOM VARCHAR(100), @FORCAMETI VARCHAR(100), @FORCAMTIP VARCHAR(20),
            @FORCAMREQ BIT, @FORCAMORD INT, @FORCAMOPC VARCHAR(MAX), @FORCAMVAL VARCHAR(500),
            @FORCAMPLA VARCHAR(100), @FORCAMAYU VARCHAR(500), @FORCAMCOL INT,
            @FORCAMMIN INT, @FORCAMMAX INT, @FORCAMPAT VARCHAR(200), @FORCAMMSGERR VARCHAR(200),
            @FORCAMEST CHAR(1), @FORCAMVIS BIT, @FORCAMEDI BIT

    OPEN campo_cursor
    FETCH NEXT FROM campo_cursor INTO @FORCAMNOM, @FORCAMETI, @FORCAMTIP, @FORCAMREQ, @FORCAMORD, 
                                      @FORCAMOPC, @FORCAMVAL, @FORCAMPLA, @FORCAMAYU, @FORCAMCOL,
                                      @FORCAMMIN, @FORCAMMAX, @FORCAMPAT, @FORCAMMSGERR,
                                      @FORCAMEST, @FORCAMVIS, @FORCAMEDI

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Generate code for each field
        EXEC SP_GENERAR_CODIGO_CON_ANIO @V_DEFECTO, 'TM_FORMULARIO_CAMPO', 'FORCAMCOD','FORCAMANO', @V_CODIGO = @V_CAMPO_CODIGO OUTPUT

        -- Insert field
        INSERT INTO TM_FORMULARIO_CAMPO (
            FORMAEANO, FORMAECOD, FORCAMANO, FORCAMCOD, FORCAMNOM, FORCAMETI, FORCAMTIP, FORCAMREQ, FORCAMORD,
            FORCAMOPC, FORCAMVAL, FORCAMPLA, FORCAMAYU, FORCAMCOL, FORCAMMIN, FORCAMMAX, FORCAMPAT, FORCAMMSGERR,
            FORCAMEST, FORCAMVIS, FORCAMEDI, USUING, FECING, ZONING, USUMOD, FECMOD, ZONMOD, ESTREG
        ) VALUES (
            YEAR(SYSDATETIME()),
            @V_CODIGO_GENERADO,
            YEAR(SYSDATETIME()),
            @V_CAMPO_CODIGO,
            UPPER(@FORCAMNOM),
            UPPER(@FORCAMETI),
            UPPER(@FORCAMTIP),
            @FORCAMREQ,
            @FORCAMORD,
            UPPER(ISNULL(@FORCAMOPC, '')),
            UPPER(ISNULL(@FORCAMVAL, '')),
            UPPER(ISNULL(@FORCAMPLA, '')),
            UPPER(ISNULL(@FORCAMAYU, '')),
            ISNULL(@FORCAMCOL, 12),
            @FORCAMMIN,
            @FORCAMMAX,
            UPPER(ISNULL(@FORCAMPAT, '')),
            UPPER(ISNULL(@FORCAMMSGERR, '')),
            UPPER(ISNULL(@FORCAMEST, 'A')),
            ISNULL(@FORCAMVIS, 1),
            ISNULL(@FORCAMEDI, 1),
            UPPER(@P_USEING),
            SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
            UPPER(@V_ZONA_HORARIA_NOMBRE),
            UPPER(@P_USEING),
            SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
            UPPER(@V_ZONA_HORARIA_NOMBRE),
            'I'
        )

        SET @V_CONTADOR_CAMPO = @V_CONTADOR_CAMPO + 1
        FETCH NEXT FROM campo_cursor INTO @FORCAMNOM, @FORCAMETI, @FORCAMTIP, @FORCAMREQ, @FORCAMORD, 
                                          @FORCAMOPC, @FORCAMVAL, @FORCAMPLA, @FORCAMAYU, @FORCAMCOL,
                                          @FORCAMMIN, @FORCAMMAX, @FORCAMPAT, @FORCAMMSGERR,
                                          @FORCAMEST, @FORCAMVIS, @FORCAMEDI
    END

    CLOSE campo_cursor
    DEALLOCATE campo_cursor

    COMMIT TRANSACTION

    -- Generate success message
    SET @V_SQL_MENSAJE = '  SELECT ' + 
                         '  @V_CADENA = ''FORM ['' + FOR.FORMAENOM  + ''] WITH '' + CAST(COUNT(CAM.FORCAMCOD) AS VARCHAR) + '' FIELDS'' ' +
                         '  FROM TM_FORMULARIO_MAESTRO AS FOR ' +
                         '  LEFT JOIN TM_FORMULARIO_CAMPO AS CAM ON FOR.FORMAEANO = CAM.FORMAEANO AND FOR.FORMAECOD = CAM.FORMAECOD AND CAM.ESTREG <> ''E'' ' +
                         '  WHERE FOR.FORMAEANO = YEAR(SYSDATETIME()) AND FOR.FORMAECOD = ''' + @V_CODIGO_GENERADO + ''' ' +
                         '  GROUP BY FOR.FORMAENOM'

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    SET @V_DESCRIPCION_LOG = 'CREATED ' + @V_CADENA
    SET @V_CODIGO_COMPLETO = CAST(YEAR(SYSDATETIME()) AS VARCHAR) + @V_CODIGO_GENERADO

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

    SET @P_DESCRIPCION_MENSAJE  = 'Form created successfully with ' + CAST(@V_CONTADOR_CAMPO - 1 AS VARCHAR) + ' fields'
    SET @P_TIPO_MENSAJE         = '3'

    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL  @V_CODIGO_LOG_ANIO,@V_CODIGO_LOG,@V_SQL

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

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
