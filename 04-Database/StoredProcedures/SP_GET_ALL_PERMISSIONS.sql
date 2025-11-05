-- *****************************************************************************************************
-- Description       : Get all available permissions in the system
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 22/10/2025
-- Purpose           : Retrieve all permission codes and names for dynamic loading
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_GET_ALL_PERMISSIONS
    @P_DESCRIPCION_MENSAJE VARCHAR(250) OUTPUT,
    @P_TIPO_MENSAJE INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Return all active permissions
        SELECT 
            PERCOD AS perCod,
            PERNOM AS perNam,
            PERREF AS perRef
        FROM TB_PERMISSION
        WHERE STAREG <> 'D'
        ORDER BY PERCOD
        FOR JSON PATH;

        SET @P_DESCRIPCION_MENSAJE = 'Permissions retrieved successfully'
        SET @P_TIPO_MENSAJE = 3
    END TRY
    BEGIN CATCH
        SET @P_DESCRIPCION_MENSAJE = ERROR_MESSAGE()
        SET @P_TIPO_MENSAJE = 1
    END CATCH
END
GO
