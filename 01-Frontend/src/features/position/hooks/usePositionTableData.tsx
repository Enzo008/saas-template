/**
 * Table data hook for positions - simplified configuration
 */
import { createTableDataHook } from '@/shared/hooks';
import { Position } from '../types/position.types';

/**
 * Table hook for positions with standard actions (view, edit, delete)
 */
export const usePositionTableData = createTableDataHook<Position>({
  columns: [
    { key: 'posNam', header: ['Nombre del Cargo', 'Position Name'] }
  ],
  includeAuditFields: true,
  enableSelection: false
});
