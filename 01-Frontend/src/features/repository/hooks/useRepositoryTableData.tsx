/**
 * Table data hook for repository - simplified configuration
 */
import { createTableDataHook } from '@/shared/hooks';
import { Repository } from '../types/repository.types';

/**
 * Table hook for repository with standard actions (view, edit, delete)
 */
export const useRepositoryTableData = createTableDataHook<Repository>({
  columns: [
    { key: 'repNam', header: ['Nombre', 'Name'] },
    { key: 'locNam', header: ['Ubicación', 'Location'] }
  ],
  includeAuditFields: true,
  enableSelection: false
});
