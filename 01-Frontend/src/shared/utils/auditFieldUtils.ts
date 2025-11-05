/**
 * Utilidades para manejo de campos de auditoría en tablas
 * Proporciona funciones para detectar y manejar la visibilidad de campos de auditoría
 */

// Constantes para campos de auditoría estándar
export const AUDIT_FIELDS = ['useCre', 'datCre', 'zonCre', 'useUpd', 'datUpd', 'zonUpd', 'staRec'] as const;

export type AuditField = typeof AUDIT_FIELDS[number];

/**
 * Detecta si un campo es un campo de auditoría
 * @param fieldName - Nombre del campo a verificar
 * @returns true si es un campo de auditoría, false en caso contrario
 */
export const isAuditField = (fieldName: string): boolean => {
  return AUDIT_FIELDS.includes(fieldName as AuditField);
};

/**
 * Genera el estado inicial de visibilidad de columnas
 * @param columnIds - Array de IDs de columnas
 * @param hideAuditFields - Si debe ocultar campos de auditoría por defecto (default: true)
 * @returns Objeto con el estado de visibilidad inicial
 */
export const generateInitialColumnVisibility = (
  columnIds: string[], 
  hideAuditFields: boolean = true
): Record<string, boolean> => {
  return columnIds.reduce((acc, id) => {
    // Si hideAuditFields es true, ocultar campos de auditoría, sino mostrar todos
    acc[id] = hideAuditFields ? !isAuditField(id) : true;
    return acc;
  }, {} as Record<string, boolean>);
};

/**
 * Filtra columnas excluyendo campos de auditoría
 * @param columnIds - Array de IDs de columnas
 * @returns Array de IDs sin campos de auditoría
 */
export const filterOutAuditFields = (columnIds: string[]): string[] => {
  return columnIds.filter(id => !isAuditField(id));
};

/**
 * Obtiene solo los campos de auditoría de una lista de columnas
 * @param columnIds - Array de IDs de columnas
 * @returns Array de IDs que son campos de auditoría
 */
export const getAuditFields = (columnIds: string[]): string[] => {
  return columnIds.filter(id => isAuditField(id));
};

/**
 * Verifica si hay campos de auditoría visibles en el estado actual
 * @param columnVisibility - Estado actual de visibilidad de columnas
 * @returns true si hay al menos un campo de auditoría visible
 */
export const hasVisibleAuditFields = (columnVisibility: Record<string, boolean>): boolean => {
  return Object.entries(columnVisibility).some(([columnId, isVisible]) => 
    isVisible && isAuditField(columnId)
  );
};

/**
 * Obtiene las columnas visibles excluyendo campos de auditoría ocultos
 * @param columnIds - Array de todos los IDs de columnas
 * @param columnVisibility - Estado actual de visibilidad
 * @returns Array de IDs de columnas visibles (incluyendo auditoría si están activas)
 */
export const getVisibleColumns = (
  columnIds: string[], 
  columnVisibility: Record<string, boolean>
): string[] => {
  return columnIds.filter(id => columnVisibility[id] !== false);
};

/**
 * Obtiene las columnas filtrables (visibles y no de auditoría, a menos que estén explícitamente visibles)
 * @param columnIds - Array de todos los IDs de columnas
 * @param columnVisibility - Estado actual de visibilidad
 * @returns Array de IDs de columnas que deben aparecer en filtros
 */
export const getFilterableColumns = (
  columnIds: string[], 
  columnVisibility: Record<string, boolean>
): string[] => {
  return columnIds.filter(id => {
    const isVisible = columnVisibility[id] !== false;
    // Si es un campo de auditoría, solo incluirlo si está explícitamente visible
    if (isAuditField(id)) {
      return isVisible && columnVisibility[id] === true;
    }
    // Para campos normales, incluir si están visibles
    return isVisible;
  });
};