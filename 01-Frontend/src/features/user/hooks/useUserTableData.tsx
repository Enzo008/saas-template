/**
 * Table data hook for users - simplified configuration
 */
import { createTableDataHook } from '@/shared/hooks';
import { User } from '../types/user.types';

/**
 * Table hook for users with standard actions (view, edit, delete)
 */
export const useUserTableData = createTableDataHook<User>({
  columns: [
    { key: 'useNam', header: ['Nombre', 'Name']},
    { key: 'useLas', header: ['Apellido', 'Last Name'] },
    { key: 'useSta', header: ['Estado', 'Status'] },
    { key: 'useBir', header: ['Fecha de Nacimiento', 'Birth Date'] },
    { key: 'useEma', header: ['Correo Electrónico', 'Email'] },
    { key: 'locNam', header: ['País', 'Country'] },
    { key: 'usePho', header: ['Teléfono', 'Phone'] },
    { key: 'posNam', header: ['Position', 'Position'] },
    { key: 'rolNam', header: ['Rol', 'Role'] }
  ],
  includeAuditFields: true,
  enableSelection: false
});
