-- *****************************************************************************************************
-- Description       : Get user timezone information
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Retrieve complete timezone information for a user based on their location
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_GET_USER_TIMEZONE
    @P_USEYEA CHAR(4),
    @P_USECOD CHAR(6),
    @P_LOCOFFZON VARCHAR(6) OUTPUT,
    @P_LOCLOC VARCHAR(5) OUTPUT,
    @P_LOCNAMZON VARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        @P_LOCOFFZON = ISNULL(LOC.LOCOFFZON, '-05:00'),
        @P_LOCLOC = ISNULL(LOC.LOCLOC, 'PE'),
        @P_LOCNAMZON = ISNULL(LOC.LOCNAMZON, 'AMERICA/LIMA')
    FROM TM_USER USU
    INNER JOIN TM_LOCATION LOC ON USU.LOCYEA = LOC.LOCYEA 
                                AND USU.LOCCOD = LOC.LOCCOD
    WHERE USU.USEYEA = @P_USEYEA 
      AND USU.USECOD = @P_USECOD
      AND USU.STAREG <> 'D';
END
GO
