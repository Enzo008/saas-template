-- *****************************************************************************************************
-- Description       : Start user session (login) and return user data with menus and permissions
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Modified Date     : 22/10/2025
-- Purpose           : Validate user credentials and return user information with menus and permissions
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_START_SESSION
    @P_USEEMA VARCHAR(50),
    @P_DESCRIPCION_MENSAJE VARCHAR(250) OUTPUT,
    @P_TIPO_MENSAJE INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @V_EXISTE INT = 0
        DECLARE @V_ROLCOD VARCHAR(2)
        DECLARE @V_USEYEA CHAR(4)
        DECLARE @V_USECOD CHAR(6)

        -- Verify user exists with this email
        SELECT 
            @V_EXISTE = COUNT(1),
            @V_ROLCOD = MAX(ROLCOD),
            @V_USEYEA = MAX(USEYEA),
            @V_USECOD = MAX(USECOD)
        FROM TM_USER 
        WHERE USEEMA = @P_USEEMA 
        AND STAREG <> 'D'
        AND USESTA = 'A'

        IF @V_EXISTE > 0
        BEGIN
            -- Return user data including password hash for verification in C#
            SELECT 
                U.USEYEA,
                U.USECOD,
                U.USENAM,
                U.USELAS,
                U.USEEMA,
                U.POSCOD,
                U.ROLCOD,
                U.USESTA,
                U.USESES,
                U.USEPAS,  -- Password hash needed for verification in C#
                (
                    SELECT 
                        M.MENYEA,
                        M.MENCOD,
                        M.MENNAM,
                        M.MENREF,
                        M.MENYEAPAR,
                        M.MENCODPAR,
                        M.MENICO,
                        M.USECRE,
                        M.DATCRE,
                        M.USEUPD,
                        M.DATUPD,
                        M.STAREG,
                        -- Subquery to get permissions for this menu
                        (SELECT 
                            P.PERCOD,
                            P.PERNAM,
                            P.PERREF,
                            -- Mark if permission is assigned to user or role (hasActive)
                            CASE 
                                -- Admin (rol 01) has all permissions
                                WHEN @V_ROLCOD = '01' THEN CAST(1 AS BIT)
                                -- Check if user has this permission
                                WHEN EXISTS (
                                    SELECT 1 
                                    FROM TV_USER_PERMISSION UP
                                    WHERE UP.USEYEA = @V_USEYEA
                                    AND UP.USECOD = @V_USECOD
                                    AND UP.MENYEA = M.MENYEA
                                    AND UP.MENCOD = M.MENCOD
                                    AND UP.PERCOD = P.PERCOD
                                    AND UP.STAREG <> 'D'
                                ) THEN CAST(1 AS BIT)
                                -- Check if role has this permission
                                WHEN EXISTS (
                                    SELECT 1 
                                    FROM TV_ROLE_PERMISSION RP
                                    WHERE RP.ROLCOD = @V_ROLCOD
                                    AND RP.MENYEA = M.MENYEA
                                    AND RP.MENCOD = M.MENCOD
                                    AND RP.PERCOD = P.PERCOD
                                    AND RP.STAREG <> 'D'
                                ) THEN CAST(1 AS BIT)
                                ELSE CAST(0 AS BIT)
                            END AS hasActive
                         FROM TB_PERMISSION P
                         INNER JOIN TV_MENU_PERMISSION MP 
                            ON P.PERCOD = MP.PERCOD
                            AND MP.MENYEA = M.MENYEA
                            AND MP.MENCOD = M.MENCOD
                            AND MP.STAREG <> 'D'
                         WHERE P.STAREG <> 'D'
                         ORDER BY P.PERCOD
                         FOR JSON PATH
                        ) AS permissions
                    FROM TM_MENU M
                    WHERE 
                        (@V_ROLCOD = '01' AND M.STAREG <> 'D')
                        OR
                        EXISTS (
                            SELECT 1
                            FROM TV_USER_MENU MU
                            WHERE MU.MENYEA = M.MENYEA
                            AND MU.MENCOD = M.MENCOD
                            AND MU.USEYEA = U.USEYEA
                            AND MU.USECOD = U.USECOD
                            AND MU.STAREG <> 'D'
                        )
                    ORDER BY M.MENORD
                    FOR JSON PATH
                ) AS Menus
            FROM TM_USER U
            WHERE U.USEEMA = @P_USEEMA 
            AND U.STAREG <> 'D'
            AND U.USESTA = 'A'
            FOR JSON PATH;

            SET @P_DESCRIPCION_MENSAJE = 'User found with menus and permissions'
            SET @P_TIPO_MENSAJE = 3
        END
        ELSE
        BEGIN
            SET @P_DESCRIPCION_MENSAJE = 'User not found or inactive'
            SET @P_TIPO_MENSAJE = 2
        END
    END TRY
    BEGIN CATCH
        SET @P_DESCRIPCION_MENSAJE = ERROR_MESSAGE()
        SET @P_TIPO_MENSAJE = 1
    END CATCH
END
GO
