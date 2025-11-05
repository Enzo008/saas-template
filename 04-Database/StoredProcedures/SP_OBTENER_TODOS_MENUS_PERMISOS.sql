CREATE OR ALTER PROC SP_OBTENER_TODOS_MENUS_PERMISOS
@P_USUANO               CHAR(4) = NULL,
@P_USUCOD               CHAR(6) = NULL,
@P_ROLCOD               CHAR(2) = NULL,
@P_LOGIPMAQ             VARCHAR(15),
@P_USUANO_U             CHAR(4),
@P_USUCOD_U             CHAR(6),
@P_USUNOM_U             VARCHAR(30),
@P_USUAPE_U             VARCHAR(30),
@P_DESCRIPCION_MENSAJE  NVARCHAR(MAX)   OUTPUT,
@P_TIPO_MENSAJE         CHAR(1)         OUTPUT,
@P_TOTAL_RECORDS      INT             OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_NOMBRE_TABLA      NVARCHAR(300)  = 'TM_MENU, TB_PERMISO',
            @V_CODIGO_LOG_ANIO   CHAR(4)        = '',
            @V_CODIGO_LOG        CHAR(10)       = '',
            @V_DESCRIPCION_LOG   NVARCHAR(300)  = '',
            @V_ERROR             NVARCHAR(MAX)  = ''

    SET @V_DESCRIPCION_LOG = 'SE OBTUVIERON TODOS LOS MENUS Y PERMISOS DISPONIBLES CON ESTADO DE ASIGNACION'

    -- Obtener todos los menús con sus permisos disponibles y marcar cuáles tiene asignados el usuario o rol
    SELECT 
        M.MENANO, 
        M.MENCOD, 
        M.MENNOM, 
        M.MENREF, 
        M.MENICO, 
        M.MENORD, 
        M.MENANOPAD, 
        M.MENCODPAD,
        -- Marcar si el menú está asignado al usuario o rol (hasActive)
        CASE 
            -- Caso 1: Si es para usuario
            WHEN @P_USUANO IS NOT NULL AND @P_USUCOD IS NOT NULL 
                 AND EXISTS (SELECT 1 FROM TV_MENU_USUARIO MU 
                            WHERE MU.USUANO = @P_USUANO 
                              AND MU.USUCOD = @P_USUCOD 
                              AND MU.MENANO = M.MENANO 
                              AND MU.MENCOD = M.MENCOD 
                              AND MU.ESTREG <> 'E')
            THEN CAST(1 AS BIT)
            -- Caso 2: Si es para rol
            WHEN @P_ROLCOD IS NOT NULL 
                 AND EXISTS (SELECT 1 FROM TV_ROL_MENU RM 
                            WHERE RM.ROLCOD = @P_ROLCOD 
                              AND RM.MENANO = M.MENANO 
                              AND RM.MENCOD = M.MENCOD 
                              AND RM.ESTREG <> 'E')
            THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS hasActive,
        -- Subconsulta para obtener todos los permisos disponibles para este menú con su estado de asignación
        (SELECT 
            P.PERCOD, 
            P.PERNOM, 
            P.PERREF, 
            P.PERDES,
            -- Marcar si el permiso está asignado al usuario o rol (hasActive)
            CASE 
                -- Caso 1: Si es para usuario
                WHEN @P_USUANO IS NOT NULL AND @P_USUCOD IS NOT NULL 
                     AND EXISTS (SELECT 1 FROM TV_PERMISO_USUARIO PU 
                                WHERE PU.USUANO = @P_USUANO 
                                  AND PU.USUCOD = @P_USUCOD 
                                  AND PU.MENANO = M.MENANO 
                                  AND PU.MENCOD = M.MENCOD 
                                  AND PU.PERCOD = P.PERCOD 
                                  AND PU.ESTREG <> 'E')
                THEN CAST(1 AS BIT)
                -- Caso 2: Si es para rol
                WHEN @P_ROLCOD IS NOT NULL 
                     AND EXISTS (SELECT 1 FROM TV_ROL_PERMISO RP 
                                WHERE RP.ROLCOD = @P_ROLCOD 
                                  AND RP.MENANO = M.MENANO 
                                  AND RP.MENCOD = M.MENCOD 
                                  AND RP.PERCOD = P.PERCOD 
                                  AND RP.ESTREG <> 'E')
                THEN CAST(1 AS BIT)
                ELSE CAST(0 AS BIT)
            END AS hasActive
         FROM TB_PERMISO P
         INNER JOIN TV_MENU_PERMISO MP ON P.PERCOD = MP.PERCOD 
                                       AND MP.MENANO = M.MENANO 
                                       AND MP.MENCOD = M.MENCOD
         WHERE P.ESTREG <> 'E' 
           AND MP.ESTREG <> 'E'
         ORDER BY P.PERCOD
         FOR JSON PATH) AS permisos
    FROM TM_MENU M
    WHERE M.ESTREG <> 'E'
    ORDER BY M.MENORD, M.MENNOM
    FOR JSON PATH

    SET @P_DESCRIPCION_MENSAJE = 'Menús y permisos obtenidos exitosamente'
    SET @P_TIPO_MENSAJE = '3'
    SET @P_TOTAL_RECORDS = 0

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG @V_ERROR,'OBTENER',@P_LOGIPMAQ,'',@V_NOMBRE_TABLA,'SP_OBTENER_TODOS_MENUS_PERMISOS','ERROR',@P_USUANO_U,@P_USUCOD_U,@P_USUNOM_U,@P_USUAPE_U,@P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,@P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,@P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,@P_LOGCOD = @V_CODIGO_LOG OUTPUT
    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL @V_CODIGO_LOG_ANIO, @V_CODIGO_LOG, 'SP_OBTENER_TODOS_MENUS_PERMISOS'
    SET @P_DESCRIPCION_MENSAJE = @V_ERROR
    SET @P_TIPO_MENSAJE = '1'
END CATCH
GO
