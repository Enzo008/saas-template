-- =============================================
-- Autor:			Sistema
-- Fecha Creación:	2025-01-17
-- Descripción:		Procedimiento para obtener información completa de localización del usuario
-- =============================================
CREATE OR ALTER PROCEDURE SP_OBTENER_INFO_LOCALIZACION_USUARIO
    @P_USUANO CHAR(4),
    @P_USUCOD CHAR(6),
    @P_UBIOFFZON VARCHAR(6) OUTPUT,
    @P_UBILOC VARCHAR(5) OUTPUT,
    @P_UBINOMZON VARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        @P_UBIOFFZON = ISNULL(UBI.UBIOFFZON, '-05:00'),
        @P_UBILOC = ISNULL(UBI.UBILOC, 'PE'),
        @P_UBINOMZON = ISNULL(UBI.UBINOMZON, 'AMERICA/LIMA')
    FROM TM_USUARIO USU
    INNER JOIN TM_UBICACION UBI ON USU.UBIANO = UBI.UBIANO 
                                AND USU.UBICOD = UBI.UBICOD
    WHERE USU.USUANO = @P_USUANO 
      AND USU.USUCOD = @P_USUCOD
      AND USU.ESTREG <> 'E';
END
GO