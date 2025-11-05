-- =============================================
-- Autor:           [Developer Name]
-- Fecha Creación:  [YYYY-MM-DD]
-- Descripción:     Template para búsqueda paginada con filtros - Tablas Maestro (TM_)
-- Modificaciones:  [Date] - [Author] - [Description]
-- =============================================
CREATE OR ALTER PROCEDURE SP_BUSCAR_[ENTITY]
@P_[ENTITY]ANO          CHAR(4),                -- Año de la entidad maestro
@P_[ENTITY]COD          CHAR(6),                -- Código de la entidad
@P_[FIELD1]             [DATA_TYPE],            -- Campo principal de filtrado
@P_[FIELD2]             [DATA_TYPE],            -- Campo secundario de filtrado
@P_LOGIPMAQ             VARCHAR(15),
@P_USUANO_U             CHAR(4),
@P_USUCOD_U             CHAR(6),
@P_USUNOM_U             VARCHAR(30),
@P_USUAPE_U             VARCHAR(30),
@P_PAGE_NUMBER          INT = NULL,
@P_PAGE_SIZE            INT = NULL,
@P_TOTAL_RECORDS      INT OUTPUT,
@P_DESCRIPCION_MENSAJE  NVARCHAR(MAX) OUTPUT,
@P_TIPO_MENSAJE         CHAR(1) OUTPUT
AS
BEGIN TRY
    SET NOCOUNT ON

    DECLARE @V_SQL               NVARCHAR(MAX)  = '',
            @V_NOMBRE_TABLA      NVARCHAR(300)  = 'TM_[ENTITY]',
            @V_CODIGO_LOG_ANIO   CHAR(4)        = '',
            @V_CODIGO_LOG        CHAR(10)       = '',
            @V_DESCRIPCION_LOG   NVARCHAR(300)  = '',
            @V_ERROR             NVARCHAR(MAX)  = '',
            @V_OFFSET            INT            = 0,
            @V_USAR_PAGINACION   BIT            = 0

    SET @V_DESCRIPCION_LOG = 'SE BUSCÓ [ENTITY] '

    -- Determinar si usar paginación
    IF @P_PAGE_NUMBER IS NOT NULL AND @P_PAGE_SIZE IS NOT NULL AND @P_PAGE_SIZE > 0
    BEGIN
        SET @V_USAR_PAGINACION = 1
        SET @V_OFFSET = (@P_PAGE_NUMBER - 1) * @P_PAGE_SIZE
    END

    -- Construir consulta base para contar registros con JOINS (si aplica)
    SET @V_SQL = 'SELECT @TOTAL = COUNT(*) ' +
                 'FROM TM_[ENTITY] AS ENT ' +
                 -- '[JOINS_SECTION]' +
                 'WHERE ENT.ESTREG <> ''E'''

    -- Aplicar filtros al conteo
    IF @P_[ENTITY]ANO IS NOT NULL
    BEGIN
        SET @V_SQL = @V_SQL + ' AND ENT.[ENTITY]ANO = ''' + LTRIM(RTRIM(@P_[ENTITY]ANO)) + ''''
    END

    IF @P_[ENTITY]COD IS NOT NULL
    BEGIN
        SET @V_SQL = @V_SQL + ' AND ENT.[ENTITY]COD = ''' + LTRIM(RTRIM(@P_[ENTITY]COD)) + ''''
    END

    IF @P_[FIELD1] IS NOT NULL
    BEGIN
        SET @V_SQL = @V_SQL + ' AND ENT.[FIELD1] LIKE ''%' + LTRIM(RTRIM(@P_[FIELD1])) + '%'''
    END

    IF @P_[FIELD2] IS NOT NULL
    BEGIN
        SET @V_SQL = @V_SQL + ' AND ENT.[FIELD2] LIKE ''%' + LTRIM(RTRIM(@P_[FIELD2])) + '%'''
    END

    -- Obtener total de registros
    EXEC sp_executesql @V_SQL, N'@TOTAL INT OUTPUT', @TOTAL = @P_TOTAL_RECORDS OUTPUT

    -- Construir consulta principal para datos con JOINS
    SET @V_SQL = 'SELECT ENT.[ENTITY]ANO, ENT.[ENTITY]COD, ENT.[FIELD1], ENT.[FIELD2], ' +
                 -- Campos de tablas relacionadas si aplica
                 -- 'REL.[RELATED_FIELD], REL.[RELATED_NAME], ' +
                 'ENT.USUING, ENT.FECING, ENT.ZONING, ENT.USUMOD, ENT.FECMOD, ENT.ZONMOD, ENT.ESTREG ' +
                 'FROM TM_[ENTITY] AS ENT ' +
                 -- '[JOINS_SECTION]' +
                 'WHERE ENT.ESTREG <> ''E'''

    -- Aplicar mismos filtros a la consulta principal
    IF @P_[ENTITY]ANO IS NOT NULL
    BEGIN
        SET @V_SQL = @V_SQL + ' AND ENT.[ENTITY]ANO = ''' + LTRIM(RTRIM(@P_[ENTITY]ANO)) + ''''
    END

    IF @P_[ENTITY]COD IS NOT NULL
    BEGIN
        SET @V_SQL = @V_SQL + ' AND ENT.[ENTITY]COD = ''' + LTRIM(RTRIM(@P_[ENTITY]COD)) + ''''
    END

    IF @P_[FIELD1] IS NOT NULL
    BEGIN
        SET @V_SQL = @V_SQL + ' AND ENT.[FIELD1] LIKE ''%' + LTRIM(RTRIM(@P_[FIELD1])) + '%'''
    END

    IF @P_[FIELD2] IS NOT NULL
    BEGIN
        SET @V_SQL = @V_SQL + ' AND ENT.[FIELD2] LIKE ''%' + LTRIM(RTRIM(@P_[FIELD2])) + '%'''
    END

    -- Ordenamiento por campos clave
    SET @V_SQL = @V_SQL + ' ORDER BY ENT.[ENTITY]ANO, ENT.[ENTITY]COD '

    -- Aplicar paginación si se especifica
    IF @V_USAR_PAGINACION = 1
    BEGIN
        SET @V_SQL = @V_SQL + 
                    ' OFFSET ' + CAST(@V_OFFSET AS VARCHAR) + ' ROWS ' +
                    ' FETCH NEXT ' + CAST(@P_PAGE_SIZE AS VARCHAR) + ' ROWS ONLY '
    END

    -- Formatear como JSON
    SET @V_SQL = @V_SQL + ' FOR JSON PATH'

    -- Ejecutar consulta
    EXECUTE sp_executesql @V_SQL

    SET @P_DESCRIPCION_MENSAJE = 'Llenado de datos exitoso'
    SET @P_TIPO_MENSAJE = '3'

END TRY
BEGIN CATCH
    SET @V_ERROR = LTRIM(RTRIM(UPPER(ERROR_MESSAGE())))
    EXEC SP_REGISTRAR_LOG @V_ERROR, 'BUSCAR', @P_LOGIPMAQ, '', @V_NOMBRE_TABLA, @V_SQL, 'ERROR', 
         @P_USUANO_U, @P_USUCOD_U, @P_USUNOM_U, @P_USUAPE_U,
         @P_DESCRIPCION_MENSAJE = @P_DESCRIPCION_MENSAJE OUTPUT,
         @P_TIPO_MENSAJE = @P_TIPO_MENSAJE OUTPUT,
         @P_LOGANO = @V_CODIGO_LOG_ANIO OUTPUT,
         @P_LOGCOD = @V_CODIGO_LOG OUTPUT
    EXEC SP_ACTUALIZA_FECHA_FIN_Y_SQL @V_CODIGO_LOG_ANIO, @V_CODIGO_LOG, @V_SQL
    SET @P_DESCRIPCION_MENSAJE = @V_ERROR
    SET @P_TIPO_MENSAJE = '1'
END CATCH
GO

-- =============================================
-- INSTRUCCIONES DE USO:
-- 1. Reemplazar [ENTITY] con el nombre de la entidad (ej: USUARIO, UBICACION)
-- 2. Reemplazar [FIELD1], [FIELD2] con los campos específicos de filtrado
-- 3. Reemplazar [DATA_TYPE] con el tipo de dato correspondiente
-- 4. Descomentar y configurar [JOINS_SECTION] si hay tablas relacionadas
-- 5. Agregar campos relacionados en el SELECT si es necesario
-- 
-- EJEMPLO DE JOINS_SECTION:
-- 'INNER JOIN TB_DOCUMENTO_IDENTIDAD AS DOCIDE ON ENT.DOCIDECOD = DOCIDE.DOCIDECOD ' +
-- 'INNER JOIN TB_CARGO AS CAR ON ENT.CARCOD = CAR.CARCOD ' +
-- 
-- CARACTERÍSTICAS:
-- - Soporte para claves compuestas (ANO + COD)
-- - Paginación opcional del lado del servidor
-- - Filtros dinámicos con LIKE para texto
-- - Soporte para JOINS con tablas relacionadas
-- - Conteo total separado para paginación
-- - Formato JSON PATH para frontend
-- - Compatible con tablas maestro (TM_)
-- =============================================
