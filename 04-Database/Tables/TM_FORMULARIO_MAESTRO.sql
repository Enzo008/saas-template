-- =============================================
-- Autor:           Enzo Gago Aguirre
-- Fecha Creación:  2025-11-05
-- Descripción:     Tabla maestra para almacenar formularios dinámicos del sistema
-- Modificaciones:  [Date] - [Author] - [Description]
-- =============================================

CREATE TABLE TM_FORMULARIO_MAESTRO (
    -- Campos de identificación principal (clave compuesta)
    FORMAEANO CHAR(4) NOT NULL,                    -- Año del formulario
    FORMAECOD CHAR(6) NOT NULL,                -- Código único del formulario
    
    -- Información básica del formulario
    FORMAENOM VARCHAR(200),               -- Nombre del formulario
    FORMAEDES VARCHAR(500),                   -- Descripción del formulario
    FORMAETIP VARCHAR(20), -- Tipo de formulario
    FORMAEEST CHAR(1),        -- Estado (A=Activo, I=Inactivo)
    
    -- Configuración del formulario
    FORMAEPERMUL BIT, -- Permite múltiples respuestas
    FORMAEFECINI DATETIME,                    -- Fecha inicio de vigencia
    FORMAEFECFIN DATETIME,                    -- Fecha fin de vigencia
    FORMAEORD INT,                          -- Orden de visualización
    
    -- Campos de auditoría estándar
    USUING VARCHAR(50),                -- Usuario que creó el registro
    FECING DATETIME,                   -- Fecha/hora de creación (timezone del usuario)
    ZONING VARCHAR(50),                -- Zona horaria del usuario que creó el registro
    USUMOD VARCHAR(50),                    -- Usuario que modificó el registro
    FECMOD DATETIME,                       -- Fecha/hora de modificación (timezone del usuario)
    ZONMOD VARCHAR(50),                -- Zona horaria del usuario que modificó el registro
    ESTREG CHAR(1),       -- Estado del registro (I=Ingresado, M=Modificado, E=Eliminado)
    
    -- Definición de clave primaria
    CONSTRAINT PK_TM_FORMULARIO PRIMARY KEY (FORMAEANO, FORMAECOD)
);