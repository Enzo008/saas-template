-- *****************************************************************************************************
-- Description       : Create new position
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Insert a new position/job title
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_CREATE_POSITION
@P_POSNAM               VARCHAR  (100),
@P_USECRE               VARCHAR  (50),
@P_LOGIPMAC             VARCHAR  (15),
@P_USEYEA_U             CHAR     (4),
@P_USECOD_U             CHAR     (6),
@P_USENAM_U             VARCHAR  (30),
@P_USELASNAM_U          VARCHAR  (30),
@P_MESSAGE_DESCRIPTION  NVARCHAR (MAX)  OUTPUT,
@P_MESSAGE_TYPE         CHAR     (1)    OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

DECLARE  @V_SQL                   NVARCHAR(MAX)  = '',
            @V_SQL_MESSAGE        NVARCHAR(MAX)  = '',
            @V_NAME_TABLE         NVARCHAR(300)  = 'TB_POSITION',
            @V_DEFAULT            NVARCHAR(2)    = '01',
            @V_CODE_GENERATE      NVARCHAR(300)  = '',
            @V_CODE_LOG_YEAR      CHAR    (4)    = '',
            @V_CODE_LOG           CHAR    (10)   = '',
            @V_TOTAL_RECORD       INT,
            @V_DESCRIPTION_LOG    NVARCHAR(300)  = '',
            @V_ERROR              NVARCHAR(MAX)  = '',
            @V_STRING             NVARCHAR(MAX)  = '',
            @V_CODE_COMPLETE      NVARCHAR(20)  = '',
            @V_TIME_ZONE_OFFSET   NVARCHAR(6)  = '',
            @V_TIME_ZONE_NAME     NVARCHAR(50)  = '',
            @V_TIME_ZONE_LOCALE   NVARCHAR(50)  = ''

    SET     @V_SQL = ' SELECT @V_TOTAL_RECORD = COUNT(*) ' +
                     ' FROM ' + @V_NAME_TABLE + 
                     ' WHERE POSNAM = ''' + LTRIM(RTRIM(UPPER(@P_POSNAM))) + ''' AND ' + 
                     ' STAREG <> ''D'' ';

    EXEC sp_executesql @V_SQL, N'@V_TOTAL_RECORD INT OUTPUT', @V_TOTAL_RECORD OUTPUT

    IF @V_TOTAL_RECORD > 0
    BEGIN
       SET @P_MESSAGE_DESCRIPTION  = 'El Registro ya existe en la Base de Datos'
       SET @P_MESSAGE_TYPE         = '2'
       RETURN
    END

    BEGIN
       EXEC SP_GENERATE_CODE @V_DEFAULT,
                              'TB_POSITION',
                              'POSCOD',
                              @V_CODE= @V_CODE_GENERATE OUTPUT

       EXEC SP_GET_USER_TIMEZONE @P_USEYEA_U,
                                            @P_USECOD_U,
                                            @P_LOCOFFZON = @V_TIME_ZONE_OFFSET OUTPUT,
                                            @P_LOCLOC = @V_TIME_ZONE_LOCALE OUTPUT,
                                            @P_LOCNAMZON = @V_TIME_ZONE_NAME OUTPUT

       SET @V_SQL = ' INSERT INTO TB_POSITION (' +
                           'POSCOD,'+ 
                           'POSNAM,'+
                           'USECRE,' +
                           'DATCRE,' +
                           'USEUPD,' +
                           'DATUPD,' +
                           'STAREG' +
                     ' ) VALUES ( ' + 
                           '''' + LTRIM(RTRIM(UPPER(@V_CODE_GENERATE))) + ''',' +
                           '''' + LTRIM(RTRIM(UPPER(@P_POSNAM))) + ''',' +
                           '''' + LTRIM(RTRIM(UPPER(@P_USECRE))) + ''',' +
                           'SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                           '''' + LTRIM(RTRIM(UPPER(@P_USECRE))) + ''',' +
                           'SWITCHOFFSET(SYSDATETIME(), ''' + @V_TIME_ZONE_OFFSET + '''),' +
                           '''C'')'

       EXEC sp_executesql @V_SQL

       SET @V_SQL_MESSAGE = '  SELECT ' + 
                            '  @V_STRING = ''LA POSICION ['' + POS.POSNAM + '']'' ' +
                            '  FROM TB_POSITION AS POS ' +
                            '  WHERE POS.POSCOD = ' + @V_CODE_GENERATE

       EXEC sp_executesql @V_SQL_MESSAGE, N'@V_STRING NVARCHAR(MAX) OUTPUT', @V_STRING OUTPUT

       SET @V_DESCRIPTION_LOG = 'REGISTRO ' + @V_STRING
       SET @V_CODE_COMPLETE = @V_CODE_GENERATE

       EXEC SP_REGISTER_LOG  @V_DESCRIPTION_LOG,
                              'CREATE',
                              @P_LOGIPMAC,
                              @V_CODE_COMPLETE,
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

       SET @P_MESSAGE_DESCRIPTION  = 'La Posicion se registro correctamente'
       SET @P_MESSAGE_TYPE         = '3'

       EXEC SP_UPDATE_DATE_END_SQL  @V_CODE_LOG_YEAR,@V_CODE_LOG,@V_SQL
    END
END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTER_LOG  @V_ERROR,
                              'CREATE',
                              @P_LOGIPMAC,
                              @V_CODE_COMPLETE,
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
