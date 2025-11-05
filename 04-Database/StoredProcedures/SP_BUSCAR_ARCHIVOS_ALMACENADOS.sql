-- =============================================
-- Autor:			Enzo Gago Aguirre
-- Fecha Creación:	2025-06-19
-- Descripción:		Procedimiento para buscar archivos almacenados con filtros
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[SP_BUSCAR_ARCHIVOS_ALMACENADOS]
	@P_FILE_TYPE NVARCHAR(100) = NULL,
	@P_CUSTOM_DIRECTORY NVARCHAR(255) = NULL,
	@P_FILE_NAME NVARCHAR(255) = NULL
AS
BEGIN
	SET NOCOUNT ON;
	
	-- Tabla temporal para almacenar los resultados
	DECLARE @ResultTable TABLE (
		FileId INT IDENTITY(1,1),
		FileName NVARCHAR(255),
		FilePath NVARCHAR(500),
		FileUrl NVARCHAR(1000),
		FileSize BIGINT,
		FileType NVARCHAR(100),
		MimeType NVARCHAR(100),
		CreationDate DATETIME,
		CustomDirectory NVARCHAR(255),
		IsImage BIT,
		RowNum INT
	);
	
	-- Insertar registros de la tabla de archivos con filtros
	INSERT INTO @ResultTable (
		FileName,
		FilePath,
		FileUrl,
		FileSize,
		FileType,
		MimeType,
		CreationDate,
		CustomDirectory,
		IsImage
	)
	SELECT 
		F.FileName,
		F.FilePath,
		F.FileUrl,
		F.FileSize,
		F.FileType,
		F.MimeType,
		F.CreationDate,
		F.CustomDirectory,
		F.IsImage
	FROM 
		Files F
	WHERE 
		(@P_FILE_TYPE IS NULL OR F.FileType = @P_FILE_TYPE)
		AND (@P_CUSTOM_DIRECTORY IS NULL OR F.CustomDirectory LIKE '%' + @P_CUSTOM_DIRECTORY + '%')
		AND (@P_FILE_NAME IS NULL OR F.FileName LIKE '%' + @P_FILE_NAME + '%')
	ORDER BY 
		F.CreationDate DESC;
	
	-- Calcular el número total de registros
	DECLARE @TotalRegistros INT;
	SELECT @TotalRegistros = COUNT(*) FROM @ResultTable;
	
	-- Actualizar el número de fila para cada registro
	;WITH CTE AS (
		SELECT 
			*,
			ROW_NUMBER() OVER (ORDER BY CreationDate DESC) AS RowNum
		FROM 
			@ResultTable
	)
	UPDATE CTE SET RowNum = ROW_NUMBER() OVER (ORDER BY CreationDate DESC);
	
	-- Devolver los registros paginados
	SELECT 
		FileId,
		FileName,
		FilePath,
		FileUrl,
		FileSize,
		FileType,
		MimeType,
		CreationDate,
		CustomDirectory,
		IsImage,
		@TotalRegistros AS TotalRegistros
	FROM 
		@ResultTable
	ORDER BY 
		CreationDate DESC;
END
