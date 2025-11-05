-- *****************************************************************************************************
-- Description       : User-defined table type for user menu and permission assignments
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Handle menu and permission assignments for users in multi-step operations
-- *****************************************************************************************************

CREATE TYPE TT_USER_MENU_PERMISSION AS TABLE
(
    MENYEA      CHAR(4),        -- Menu year
    MENCOD      CHAR(6),        -- Menu code
    PERCOD      CHAR(2)         -- Permission code (01=CREATE, 02=UPDATE, 03=DELETE, 04=READ, etc.)
)
GO
