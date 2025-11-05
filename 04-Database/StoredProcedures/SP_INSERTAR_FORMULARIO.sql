CREATE OR ALTER PROCEDURE [dbo].[SP_INSERTAR_FORMULARIO]
@P_FORMAEANO_OUT            CHAR(4) OUTPUT,
@P_FORMAECOD_OUT            CHAR(6) OUTPUT,
@P_FORMAENOM                VARCHAR(200),
@P_FORMAEDES                VARCHAR(500),
@P_FORMAETIP                VARCHAR(20),
@P_FORMAEEST                CHAR(1),
@P_FORMAEPERMUL             BIT,
@P_FORMAEFECINI             DATETIME,
@P_FORMAEFECFIN             DATETIME,
@P_FORMAEORD                INT,
@P_CAMPOS                   TT_FORMULARIO_CAMPO READONLY,
@P_USUING                   VARCHAR(50),
@P_LOGIPMAQ                 VARCHAR(15),
@P_USUANO_U                 CHAR(4),
@P_USUCOD_U                 CHAR(6),
@P_USUNOM_U                 VARCHAR(30),
@P_USUAPE_U                 VARCHAR(30),
@P_DESCRIPCION_MENSAJE      NVARCHAR(MAX) OUTPUT,
@P_TIPO_MENSAJE             CHAR(1) OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_SQL                   NVARCHAR(MAX)  = '',
            @V_SQL_MENSAJE           NVARCHAR(MAX)  = '',
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TM_FORMULARIO_MAESTRO',
            @V_DEFECTO               NVARCHAR(04)    = '000001',
            @V_CODIGO_GENERADO       NVARCHAR(300)  = '',
            @V_CODIGO_LOG_ANIO       CHAR(4)    = '',
            @V_CODIGO_LOG            CHAR(10)   = '',
            @V_CANTIDAD_REGISTRO     INT,
            @V_DESCRIPCION_LOG       NVARCHAR(300)  = '',
            @V_ERROR                 NVARCHAR(MAX)  = '',
            @V_CADENA                NVARCHAR(MAX)  = '',
            @V_CODIGO_COMPLETO       NVARCHAR(20)  = '',
            @V_ZONA_HORARIA_OFFSET   NVARCHAR(6)  = '',
            @V_ZONA_HORARIA_NOMBRE   NVARCHAR(50)  = '',
            @V_ZONA_HORARIA_LOCALE   NVARCHAR(50)  = '',
            @V_CAMPO_CODIGO          NVARCHAR(6)   = '',
            @V_CONTADOR_CAMPO        INT = 1

    -- Validar que el formulario no exista ya
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE FORMAENOM = ''' + LTRIM(RTRIM(UPPER(@P_FORMAENOM))) + ''' AND ' + 
                 ' ESTREG <> ''E'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'Ya existe un formulario con el mismo nombre'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    -- Validar que se hayan enviado campos
    IF NOT EXISTS (SELECT 1 FROM @P_CAMPOS)
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'Debe agregar al menos un campo al formulario'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    BEGIN TRANSACTION

    -- Generar código para el formulario maestro
    EXEC SP_GENERAR_CODIGO_CON_ANIO @V_DEFECTO, 'TM_FORMULARIO_MAESTRO', 'FORMAECOD','FORMAEANO', @V_CODIGO = @V_CODIGO_GENERADO OUTPUT
    SET @P_FORMAEANO_OUT = CAST(YEAR(SYSDATETIME()) AS CHAR(4))
    SET @P_FORMAECOD_OUT = @V_CODIGO_GENERADO

    -- Obtener zona horaria del usuario
    EXEC SP_GET_USER_TIMEZONE @P_USUANO_U,
                              @P_USUCOD_U,
                              @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
                              @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
                              @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- Insertar formulario maestro
    SET @V_SQL = ' INSERT INTO TM_FORMULARIO_MAESTRO (' +
                        'FORMAEANO,'+ 
                        'FORMAECOD,'+ 
                        'FORMAENOM,'+ 
                        'FORMAEDES,'+ 
                        'FORMAETIP,'+ 
                        'FORMAEEST,'+ 
                        'FORMAEPERMUL,'+ 
                        'FORMAEFECINI,'+ 
                        'FORMAEFECFIN,'+ 
                        'FORMAEORD,'+
                        'USUING,' +
                        'FECING,' +
                        'ZONING,' +
                        'USUMOD,' +
                        'FECMOD,' +
                        'ZONMOD,' +
                        'ESTREG' +
                  ' ) VALUES ( ' + 
                        ' YEAR(SYSDATETIME()),' + 
                        '''' + LTRIM(RTRIM(UPPER(@V_CODIGO_GENERADO))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_FORMAENOM))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(ISNULL(@P_FORMAEDES, '')))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_FORMAETIP))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_FORMAEEST))) + ''',' +
                        CASE WHEN @P_FORMAEPERMUL = 1 THEN '1' ELSE '0' END + ',' +
                        CASE WHEN @P_FORMAEFECINI IS NOT NULL THEN '''' + CONVERT(VARCHAR, @P_FORMAEFECINI, 120) + '''' ELSE 'NULL' END + ',' +
                        CASE WHEN @P_FORMAEFECFIN IS NOT NULL THEN '''' + CONVERT(VARCHAR, @P_FORMAEFECFIN, 120) + '''' ELSE 'NULL' END + ',' +
                        CAST(ISNULL(@P_FORMAEORD, 1) AS VARCHAR) + ',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USUING))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''',' +
                        '''' + LTRIM(RTRIM(UPPER(@P_USUING))) + ''',' +
                        'SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                        '''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''',' +
                        '''I'')'

    EXEC sp_executesql @V_SQL

    -- Insertar campos del formulario
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
        -- Generar código para cada campo
        EXEC SP_GENERAR_CODIGO_CON_ANIO @V_DEFECTO, 'TM_FORMULARIO_CAMPO', 'FORCAMCOD','FORCAMANO', @V_CODIGO = @V_CAMPO_CODIGO OUTPUT

        -- Insertar campo
        SET @V_SQL = ' INSERT INTO TM_FORMULARIO_CAMPO (' +
                            'FORMAEANO, FORMAECOD, FORCAMANO, FORCAMCOD,'+ 
                            'FORCAMNOM, FORCAMETI, FORCAMTIP, FORCAMREQ, FORCAMORD,'+ 
                            'FORCAMOPC, FORCAMVAL, FORCAMPLA, FORCAMAYU, FORCAMCOL,'+ 
                            'FORCAMMIN, FORCAMMAX, FORCAMPAT, FORCAMMSGERR,'+ 
                            'FORCAMEST, FORCAMVIS, FORCAMEDI,'+
                            'USUING, FECING, ZONING, USUMOD, FECMOD, ZONMOD, ESTREG' +
                      ' ) VALUES ( ' + 
                            ' YEAR(SYSDATETIME()),' + 
                            '''' + LTRIM(RTRIM(UPPER(@V_CODIGO_GENERADO))) + ''',' +
                            ' YEAR(SYSDATETIME()),' + 
                            '''' + LTRIM(RTRIM(UPPER(@V_CAMPO_CODIGO))) + ''',' +
                            '''' + LTRIM(RTRIM(UPPER(@FORCAMNOM))) + ''',' +
                            '''' + LTRIM(RTRIM(UPPER(@FORCAMETI))) + ''',' +
                            '''' + LTRIM(RTRIM(UPPER(@FORCAMTIP))) + ''',' +
                            CASE WHEN @FORCAMREQ = 1 THEN '1' ELSE '0' END + ',' +
                            CAST(@FORCAMORD AS VARCHAR) + ',' +
                            '''' + LTRIM(RTRIM(UPPER(ISNULL(@FORCAMOPC, '')))) + ''',' +
                            '''' + LTRIM(RTRIM(UPPER(ISNULL(@FORCAMVAL, '')))) + ''',' +
                            '''' + LTRIM(RTRIM(UPPER(ISNULL(@FORCAMPLA, '')))) + ''',' +
                            '''' + LTRIM(RTRIM(UPPER(ISNULL(@FORCAMAYU, '')))) + ''',' +
                            CAST(ISNULL(@FORCAMCOL, 12) AS VARCHAR) + ',' +
                            CASE WHEN @FORCAMMIN IS NOT NULL THEN CAST(@FORCAMMIN AS VARCHAR) ELSE 'NULL' END + ',' +
                            CASE WHEN @FORCAMMAX IS NOT NULL THEN CAST(@FORCAMMAX AS VARCHAR) ELSE 'NULL' END + ',' +
                            '''' + LTRIM(RTRIM(UPPER(ISNULL(@FORCAMPAT, '')))) + ''',' +
                            '''' + LTRIM(RTRIM(UPPER(ISNULL(@FORCAMMSGERR, '')))) + ''',' +
                            '''' + LTRIM(RTRIM(UPPER(ISNULL(@FORCAMEST, 'A')))) + ''',' +
                            CASE WHEN ISNULL(@FORCAMVIS, 1) = 1 THEN '1' ELSE '0' END + ',' +
                            CASE WHEN ISNULL(@FORCAMEDI, 1) = 1 THEN '1' ELSE '0' END + ',' +
                            '''' + LTRIM(RTRIM(UPPER(@P_USUING))) + ''',' +
                            'SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                            '''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''',' +
                            '''' + LTRIM(RTRIM(UPPER(@P_USUING))) + ''',' +
                            'SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                            '''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + ''',' +
                            '''I'')'

        EXEC sp_executesql @V_SQL

        SET @V_CONTADOR_CAMPO = @V_CONTADOR_CAMPO + 1
        FETCH NEXT FROM campo_cursor INTO @FORCAMNOM, @FORCAMETI, @FORCAMTIP, @FORCAMREQ, @FORCAMORD, 
                                          @FORCAMOPC, @FORCAMVAL, @FORCAMPLA, @FORCAMAYU, @FORCAMCOL,
                                          @FORCAMMIN, @FORCAMMAX, @FORCAMPAT, @FORCAMMSGERR,
                                          @FORCAMEST, @FORCAMVIS, @FORCAMEDI
    END

    CLOSE campo_cursor
    DEALLOCATE campo_cursor

    COMMIT TRANSACTION

    -- Generar mensaje de éxito
    SET @V_SQL_MENSAJE = '  SELECT ' + 
                         '  @V_CADENA = ''EL FORMULARIO ['' + FOR.FORMAENOM  + ''] CON '' + CAST(COUNT(CAM.FORCAMCOD) AS VARCHAR) + '' CAMPOS'' ' +
                         '  FROM TM_FORMULARIO_MAESTRO AS FOR ' +
                         '  LEFT JOIN TM_FORMULARIO_CAMPO AS CAM ON FOR.FORMAEANO = CAM.FORMAEANO AND FOR.FORMAECOD = CAM.FORMAECOD AND CAM.ESTREG <> ''E'' ' +
                         '  WHERE FOR.FORMAEANO = YEAR(SYSDATETIME()) AND FOR.FORMAECOD = ''' + @V_CODIGO_GENERADO + ''' ' +
                         '  GROUP BY FOR.FORMAENOM'

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    SET @V_DESCRIPCION_LOG = 'REGISTRÓ ' + @V_CADENA
    SET @V_CODIGO_COMPLETO = CAST(YEAR(SYSDATETIME()) AS VARCHAR) + @V_CODIGO_GENERADO

    -- Registrar log de la operación
    EXEC SP_REGISTRAR_LOG  @V_DESCRIPCION_LOG,
                           'INSERTAR',
                           @P_LOGIPMAQ,
                           @V_CODIGO_COMPLETO,
                           @V_NOMBRE_TABLA,
                           @V_SQL,
                           'EXITO',
                           @P_USUANO_U,
                           @P_USUCOD_U,
                           @P_USUNOM_U,
                           @P_USUAPE_U,
                           @P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,
                           @P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,
                           @P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,
                           @P_LOGCOD = @V_CODIGO_LOG OUTPUT

    SET @P_DESCRIPCION_MENSAJE  = 'El formulario se registró correctamente con ' + CAST(@V_CONTADOR_CAMPO - 1 AS VARCHAR) + ' campos'
    SET @P_TIPO_MENSAJE         = '3'

    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL  @V_CODIGO_LOG_ANIO,@V_CODIGO_LOG,@V_SQL

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG  @V_ERROR,
                              'INSERTAR',
                              @P_LOGIPMAQ,
                              @V_CODIGO_COMPLETO,
                              @V_NOMBRE_TABLA,
                              @V_SQL,
                              'ERROR',
                              @P_USUANO_U,
                              @P_USUCOD_U,
                              @P_USUNOM_U,
                              @P_USUAPE_U,
                              @P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,
                              @P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,
                              @P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,
                              @P_LOGCOD = @V_CODIGO_LOG OUTPUT
    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL  @V_CODIGO_LOG_ANIO,@V_CODIGO_LOG,@V_SQL
    SET @P_DESCRIPCION_MENSAJE  = @V_ERROR
    SET @P_TIPO_MENSAJE         = '1'
END CATCH