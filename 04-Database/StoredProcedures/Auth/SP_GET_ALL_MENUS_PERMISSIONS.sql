-- *****************************************************************************************************
-- Description       : Get all menus and permissions with assignment status
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Retrieve all available menus and permissions, marking which ones are assigned
-- *****************************************************************************************************

CREATE OR ALTER PROC SP_GET_ALL_MENUS_PERMISSIONS
@P_USEYEA               CHAR(4) = NULL,
@P_USECOD               CHAR(6) = NULL,
@P_ROLCOD               CHAR(2) = NULL,
@P_LOGIPMAC             VARCHAR(15),
@P_USEYEA_U             CHAR(4),
@P_USECOD_U             CHAR(6),
@P_USENAM_U             VARCHAR(30),
@P_USELASNAM_U             VARCHAR(30),
@P_MESSAGE_DESCRIPTION  NVARCHAR(MAX)   OUTPUT,
@P_MESSAGE_TYPE         CHAR(1)         OUTPUT,
@P_TOTAL_RECORDS      INT             OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_NAME_TABLE      NVARCHAR(300)  = 'TM_MENU, TB_PERMISSION',
            @V_CODE_LOG_YEAR   CHAR(4)        = '',
            @V_CODE_LOG        CHAR(10)       = '',
            @V_DESCRIPTION_LOG   NVARCHAR(300)  = '',
            @V_ERROR             NVARCHAR(MAX)  = ''

    SET @V_DESCRIPTION_LOG = 'GOT ALL MENUS AND PERMISSIONS WITH ASSIGNMENT STATUS'

    -- Get all menus with their available permissions and mark which ones are assigned to user or role
    SELECT 
        M.MENYEA, 
        M.MENCOD, 
        M.MENNAM, 
        M.MENREF, 
        M.MENICO, 
        M.MENORD, 
        M.MENYEAPAR, 
        M.MENCODPAR,
        -- Mark if menu is assigned to user or role (hasActive)
        CASE 
            -- Case 1: If for user
            WHEN @P_USEYEA IS NOT NULL AND @P_USECOD IS NOT NULL 
                 AND EXISTS (SELECT 1 FROM TV_USER_MENU MU 
                            WHERE MU.USEYEA = @P_USEYEA 
                              AND MU.USECOD = @P_USECOD 
                              AND MU.MENYEA = M.MENYEA 
                              AND MU.MENCOD = M.MENCOD 
                              AND MU.STAREG <> 'D')
            THEN CAST(1 AS BIT)
            -- Case 2: If for role
            WHEN @P_ROLCOD IS NOT NULL 
                 AND EXISTS (SELECT 1 FROM TV_ROLE_MENU RM 
                            WHERE RM.ROLCOD = @P_ROLCOD 
                              AND RM.MENYEA = M.MENYEA 
                              AND RM.MENCOD = M.MENCOD 
                              AND RM.STAREG <> 'D')
            THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS hasActive,
        -- Subquery to get all available permissions for this menu with their assignment status
        (SELECT 
            P.PERCOD, 
            P.PERNAM, 
            P.PERREF, 
            -- Mark if permission is assigned to user or role (hasActive)
            CASE 
                -- Case 1: If for user
                WHEN @P_USEYEA IS NOT NULL AND @P_USECOD IS NOT NULL 
                     AND EXISTS (SELECT 1 FROM TV_USER_PERMISSION PU 
                                WHERE PU.USEYEA = @P_USEYEA 
                                  AND PU.USECOD = @P_USECOD 
                                  AND PU.MENYEA = M.MENYEA 
                                  AND PU.MENCOD = M.MENCOD 
                                  AND PU.PERCOD = P.PERCOD 
                                  AND PU.STAREG <> 'D')
                THEN CAST(1 AS BIT)
                -- Case 2: If for role
                WHEN @P_ROLCOD IS NOT NULL 
                     AND EXISTS (SELECT 1 FROM TV_ROLE_PERMISSION RP 
                                WHERE RP.ROLCOD = @P_ROLCOD 
                                  AND RP.MENYEA = M.MENYEA 
                                  AND RP.MENCOD = M.MENCOD 
                                  AND RP.PERCOD = P.PERCOD 
                                  AND RP.STAREG <> 'D')
                THEN CAST(1 AS BIT)
                ELSE CAST(0 AS BIT)
            END AS hasActive
         FROM TB_PERMISSION P
         INNER JOIN TV_MENU_PERMISSION MP ON P.PERCOD = MP.PERCOD 
                                       AND MP.MENYEA = M.MENYEA 
                                       AND MP.MENCOD = M.MENCOD
         WHERE P.STAREG <> 'D' 
           AND MP.STAREG <> 'D'
         ORDER BY P.PERCOD
         FOR JSON PATH) AS permissions
    FROM TM_MENU M
    WHERE M.STAREG <> 'D'
    ORDER BY M.MENORD, M.MENNAM
    FOR JSON PATH

    SET @P_MESSAGE_DESCRIPTION = 'Menus and permissions retrieved successfully'
    SET @P_MESSAGE_TYPE = '3'
    SET @P_TOTAL_RECORDS = 0

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTER_LOG @V_ERROR,'GET',@P_LOGIPMAC,'',@V_NAME_TABLE,'SP_GET_ALL_MENUS_PERMISSIONS','ERROR',@P_USEYEA_U,@P_USECOD_U,@P_USENAM_U,@P_USELASNAM_U,@P_MESSAGE_DESCRIPTION = @P_MESSAGE_DESCRIPTION OUTPUT,@P_MESSAGE_TYPE = @P_MESSAGE_TYPE OUTPUT,@P_LOGYEA = @V_CODE_LOG_YEAR OUTPUT,@P_LOGCOD = @V_CODE_LOG OUTPUT
    EXEC SP_UPDATE_DATE_END_SQL @V_CODE_LOG_YEAR, @V_CODE_LOG, 'SP_GET_ALL_MENUS_PERMISSIONS'
    SET @P_MESSAGE_DESCRIPTION = @V_ERROR
    SET @P_MESSAGE_TYPE = '1'
END CATCH
GO
