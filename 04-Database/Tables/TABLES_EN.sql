-- *****************************************************************************************************
-- Description       : English table definitions with constraints as ALTER TABLE statements
-- Created by        : Enzo Gago Aguirre
-- Creation Date     : 09/10/2025
-- Purpose           : Create all tables with PK and FK constraints applied separately
-- *****************************************************************************************************

-- =============================================
-- TB_POSITION - Position/Job Title
-- =============================================
CREATE TABLE TB_POSITION(
    POSCOD CHAR(02) NOT NULL,
    POSNAM VARCHAR(100),
    USECRE VARCHAR(30),
    DATCRE DATETIMEOFFSET,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIMEOFFSET,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TB_POSITION
ADD CONSTRAINT PK_TB_POSITION PRIMARY KEY (POSCOD);
GO

-- =============================================
-- TB_IDENTITY_DOCUMENT - Identity Document Types
-- =============================================
CREATE TABLE TB_IDENTITY_DOCUMENT(
    IDEDOCCOD CHAR(02) NOT NULL,
    IDEDOCNAM VARCHAR(50),
    IDEDOCABR VARCHAR(50),
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TB_IDENTITY_DOCUMENT
ADD CONSTRAINT PK_TB_IDENTITY_DOCUMENT PRIMARY KEY (IDEDOCCOD);
GO

-- =============================================
-- TB_GENDER - Gender Types
-- =============================================
CREATE TABLE TB_GENDER(
    GENCOD CHAR(02) NOT NULL,
    GENNAM VARCHAR(50),
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TB_GENDER
ADD CONSTRAINT PK_TB_GENDER PRIMARY KEY (GENCOD);
GO

-- =============================================
-- TB_NATIONALITY - Nationality Types
-- =============================================
CREATE TABLE TB_NATIONALITY(
    NATCOD CHAR(02) NOT NULL,
    NATNAM VARCHAR(50),
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TB_NATIONALITY
ADD CONSTRAINT PK_TB_NATIONALITY PRIMARY KEY (NATCOD);
GO

-- =============================================
-- TB_ROLE - User Roles
-- =============================================
CREATE TABLE TB_ROLE(
    ROLCOD CHAR(02) NOT NULL,
    ROLNAM VARCHAR(50),
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TB_ROLE
ADD CONSTRAINT PK_TB_ROLE PRIMARY KEY (ROLCOD);
GO

-- =============================================
-- TB_PERMISSION - System Permissions
-- =============================================
CREATE TABLE TB_PERMISSION(
    PERCOD CHAR(02) NOT NULL,
    PERNAM VARCHAR(50),
    PERREF VARCHAR(50),
    PERDES VARCHAR(200),
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TB_PERMISSION
ADD CONSTRAINT PK_TB_PERMISSION PRIMARY KEY (PERCOD);
GO

-- =============================================
-- TM_MENU - System Menus
-- =============================================
CREATE TABLE TM_MENU(
    MENYEA CHAR(04) NOT NULL,
    MENCOD CHAR(06) NOT NULL,
    MENNAM VARCHAR(50),
    MENREF VARCHAR(50),
    MENICO VARCHAR(50),
    MENORD VARCHAR(3),
    MENYEAPAR CHAR(04),
    MENCODPAR CHAR(06),
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TM_MENU
ADD CONSTRAINT PK_TM_MENU PRIMARY KEY (MENYEA, MENCOD);

-- Foreign Keys
ALTER TABLE TM_MENU
ADD CONSTRAINT FK_TM_MENU_PARENT FOREIGN KEY (MENYEAPAR, MENCODPAR) 
    REFERENCES TM_MENU(MENYEA, MENCOD);
GO

-- =============================================
-- TM_LOCATION - Locations/Offices
-- =============================================
CREATE TABLE TM_LOCATION(
    LOCYEA CHAR(04) NOT NULL,
    LOCCOD CHAR(06) NOT NULL,
    LOCNAM VARCHAR(100),
    LOCTYP VARCHAR(50),
    LOCYEAPAR CHAR(04),
    LOCCODPAR CHAR(06),
    LOCLAT VARCHAR(20),
    LOCLON VARCHAR(20),
    LOCADD VARCHAR(200),
    LOCSTA CHAR(01),
    LOCOFFZON VARCHAR(6),
    LOCLOC VARCHAR(5),
    LOCNOMZON VARCHAR(50),
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TM_LOCATION
ADD CONSTRAINT PK_TM_LOCATION PRIMARY KEY (LOCYEA, LOCCOD);

-- Foreign Keys
ALTER TABLE TM_LOCATION
ADD CONSTRAINT FK_TM_LOCATION_PARENT FOREIGN KEY (LOCYEAPAR, LOCCODPAR) 
    REFERENCES TM_LOCATION(LOCYEA, LOCCOD);
GO

-- =============================================
-- TM_REPOSITORY - File Repositories
-- =============================================
CREATE TABLE TM_REPOSITORY(
    REPYEA CHAR(04) NOT NULL,
    REPCOD CHAR(06) NOT NULL,
    LOCYEA CHAR(04),
    LOCCOD CHAR(06),
    REPNAM VARCHAR(100),
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TM_REPOSITORY
ADD CONSTRAINT PK_TM_REPOSITORY PRIMARY KEY (REPYEA, REPCOD);

-- Foreign Keys
ALTER TABLE TM_REPOSITORY
ADD CONSTRAINT FK_TM_REPOSITORY_LOCATION FOREIGN KEY (LOCYEA, LOCCOD) 
    REFERENCES TM_LOCATION(LOCYEA, LOCCOD);
GO

-- =============================================
-- TM_USER - System Users
-- =============================================
CREATE TABLE TM_USER(
    USEYEA CHAR(04) NOT NULL,
    USECOD CHAR(06) NOT NULL,
    IDEDOCCOD CHAR(02),
    USENUMDOC VARCHAR(20),
    USENAM VARCHAR(50),
    USELAS VARCHAR(50),
    USEBIR CHAR(10),
    USESEX CHAR(01),
    USEEMA VARCHAR(50),
    POSCOD CHAR(02),
    USEPHO VARCHAR(13),
    USEPAS VARCHAR(100),
    USESTA CHAR(01),
    USESES CHAR(01),
    ROLCOD CHAR(02),
    LOCYEA CHAR(04),
    LOCCOD CHAR(06),
    REPYEA CHAR(04),
    REPCOD CHAR(06),
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TM_USER
ADD CONSTRAINT PK_TM_USER PRIMARY KEY (USEYEA, USECOD);

-- Foreign Keys
ALTER TABLE TM_USER
ADD CONSTRAINT FK_TM_USER_IDENTITY_DOCUMENT FOREIGN KEY (IDEDOCCOD) 
    REFERENCES TB_IDENTITY_DOCUMENT(IDEDOCCOD);

ALTER TABLE TM_USER
ADD CONSTRAINT FK_TM_USER_POSITION FOREIGN KEY (POSCOD) 
    REFERENCES TB_POSITION(POSCOD);

ALTER TABLE TM_USER
ADD CONSTRAINT FK_TM_USER_ROLE FOREIGN KEY (ROLCOD) 
    REFERENCES TB_ROLE(ROLCOD);

ALTER TABLE TM_USER
ADD CONSTRAINT FK_TM_USER_LOCATION FOREIGN KEY (LOCYEA, LOCCOD) 
    REFERENCES TM_LOCATION(LOCYEA, LOCCOD);

ALTER TABLE TM_USER
ADD CONSTRAINT FK_TM_USER_REPOSITORY FOREIGN KEY (REPYEA, REPCOD) 
    REFERENCES TM_REPOSITORY(REPYEA, REPCOD);
GO

-- =============================================
-- TV_MENU_PERMISSION - Menu-Permission Relationship
-- =============================================
CREATE TABLE TV_MENU_PERMISSION(
    MENYEA CHAR(04) NOT NULL,
    MENCOD CHAR(06) NOT NULL,
    PERCOD CHAR(02) NOT NULL,
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TV_MENU_PERMISSION
ADD CONSTRAINT PK_TV_MENU_PERMISSION PRIMARY KEY (MENYEA, MENCOD, PERCOD);

-- Foreign Keys
ALTER TABLE TV_MENU_PERMISSION
ADD CONSTRAINT FK_TV_MENU_PERMISSION_MENU FOREIGN KEY (MENYEA, MENCOD) 
    REFERENCES TM_MENU(MENYEA, MENCOD);

ALTER TABLE TV_MENU_PERMISSION
ADD CONSTRAINT FK_TV_MENU_PERMISSION_PERMISSION FOREIGN KEY (PERCOD) 
    REFERENCES TB_PERMISSION(PERCOD);
GO

-- =============================================
-- TV_ROLE_MENU - Role-Menu Relationship
-- =============================================
CREATE TABLE TV_ROLE_MENU(
    ROLCOD CHAR(02) NOT NULL,
    MENYEA CHAR(04) NOT NULL,
    MENCOD CHAR(06) NOT NULL,
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TV_ROLE_MENU
ADD CONSTRAINT PK_TV_ROLE_MENU PRIMARY KEY (ROLCOD, MENYEA, MENCOD);

-- Foreign Keys
ALTER TABLE TV_ROLE_MENU
ADD CONSTRAINT FK_TV_ROLE_MENU_ROLE FOREIGN KEY (ROLCOD) 
    REFERENCES TB_ROLE(ROLCOD);

ALTER TABLE TV_ROLE_MENU
ADD CONSTRAINT FK_TV_ROLE_MENU_MENU FOREIGN KEY (MENYEA, MENCOD) 
    REFERENCES TM_MENU(MENYEA, MENCOD);
GO

-- =============================================
-- TV_ROLE_PERMISSION - Role-Permission Relationship
-- =============================================
CREATE TABLE TV_ROLE_PERMISSION(
    ROLCOD CHAR(02) NOT NULL,
    MENYEA CHAR(04) NOT NULL,
    MENCOD CHAR(06) NOT NULL,
    PERCOD CHAR(02) NOT NULL,
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TV_ROLE_PERMISSION
ADD CONSTRAINT PK_TV_ROLE_PERMISSION PRIMARY KEY (ROLCOD, MENYEA, MENCOD, PERCOD);

-- Foreign Keys
ALTER TABLE TV_ROLE_PERMISSION
ADD CONSTRAINT FK_TV_ROLE_PERMISSION_ROLE FOREIGN KEY (ROLCOD) 
    REFERENCES TB_ROLE(ROLCOD);

ALTER TABLE TV_ROLE_PERMISSION
ADD CONSTRAINT FK_TV_ROLE_PERMISSION_MENU FOREIGN KEY (MENYEA, MENCOD) 
    REFERENCES TM_MENU(MENYEA, MENCOD);

ALTER TABLE TV_ROLE_PERMISSION
ADD CONSTRAINT FK_TV_ROLE_PERMISSION_PERMISSION FOREIGN KEY (PERCOD) 
    REFERENCES TB_PERMISSION(PERCOD);
GO

-- =============================================
-- TV_USER_MENU - User-Menu Relationship
-- =============================================
CREATE TABLE TV_USER_MENU(
    MENYEA CHAR(04) NOT NULL,
    MENCOD CHAR(06) NOT NULL,
    USEYEA CHAR(04) NOT NULL,
    USECOD CHAR(06) NOT NULL,
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TV_USER_MENU
ADD CONSTRAINT PK_TV_USER_MENU PRIMARY KEY (MENYEA, MENCOD, USEYEA, USECOD);

-- Foreign Keys
ALTER TABLE TV_USER_MENU
ADD CONSTRAINT FK_TV_USER_MENU_MENU FOREIGN KEY (MENYEA, MENCOD) 
    REFERENCES TM_MENU(MENYEA, MENCOD);

ALTER TABLE TV_USER_MENU
ADD CONSTRAINT FK_TV_USER_MENU_USER FOREIGN KEY (USEYEA, USECOD) 
    REFERENCES TM_USER(USEYEA, USECOD);
GO

-- =============================================
-- TV_USER_PERMISSION - User-Permission Relationship
-- =============================================
CREATE TABLE TV_USER_PERMISSION(
    USEYEA CHAR(04) NOT NULL,
    USECOD CHAR(06) NOT NULL,
    MENYEA CHAR(04) NOT NULL,
    MENCOD CHAR(06) NOT NULL,
    PERCOD CHAR(02) NOT NULL,
    USECRE VARCHAR(30),
    DATCRE DATETIME,
    ZONCRE VARCHAR(50),
    USEUPD VARCHAR(30),
    DATUPD DATETIME,
    ZONUPD VARCHAR(50),
    STAREG CHAR(1)
);

-- Primary Key
ALTER TABLE TV_USER_PERMISSION
ADD CONSTRAINT PK_TV_USER_PERMISSION PRIMARY KEY (USEYEA, USECOD, MENYEA, MENCOD, PERCOD);

-- Foreign Keys
ALTER TABLE TV_USER_PERMISSION
ADD CONSTRAINT FK_TV_USER_PERMISSION_USER FOREIGN KEY (USEYEA, USECOD) 
    REFERENCES TM_USER(USEYEA, USECOD);

ALTER TABLE TV_USER_PERMISSION
ADD CONSTRAINT FK_TV_USER_PERMISSION_MENU FOREIGN KEY (MENYEA, MENCOD) 
    REFERENCES TM_MENU(MENYEA, MENCOD);

ALTER TABLE TV_USER_PERMISSION
ADD CONSTRAINT FK_TV_USER_PERMISSION_PERMISSION FOREIGN KEY (PERCOD) 
    REFERENCES TB_PERMISSION(PERCOD);

ALTER TABLE TV_USER_PERMISSION
ADD CONSTRAINT FK_TV_USER_PERMISSION_MENU_PERMISSION FOREIGN KEY (MENYEA, MENCOD, PERCOD) 
    REFERENCES TV_MENU_PERMISSION(MENYEA, MENCOD, PERCOD);
GO

-- =============================================
-- TM_FORM_MASTER - Master Form
-- =============================================
CREATE TABLE TM_FORM_MASTER (
    -- Primary key (FORm + MASter)
    FORMASYEA CHAR(04) NOT NULL,                    -- Form Master Year
    FORMASCOD CHAR(06) NOT NULL,                    -- Form Master Code
    
    -- Basic info
    FORMASNAM VARCHAR(200),                   -- Name
    FORMASDES VARCHAR(500),                   -- Description
    FORMASTYP VARCHAR(20),                    -- Type
    FORMASSTA CHAR(1),                        -- Status (A=Active, I=Inactive)
    
    -- Configuration
    FORMASMUL BIT,                            -- Allows multiple responses
    FORMASDATINI DATETIME,                    -- Start date
    FORMASDATEND DATETIME,                    -- End date
    FORMASORD INT,                            -- Display Order
    
    -- Standard Audit Fields (matching TABLES_EN.sql)
    USECRE VARCHAR(30),                       -- User Creation
    DATCRE DATETIME,                          -- Date Creation
    ZONCRE VARCHAR(50),                       -- Zone Creation
    USEUPD VARCHAR(30),                       -- User Update
    DATUPD DATETIME,                          -- Date Update
    ZONUPD VARCHAR(50),                       -- Zone Update
    STAREG CHAR(1)                            -- Status Register (I, M, E)
);

-- Primary Key
ALTER TABLE TM_FORM_MASTER
ADD CONSTRAINT PK_TM_FORM_MASTER PRIMARY KEY (FORMASYEA, FORMASCOD);
GO

-- =============================================
-- TM_FORM_FIELD - Form Field
-- =============================================
CREATE TABLE TM_FORM_FIELD (
    -- Composite Primary Key / FK part 1
    FORMASYEA CHAR(04) NOT NULL,                    -- FK: Year of Form Master
    FORMASCOD CHAR(06) NOT NULL,                    -- FK: Code of Form Master
    
    -- Composite Primary Key part 2 (FORm + FIEld)
    FORFIEYEA CHAR(04) NOT NULL,                    -- Field Year
    FORFIECOD CHAR(06) NOT NULL,                    -- Field Code
    
    -- Basic info
    FORFIENAM VARCHAR(100),                   -- Field Name
    FORFIELAB VARCHAR(100),                   -- Label
    FORFIETYP VARCHAR(20),                    -- Type (TEXT, SELECT, RADIO, etc.)
    FORFIEREQ BIT,                            -- Required
    FORFIEORD INT,                            -- Order
    
    -- Advanced config
    FORFIEOPT NVARCHAR(MAX),                  -- Options (JSON) - Changed from TEXT
    FORFIEVAL VARCHAR(500),                   -- Default Value
    FORFIEPLA VARCHAR(100),                   -- Placeholder
    FORFIEHEL VARCHAR(500),                   -- Help Text
    FORFIECOL INT,                            -- Column width (grid)
    
    -- Validations
    FORFIEMIN INT,                            -- Min value/length
    FORFIEMAX INT,                            -- Max value/length
    FORFIEPAT VARCHAR(200),                   -- Pattern (regex)
    FORFIEERR VARCHAR(200),                   -- Custom Error Message
    
    -- Status & Config
    FORFIESTA CHAR(1),                        -- Status (A/I)
    FORFIEVIS BIT,                            -- Visible
    FORFIEEDI BIT,                            -- Editable
    
    -- Standard Audit Fields (matching TABLES_EN.sql)
    USECRE VARCHAR(30),                       -- User Creation
    DATCRE DATETIME,                          -- Date Creation
    ZONCRE VARCHAR(50),                       -- Zone Creation
    USEUPD VARCHAR(30),                       -- User Update
    DATUPD DATETIME,                          -- Date Update
    ZONUPD VARCHAR(50),                       -- Zone Update
    STAREG CHAR(1)                            -- Status Register (I, M, E)
);

-- Primary Key
ALTER TABLE TM_FORM_FIELD
ADD CONSTRAINT PK_TM_FORM_FIELD PRIMARY KEY (FORMASYEA, FORMASCOD, FORFIEYEA, FORFIECOD);

-- Foreign Key
ALTER TABLE TM_FORM_FIELD
ADD CONSTRAINT FK_TM_FORM_FIELD_MASTER FOREIGN KEY (FORMASYEA, FORMASCOD) 
    REFERENCES TM_FORM_MASTER(FORMASYEA, FORMASCOD);
GO