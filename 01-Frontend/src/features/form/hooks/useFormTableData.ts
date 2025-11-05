/**
 * Hook de datos de tabla para formularios - configuración simplificada
 */
import { createTableDataHook } from '@/shared/hooks';
import { Form } from '../types';

/**
 * Hook de tabla para formularios con acciones estándar (ver, editar, eliminar)
 */
export const useFormTableData = createTableDataHook<Form>({
  columns: [
    { key: 'forMasNam', header: ['Nombre', 'Name'] },
    { key: 'forMasDes', header: ['Descripción', 'Description'] },
    { key: 'forMasTyp', header: ['Tipo', 'Type'] },
    { key: 'forMasSta', header: ['Estado', 'Status'] }
  ],
  includeAuditFields: true,
  enableSelection: false
});
