-- =============================================
-- Tipo de tabla para pasar campos de formulario como parámetro
-- Usado en SP_INSERTAR_FORMULARIO y SP_MODIFICAR_FORMULARIO
-- =============================================
CREATE TYPE [dbo].[TT_FORMULARIO_CAMPO] AS TABLE(
    -- Identificadores del campo (para modificación - si vienen nulos es campo nuevo)
    [FORCAMANO]     VARCHAR(4)     NULL,      -- Año del campo (para campos existentes)
    [FORCAMCOD]     VARCHAR(6)     NULL,      -- Código del campo (para campos existentes)
    
    -- Información básica del campo
    [FORCAMNOM]     VARCHAR(100)   NOT NULL,  -- Nombre del campo
    [FORCAMETI]     VARCHAR(100)   NOT NULL,  -- Etiqueta a mostrar
    [FORCAMTIP]     VARCHAR(20)    NOT NULL,  -- Tipo de campo (TEXT, SELECT, etc.)
    [FORCAMREQ]     BIT            NOT NULL,  -- Campo requerido
    [FORCAMORD]     INT            NOT NULL,  -- Orden del campo
    
    -- Configuración del campo
    [FORCAMOPC]     VARCHAR(MAX)   NULL,      -- Opciones para SELECT/RADIO (JSON)
    [FORCAMVAL]     VARCHAR(500)   NULL,      -- Valor por defecto
    [FORCAMPLA]     VARCHAR(100)   NULL,      -- Placeholder
    [FORCAMAYU]     VARCHAR(500)   NULL,      -- Texto de ayuda
    [FORCAMCOL]     INT            NULL,      -- Ancho de columna (1-12)
    
    -- Validaciones
    [FORCAMMIN]     INT            NULL,      -- Valor/longitud mínima
    [FORCAMMAX]     INT            NULL,      -- Valor/longitud máxima
    [FORCAMPAT]     VARCHAR(200)   NULL,      -- Patrón de validación (regex)
    [FORCAMMSGERR]  VARCHAR(200)   NULL,      -- Mensaje de error personalizado
    
    -- Estado y configuración
    [FORCAMEST]     CHAR(1)        NULL,      -- Estado del campo (A/I)
    [FORCAMVIS]     BIT            NULL,      -- Visible en el formulario
    [FORCAMEDI]     BIT            NULL       -- Editable por el usuario
)
