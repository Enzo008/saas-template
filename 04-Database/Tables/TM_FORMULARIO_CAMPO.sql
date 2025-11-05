-- =============================================
-- Autor:           Enzo Gago Aguirre
-- Fecha Creación:  2025-11-05
-- Descripción:     Tabla para almacenar campos de formularios dinámicos del sistema
-- Modificaciones:  [Date] - [Author] - [Description]
-- =============================================

CREATE TABLE TM_FORMULARIO_CAMPO (
    -- Campos de identificación principal (clave compuesta)
    FORMAEANO CHAR(4) NOT NULL,                    -- Año del formulario (FK)
    FORMAECOD CHAR(6) NOT NULL,                -- Código del formulario (FK)
    FORCAMANO CHAR(4) NOT NULL,                -- Año del campo
    FORCAMCOD CHAR(6) NOT NULL,                -- Código del campo
    
    -- Información básica del campo
    FORCAMNOM VARCHAR(100),               -- Nombre del campo
    FORCAMETI VARCHAR(100),               -- Etiqueta a mostrar en la UI
    FORCAMTIP VARCHAR(20),                -- Tipo de campo (TEXT, SELECT, RADIO, etc.)
    FORCAMREQ BIT,              -- Campo requerido (0=No, 1=Sí)
    FORCAMORD INT,              -- Orden del campo en el formulario
    
    -- Configuración avanzada del campo
    FORCAMOPC TEXT,                           -- Opciones para SELECT/RADIO (JSON)
    FORCAMVAL VARCHAR(500),                   -- Valor por defecto
    FORCAMPLA VARCHAR(100),                   -- Placeholder para mostrar
    FORCAMAYU VARCHAR(500),                   -- Texto de ayuda/descripción
    FORCAMCOL INT,                 -- Ancho de columna (1-12, sistema grid)
    
    -- Validaciones y restricciones
    FORCAMMIN INT,                            -- Valor/longitud mínima
    FORCAMMAX INT,                            -- Valor/longitud máxima
    FORCAMPAT VARCHAR(200),                   -- Patrón de validación (regex)
    FORCAMMSGERR VARCHAR(200),                -- Mensaje de error personalizado
    
    -- Estado y configuración
    FORCAMEST CHAR(1),        -- Estado (A=Activo, I=Inactivo)
    FORCAMVIS BIT,              -- Visible en el formulario
    FORCAMEDI BIT,              -- Editable por el usuario
    
    -- Campos de auditoría estándar
    USUING VARCHAR(50),                -- Usuario que creó el registro
    FECING DATETIME,                   -- Fecha/hora de creación (timezone del usuario)
    ZONING VARCHAR(50),                -- Zona horaria del usuario que creó el registro
    USUMOD VARCHAR(50),                    -- Usuario que modificó el registro
    FECMOD DATETIME,                       -- Fecha/hora de modificación (timezone del usuario)
    ZONMOD VARCHAR(50),                -- Zona horaria del usuario que modificó el registro
    ESTREG CHAR(1),       -- Estado del registro (I=Ingresado, M=Modificado, E=Eliminado)
    -- Definición de clave primaria compuesta
    CONSTRAINT PK_TM_FORMULARIO_CAMPO PRIMARY KEY (FORMAEANO, FORMAECOD, FORCAMANO, FORCAMCOD),
    
    -- Clave foránea al formulario maestro
    CONSTRAINT FK_TM_FORMULARIO_CAMPO_MAESTRO FOREIGN KEY (FORMAEANO, FORMAECOD) REFERENCES TM_FORMULARIO (FORMAEANO, FORMAECOD) ON DELETE CASCADE,
);