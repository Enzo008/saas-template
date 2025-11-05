-- ===================================================================
-- Procedimiento: SP_ACTUALIZAR_PASSWORD_POR_EMAIL
-- Descripción: Actualiza la contraseña de un usuario por su correo electrónico
-- Parámetros: 
--   @P_EMAIL - Correo electrónico del usuario
--   @P_NEW_PASSWORD - Nueva contraseña encriptada
-- ===================================================================

CREATE OR ALTER PROCEDURE SP_ACTUALIZAR_PASSWORD_POR_EMAIL
    @P_EMAIL VARCHAR(255),
    @P_NEW_PASSWORD VARCHAR(500),
    @P_USUMOD VARCHAR(50),
    @P_LOGIPMAQ VARCHAR(15),
    @P_USUANO_U CHAR(4),
    @P_USUCOD_U CHAR(6),
    @P_USUNOM_U VARCHAR(30),
    @P_USUAPE_U VARCHAR(30),
    @P_DESCRIPCION_MENSAJE NVARCHAR(MAX) OUTPUT,
    @P_TIPO_MENSAJE CHAR(1) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UsuAno VARCHAR(4);
    DECLARE @UsuCod VARCHAR(4);
    DECLARE @RowsAffected INT;
    
    BEGIN TRY
        -- Validar parámetros de entrada
        IF @P_EMAIL IS NULL OR LTRIM(RTRIM(@P_EMAIL)) = ''
        BEGIN
            SET @P_DESCRIPCION_MENSAJE = 'Correo electrónico es requerido';
            SET @P_TIPO_MENSAJE = '1'; -- Error
            RETURN;
        END

        IF @P_NEW_PASSWORD IS NULL OR LTRIM(RTRIM(@P_NEW_PASSWORD)) = ''
        BEGIN
            SET @P_DESCRIPCION_MENSAJE = 'Nueva contraseña es requerida';
            SET @P_TIPO_MENSAJE = '1'; -- Error
            RETURN;
        END

        -- Verificar que el usuario existe y obtener sus identificadores
        SELECT @UsuAno = UsuAno, @UsuCod = UsuCod
        FROM TM_USUARIO 
        WHERE UsuCorEle = @P_EMAIL 
        AND UsuEst = 1; -- Solo usuarios activos

        IF @UsuAno IS NULL OR @UsuCod IS NULL
        BEGIN
            SET @P_DESCRIPCION_MENSAJE = 'No se encontró un usuario activo con el correo electrónico proporcionado';
            SET @P_TIPO_MENSAJE = '2'; -- Warning
            RETURN;
        END

        -- Actualizar la contraseña
        UPDATE TM_USUARIO 
        SET 
            UsuPas = @P_NEW_PASSWORD
        WHERE UsuCorEle = @P_EMAIL

        SET @RowsAffected = @@ROWCOUNT;

        -- Verificar si la actualización fue exitosa
        IF @RowsAffected > 0
        BEGIN
            SET @P_DESCRIPCION_MENSAJE = 'Contraseña actualizada exitosamente';
            SET @P_TIPO_MENSAJE = '3'; -- Success
            
            -- Log de auditoría (opcional)
            PRINT 'Contraseña actualizada para usuario: ' + @UsuAno + '-' + @UsuCod + ' (' + @P_EMAIL + ')';
        END
        ELSE
        BEGIN
            SET @P_DESCRIPCION_MENSAJE = 'No se pudo actualizar la contraseña';
            SET @P_TIPO_MENSAJE = '1'; -- Error
        END

    END TRY
    BEGIN CATCH
        -- Manejo de errores
        SET @P_DESCRIPCION_MENSAJE = 'Error interno: ' + ERROR_MESSAGE();
        SET @P_TIPO_MENSAJE = '1'; -- Error
        
        -- Log del error para debugging
        PRINT 'Error en SP_ACTUALIZAR_PASSWORD_POR_EMAIL: ' + ERROR_MESSAGE();
        
        -- Si estamos en una transacción, hacer rollback
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
    END CATCH
END
