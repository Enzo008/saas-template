-- *****************************************************************************************************
-- Description       : Delete location (logical delete)
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Perform logical delete of location
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_DELETE_LOCATION
@P_LOCYEA               CHAR(4),
@P_LOCCOD               CHAR(6),
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
            @V_NOMBRE_TABLA          NVARCHAR(300)  = 'TM_LOCATION',
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

    -- Validate location exists
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM ' + @V_NOMBRE_TABLA + 
                 ' WHERE LOCYEA = ''' + LTRIM(RTRIM(@P_LOCYEA)) + ''' AND ' +
                 ' LOCCOD = ''' + LTRIM(RTRIM(@P_LOCCOD)) + ''' AND ' +
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO = 0
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'The location you are trying to delete does not exist'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    -- Check if location has child locations
    SET @V_SQL = ' SELECT @V_CANTIDAD_REGISTRO = COUNT(*) ' +
                 ' FROM TM_LOCATION ' +
                 ' WHERE LOCYEAPAR = ''' + LTRIM(RTRIM(@P_LOCYEA)) + ''' AND ' +
                 ' LOCCODPAR = ''' + LTRIM(RTRIM(@P_LOCCOD)) + ''' AND ' +
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_CANTIDAD_REGISTRO INT OUTPUT', @V_CANTIDAD_REGISTRO OUTPUT

    IF @V_CANTIDAD_REGISTRO > 0
    BEGIN
       SET @P_DESCRIPCION_MENSAJE  = 'Cannot delete location because it has child locations associated'
       SET @P_TIPO_MENSAJE         = '2'
       RETURN
    END

    -- Get user timezone
    EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                             @P_USECOD_U,
                             @P_UBIOFFZON = @V_ZONA_HORARIA_OFFSET OUTPUT,
                             @P_UBILOC = @V_ZONA_HORARIA_LOCALE OUTPUT,
                             @P_UBINOMZON = @V_ZONA_HORARIA_NOMBRE OUTPUT

    -- Get location name before deleting
    SET @V_SQL_MENSAJE = '  SELECT ' + 
                         '  @V_CADENA = ''LOCATION ['' + LOC.LOCNAM + '']'' ' +
                         '  FROM TM_LOCATION AS LOC ' +
                         '  WHERE LOC.LOCYEA = ''' + @P_LOCYEA + ''' AND ' +
                         '  LOC.LOCCOD = ''' + @P_LOCCOD + ''' '

    EXEC sp_executesql @V_SQL_MENSAJE, N'@V_CADENA NVARCHAR(MAX) OUTPUT', @V_CADENA OUTPUT

    -- Delete location (logical)
    SET @V_SQL = ' UPDATE TM_LOCATION SET ' +
                        'STAREG = ''D'',  ' +  -- D = DELETE
                        'USEUPD = ''' + LTRIM(RTRIM(UPPER(@P_USEMOD))) + ''',' +
                        'DATUPD = SWITCHOFFSET(SYSDATETIME(), ''' + @V_ZONA_HORARIA_OFFSET + '''),' +
                        'ZONUPD = ''' + LTRIM(RTRIM(UPPER(@V_ZONA_HORARIA_NOMBRE))) + '''' +
                 ' WHERE LOCYEA = ''' + LTRIM(RTRIM(@P_LOCYEA)) + ''' AND ' +
                 ' LOCCOD = ''' + LTRIM(RTRIM(@P_LOCCOD)) + ''' AND ' + 
                 ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL

    SET @V_DESCRIPCION_LOG = 'DELETED ' + @V_CADENA
    SET @V_CODIGO_COMPLETO = @P_LOCYEA + '-' + @P_LOCCOD

    -- Register log
    EXEC SP_REGISTRAR_LOG  @V_DESCRIPCION_LOG,
                           'DELETE',
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

    SET @P_DESCRIPCION_MENSAJE  = 'Location deleted successfully'
    SET @P_TIPO_MENSAJE         = '3'

    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL  @V_CODIGO_LOG_ANIO,@V_CODIGO_LOG,@V_SQL

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG  @V_ERROR,
                              'DELETE',
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
