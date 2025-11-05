-- *****************************************************************************************************
-- Description       : Update existing form with fields
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 20/10/2025
-- Purpose           : Update form and manage fields (delete removed, update existing, insert new)
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_UPDATE_FORM
@P_FORMAEANO            CHAR(4),
@P_FORMAECOD            CHAR(6),
@P_FORMAENOM            VARCHAR(200),
@P_FORMAEDES            VARCHAR(500),
@P_FORMAETIP            VARCHAR(20),
@P_FORMAEEST            CHAR(1),
@P_FORMAEPERMUL         BIT,
@P_FORMAEFECINI         DATETIME,
@P_FORMAEFECFIN         DATETIME,
@P_FORMAEORD            INT,
@P_CAMPOS               TT_FORMULARIO_CAMPO READONLY,
@P_USEMOD               VARCHAR(50),
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
            @V_CAMPOS_MODIFICADOS    INT = 0,
            @V_CAMPOS_INSERTADOS     INT = 0,
            @V_CAMPOS_ELIMINADOS     INT = 0

    -- Validate form exists
    SELECT @V_CANTIDAD_REGISTRO = COUNT(*)
    FROM TM_FORMULARIO_MAESTRO
    WHERE FORMAEANO = @P_FORMAEANO 
      AND FORMAECOD = @P_FORMAECOD 
      AND ESTREG <> 'E'

    IF @V_CANTIDAD_REGISTRO = 0
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'The form you are trying to update does not exist'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    -- Validate no other form has the same name (excluding current)
    SELECT @V_CANTIDAD_REGISTRO = COUNT(*)
    FROM TM_FORMULARIO_MAESTRO
    WHERE FORMAENOM = UPPER(@P_FORMAENOM)
      AND NOT (FORMAEANO = @P_FORMAEANO AND FORMAECOD = @P_FORMAECOD)
      AND ESTREG <> 'E'

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'Another form with the same name already exists'
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

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                              @P_USECOD_U,
                              @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
                              @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
                              @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- ============================================================
    -- 1. UPDATE MASTER FORM
    -- ============================================================
    UPDATE TM_FORMULARIO_MAESTRO 
    SET FORMAENOM = UPPER(@P_FORMAENOM),
        FORMAEDES = UPPER(ISNULL(@P_FORMAEDES, '')),
        FORMAETIP = UPPER(@P_FORMAETIP),
        FORMAEEST = UPPER(@P_FORMAEEST),
        FORMAEPERMUL = @P_FORMAEPERMUL,
        FORMAEFECINI = @P_FORMAEFECINI,
        FORMAEFECFIN = @P_FORMAEFECFIN,
        FORMAEORD = ISNULL(@P_FORMAEORD, 1),
        USUMOD = UPPER(@P_USEMOD),
        FECMOD = SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
        ZONMOD = UPPER(@V_ZONA_HORARIA_NOMBRE)
    WHERE FORMAEANO = @P_FORMAEANO 
      AND FORMAECOD = @P_FORMAECOD 
      AND ESTREG <> 'E'

    -- ============================================================
    -- 2. DELETE FIELDS NOT IN @P_CAMPOS
    -- ============================================================
    UPDATE TM_FORMULARIO_CAMPO 
    SET ESTREG = 'E',
        USUMOD = @P_USEMOD,
        FECMOD = SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
        ZONMOD = @V_ZONA_HORARIA_NOMBRE
    WHERE FORMAEANO = @P_FORMAEANO 
      AND FORMAECOD = @P_FORMAECOD 
      AND ESTREG <> 'E'
      AND NOT EXISTS (
          SELECT 1 FROM @P_CAMPOS 
          WHERE FORCAMANO = TM_FORMULARIO_CAMPO.FORCAMANO 
            AND FORCAMCOD = TM_FORMULARIO_CAMPO.FORCAMCOD
      )

    SET @V_CAMPOS_ELIMINADOS = @@ROWCOUNT

    -- ============================================================
    -- 3. PROCESS FIELDS: UPDATE EXISTING OR INSERT NEW
    -- ============================================================
    DECLARE campo_cursor CURSOR FOR
    SELECT FORCAMANO, FORCAMCOD, FORCAMNOM, FORCAMETI, FORCAMTIP, FORCAMREQ, FORCAMORD, 
           FORCAMOPC, FORCAMVAL, FORCAMPLA, FORCAMAYU, FORCAMCOL, FORCAMMIN, FORCAMMAX, 
           FORCAMPAT, FORCAMMSGERR, FORCAMEST, FORCAMVIS, FORCAMEDI
    FROM @P_CAMPOS
    ORDER BY FORCAMORD

    DECLARE @FORCAMANO_P VARCHAR(4), @FORCAMCOD_P VARCHAR(6), @FORCAMNOM VARCHAR(100), 
            @FORCAMETI VARCHAR(100), @FORCAMTIP VARCHAR(20), @FORCAMREQ BIT, @FORCAMORD INT, 
            @FORCAMOPC VARCHAR(MAX), @FORCAMVAL VARCHAR(500), @FORCAMPLA VARCHAR(100), 
            @FORCAMAYU VARCHAR(500), @FORCAMCOL INT, @FORCAMMIN INT, @FORCAMMAX INT, 
            @FORCAMPAT VARCHAR(200), @FORCAMMSGERR VARCHAR(200), @FORCAMEST CHAR(1), 
            @FORCAMVIS BIT, @FORCAMEDI BIT, @V_CAMPO_EXISTE INT

    OPEN campo_cursor
    FETCH NEXT FROM campo_cursor INTO @FORCAMANO_P, @FORCAMCOD_P, @FORCAMNOM, @FORCAMETI, @FORCAMTIP, 
                                      @FORCAMREQ, @FORCAMORD, @FORCAMOPC, @FORCAMVAL, @FORCAMPLA, 
                                      @FORCAMAYU, @FORCAMCOL, @FORCAMMIN, @FORCAMMAX, @FORCAMPAT, 
                                      @FORCAMMSGERR, @FORCAMEST, @FORCAMVIS, @FORCAMEDI

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Check if field exists (has FORCAMANO and FORCAMCOD)
        SET @V_CAMPO_EXISTE = 0
        
        IF @FORCAMANO_P IS NOT NULL AND @FORCAMCOD_P IS NOT NULL AND @FORCAMANO_P <> '' AND @FORCAMCOD_P <> ''
        BEGIN
            SELECT @V_CAMPO_EXISTE = COUNT(*)
            FROM TM_FORMULARIO_CAMPO
            WHERE FORMAEANO = @P_FORMAEANO 
              AND FORMAECOD = @P_FORMAECOD
              AND FORCAMANO = @FORCAMANO_P 
              AND FORCAMCOD = @FORCAMCOD_P
              AND ESTREG <> 'E'
        END

        IF @V_CAMPO_EXISTE > 0
        BEGIN
            -- ============================================================
            -- CASE 1: EXISTING FIELD - UPDATE
            -- ============================================================
            UPDATE TM_FORMULARIO_CAMPO 
            SET FORCAMNOM = UPPER(@FORCAMNOM),
                FORCAMETI = UPPER(@FORCAMETI),
                FORCAMTIP = UPPER(@FORCAMTIP),
                FORCAMREQ = @FORCAMREQ,
                FORCAMORD = @FORCAMORD,
                FORCAMOPC = UPPER(ISNULL(@FORCAMOPC, '')),
                FORCAMVAL = UPPER(ISNULL(@FORCAMVAL, '')),
                FORCAMPLA = UPPER(ISNULL(@FORCAMPLA, '')),
                FORCAMAYU = UPPER(ISNULL(@FORCAMAYU, '')),
                FORCAMCOL = ISNULL(@FORCAMCOL, 12),
                FORCAMMIN = @FORCAMMIN,
                FORCAMMAX = @FORCAMMAX,
                FORCAMPAT = UPPER(ISNULL(@FORCAMPAT, '')),
                FORCAMMSGERR = UPPER(ISNULL(@FORCAMMSGERR, '')),
                FORCAMEST = UPPER(ISNULL(@FORCAMEST, 'A')),
                FORCAMVIS = ISNULL(@FORCAMVIS, 1),
                FORCAMEDI = ISNULL(@FORCAMEDI, 1),
                USUMOD = UPPER(@P_USEMOD),
                FECMOD = SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
                ZONMOD = UPPER(@V_ZONA_HORARIA_NOMBRE)
            WHERE FORMAEANO = @P_FORMAEANO 
              AND FORMAECOD = @P_FORMAECOD 
              AND FORCAMANO = @FORCAMANO_P 
              AND FORCAMCOD = @FORCAMCOD_P 
              AND ESTREG <> 'E'

            SET @V_CAMPOS_MODIFICADOS = @V_CAMPOS_MODIFICADOS + 1
        END
        ELSE
        BEGIN
            -- ============================================================
            -- CASE 2: NEW FIELD - INSERT
            -- ============================================================
            -- Generate code for new field
            EXEC SP_GENERAR_CODIGO_CON_ANIO @V_DEFECTO, 'TM_FORMULARIO_CAMPO', 'FORCAMCOD','FORCAMANO', @V_CODIGO = @V_CAMPO_CODIGO OUTPUT

            INSERT INTO TM_FORMULARIO_CAMPO (
                FORMAEANO, FORMAECOD, FORCAMANO, FORCAMCOD, FORCAMNOM, FORCAMETI, FORCAMTIP, FORCAMREQ, FORCAMORD,
                FORCAMOPC, FORCAMVAL, FORCAMPLA, FORCAMAYU, FORCAMCOL, FORCAMMIN, FORCAMMAX, FORCAMPAT, FORCAMMSGERR,
                FORCAMEST, FORCAMVIS, FORCAMEDI, USUING, FECING, ZONING, USUMOD, FECMOD, ZONMOD, ESTREG
            ) VALUES (
                @P_FORMAEANO,
                @P_FORMAECOD,
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
                UPPER(@P_USEMOD),
                SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
                UPPER(@V_ZONA_HORARIA_NOMBRE),
                UPPER(@P_USEMOD),
                SWITCHOFFSET(SYSDATETIME(), @V_ZONA_HORARIA_OFFSET),
                UPPER(@V_ZONA_HORARIA_NOMBRE),
                'I'
            )

            SET @V_CAMPOS_INSERTADOS = @V_CAMPOS_INSERTADOS + 1
        END

        FETCH NEXT FROM campo_cursor INTO @FORCAMANO_P, @FORCAMCOD_P, @FORCAMNOM, @FORCAMETI, @FORCAMTIP, 
                                          @FORCAMREQ, @FORCAMORD, @FORCAMOPC, @FORCAMVAL, @FORCAMPLA, 
                                          @FORCAMAYU, @FORCAMCOL, @FORCAMMIN, @FORCAMMAX, @FORCAMPAT, 
                                          @FORCAMMSGERR, @FORCAMEST, @FORCAMVIS, @FORCAMEDI
    END

    CLOSE campo_cursor
    DEALLOCATE campo_cursor

    COMMIT TRANSACTION

    -- Generate success message
    SET @V_CADENA = 'FORM [' + @P_FORMAENOM + '] - Modified: ' + CAST(@V_CAMPOS_MODIFICADOS AS VARCHAR) + 
                    ', Inserted: ' + CAST(@V_CAMPOS_INSERTADOS AS VARCHAR) + 
                    ', Deleted: ' + CAST(@V_CAMPOS_ELIMINADOS AS VARCHAR)
    
    SET @V_DESCRIPCION_LOG = 'UPDATED ' + @V_CADENA
    SET @V_CODIGO_COMPLETO = @P_FORMAEANO + @P_FORMAECOD

    -- Register log
    EXEC SP_REGISTRAR_LOG  @V_DESCRIPCION_LOG,
                           'UPDATE',
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

    SET @P_DESCRIPCION_MENSAJE  = 'Form updated successfully'
    SET @P_TIPO_MENSAJE         = '3'

    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL  @V_CODIGO_LOG_ANIO,@V_CODIGO_LOG,@V_SQL

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG  @V_ERROR,
                           'UPDATE',
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
