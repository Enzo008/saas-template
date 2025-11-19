-- *****************************************************************************************************
-- Descripción       : Obtener permisos de un usuario específico (para validación en backend)
-- Creado por        : Enzo Gago Aguirre
-- Fecha de Creación : 10/11/2025
-- Modificado        : 
-- Acción a Realizar : Retornar menús y permisos activos del usuario para validación de autorización
-- *****************************************************************************************************

CREATE OR ALTER PROCEDURE SP_GET_USER_PERMISSIONS
    @P_USEYEA CHAR(4),
    @P_USECOD CHAR(6)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @V_ROLCOD VARCHAR(2)

        -- Obtener el rol del usuario
        SELECT @V_ROLCOD = ROLCOD
        FROM TM_USER 
        WHERE USEYEA = @P_USEYEA 
        AND USECOD = @P_USECOD
        AND STAREG <> 'D'
        AND USESTA = 'A'

        -- Retornar menús con sus permisos activos
        SELECT 
            M.MENYEA,
            M.MENCOD,
            M.MENNAM,
            M.MENREF,
            M.MENYEAPAR,
            M.MENCODPAR,
            M.MENICO,
            -- Marcar si el menú está activo para el usuario
            CAST(1 AS BIT) AS hasActive,
            -- Subconsulta para obtener permisos activos de este menú
            (SELECT 
                P.PERCOD,
                P.PERNAM,
                P.PERREF,
                -- Marcar si el permiso está activo (hasActive)
                CASE 
                    -- Rol Admin (01) tiene todos los permisos
                    WHEN @V_ROLCOD = '01' THEN CAST(1 AS BIT)
                    -- Verificar si el usuario tiene este permiso asignado
                    WHEN EXISTS (
                        SELECT 1 
                        FROM TV_USER_PERMISSION UP
                        WHERE UP.USEYEA = @P_USEYEA
                        AND UP.USECOD = @P_USECOD
                        AND UP.MENYEA = M.MENYEA
                        AND UP.MENCOD = M.MENCOD
                        AND UP.PERCOD = P.PERCOD
                        AND UP.STAREG <> 'D'
                    ) THEN CAST(1 AS BIT)
                    -- Verificar si el rol tiene este permiso asignado
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
            -- Admin ve todos los menús
            (@V_ROLCOD = '01' AND M.STAREG <> 'D')
            OR
            -- Otros usuarios solo ven menús asignados
            EXISTS (
                SELECT 1
                FROM TV_USER_MENU MU
                WHERE MU.MENYEA = M.MENYEA
                AND MU.MENCOD = M.MENCOD
                AND MU.USEYEA = @P_USEYEA
                AND MU.USECOD = @P_USECOD
                AND MU.STAREG <> 'D'
            )
        ORDER BY M.MENORD
        FOR JSON PATH;

    END TRY
    BEGIN CATCH
        -- En caso de error, retornar array vacío
        SELECT '[]' AS Result;
    END CATCH
END
GO
