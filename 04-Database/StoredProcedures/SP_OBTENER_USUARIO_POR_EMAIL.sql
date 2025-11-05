-- ===================================================================
-- Procedimiento: SP_OBTENER_USUARIO_POR_EMAIL
-- Descripción: Busca un usuario por su correo electrónico
-- Parámetros: 
--   @P_EMAIL - Correo electrónico del usuario
-- ===================================================================
DECLARE @TOTAL_REGISTROS INT,
		@DESCRIPCION_MENSAJE VARCHAR(MAX),
		@TIPO_MENSAJE INT
EXEC SP_OBTENER_USUARIO_POR_EMAIL 'juan.perez@gmail.com', '192.168.1.1', '2021', '123456', 'Juan', 'Perez', @TOTAL_REGISTROS OUTPUT, @DESCRIPCION_MENSAJE OUTPUT, @TIPO_MENSAJE OUTPUT
SELECT @TOTAL_REGISTROS, @DESCRIPCION_MENSAJE, @TIPO_MENSAJE

CREATE OR ALTER PROCEDURE SP_OBTENER_USUARIO_POR_EMAIL
    @P_EMAIL VARCHAR(255),
    @P_LOGIPMAQ             VARCHAR  (15),
    @P_USUANO_U               CHAR     (4),
    @P_USUCOD_U               CHAR     (6),
    @P_USUNOM_U               VARCHAR  (30),
    @P_USUAPE_U            VARCHAR  (30),
	@P_TOTAL_RECORDS          INT             OUTPUT,
    @P_DESCRIPCION_MENSAJE VARCHAR(MAX) OUTPUT,
    @P_TIPO_MENSAJE INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar parámetros de entrada
        IF @P_EMAIL IS NULL OR LTRIM(RTRIM(@P_EMAIL)) = ''
        BEGIN
            SET @P_DESCRIPCION_MENSAJE = 'Correo electrónico es requerido';
            SET @P_TIPO_MENSAJE = 1; -- Error
            RETURN;
        END

        -- Buscar usuario por email
        SELECT 
            UsuAno,
            UsuCod,
            UsuNom,
            UsuApe,
            UsuCorEle,
            UsuPas,
            UsuEst,
            RolCod
        FROM TM_USUARIO 
        WHERE UsuCorEle = @P_EMAIL 
		FOR JSON PATH

        -- Verificar si se encontró el usuario
        IF @@ROWCOUNT > 0
        BEGIN
            SET @P_DESCRIPCION_MENSAJE = 'Usuario encontrado exitosamente';
            SET @P_TIPO_MENSAJE = 3; -- Success
        END
        ELSE
        BEGIN
            SET @P_DESCRIPCION_MENSAJE = 'No se encontró un usuario con el correo electrónico proporcionado';
            SET @P_TIPO_MENSAJE = 2; -- Warning
        END

    END TRY
    BEGIN CATCH
        -- Manejo de errores
        SET @P_DESCRIPCION_MENSAJE = 'Error interno: ' + ERROR_MESSAGE();
        SET @P_TIPO_MENSAJE = 3; -- Error
        
        -- Log del error para debugging
        PRINT 'Error en SP_OBTENER_USUARIO_POR_EMAIL: ' + ERROR_MESSAGE();
    END CATCH
END
