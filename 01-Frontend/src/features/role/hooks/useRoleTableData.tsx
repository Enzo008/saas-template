/**
 * Table data hook for roles - simplified configuration
 */
import { createTableDataHook } from '@/shared/hooks';
import { Role } from '../types';

/**
 * Table hook for roles with standard actions (view, edit, delete)
 */
export const useRoleTableData = createTableDataHook<Role>({
  columns: [
    { key: 'rolNam', header: ['Nombre del Rol', 'Role Name'] }
  ],
  includeAuditFields: true,
  enableSelection: false
});
