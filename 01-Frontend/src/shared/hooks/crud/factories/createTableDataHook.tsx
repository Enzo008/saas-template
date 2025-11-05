import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { formatDateWithTimezone } from '@/shared/utils/dateUtils';
import { generateInitialColumnVisibility, isAuditField } from '@/shared/utils/auditFieldUtils';

/**
 * Configuración de una columna simple
 */
export interface ColumnConfig {
  key: string;
  header: string | [string, string]; // Español o [Español, Inglés]
  
  /** Placeholder personalizado para filtros (opcional) */
  filterPlaceholder?: string | [string, string]; // Español o [Español, Inglés]
  
  /** Tipo de filtro para esta columna (default: 'text') */
  filterType?: 'text' | 'number' | 'date' | 'select';
  
  /** Si la columna es filtrable (default: true) */
  filterable?: boolean;
  
  /** Si la columna es ordenable (default: true) */
  sortable?: boolean;
  
  /** Función de renderizado personalizada */
  render?: (value: any, item: any) => React.ReactNode;
}

/**
 * Opciones para createTableDataHook
 */
export interface CreateTableDataHookOptions {
  /** Columnas personalizadas */
  columns: ColumnConfig[];
  
  /** Incluir campos de auditoría (default: true) */
  includeAuditFields?: boolean;
  
  /** Habilitar selección múltiple (default: false) */
  enableSelection?: boolean;
}

/**
 * Props que recibe el hook generado
 */
export interface TableDataHookProps<T> {
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  /** Permiso para editar (opcional) */
  canUpdate?: boolean;
  /** Permiso para eliminar (opcional) */
  canDelete?: boolean;
}

/**
 * Retorno del hook generado
 */
export interface TableDataHookReturn {
  columns: ColumnDef<any>[];
  columnIds: string[];
  initialColumnVisibility: Record<string, boolean>;
}

const AUDIT_COLUMNS: ColumnConfig[] = [
  {
    key: 'useCre',
    header: ['Usuario Creación', 'Created By']
  },
  {
    key: 'datCre',
    header: ['Fecha Creación', 'Created Date'],
    render: (value: string, item: any) => {
      if (!value) return '-';
      return formatDateWithTimezone(value, { showTimezone: true }, item.zonCre);
    }
  },
  {
    key: 'zonCre',
    header: ['Zona Creación', 'Created Timezone']
  },
  {
    key: 'useUpd',
    header: ['Usuario Mod.', 'Modified By']
  },
  {
    key: 'datUpd',
    header: ['Fecha Mod.', 'Modified Date'],
    render: (value: string, item: any) => {
      if (!value) return '-';
      return formatDateWithTimezone(value, { showTimezone: true }, item.zonUpd);
    }
  },
  {
    key: 'zonUpd',
    header: ['Zona Mod.', 'Modified Timezone']
  }
];

/**
 * Crea un hook de datos de tabla unificado
 * 
 * @example
 * ```typescript
 * export const usePositionTableData = createTableDataHook<Position>({
 *   columns: [
 *     { key: 'posNam', header: ['Nombre del Cargo', 'Position Name'] }
 *   ],
 *   includeAuditFields: true,
 *   enableSelection: false
 * });
 * ```
 */
export function createTableDataHook<T>(
  options: CreateTableDataHookOptions
) {
  const {
    columns: customColumns,
    includeAuditFields = true,
    enableSelection = false
  } = options;

  return function useTableData(props: TableDataHookProps<T>): TableDataHookReturn {
    const { t, i18n } = useTranslation();
    const { onEdit, onDelete, canUpdate = true, canDelete = true } = props;
    const currentLanguage = i18n.language;

    // Combinar columnas custom + auditoría
    const allColumnConfigs = useMemo(() => {
      const configs = [...customColumns];
      if (includeAuditFields) {
        configs.push(...AUDIT_COLUMNS);
      }
      return configs;
    }, [customColumns, includeAuditFields]);

    // Generar columnas de TanStack Table
    const columns = useMemo<ColumnDef<T>[]>(() => {
      const cols: ColumnDef<T>[] = [];

      // Columna de selección (opcional)
      if (enableSelection) {
        cols.push({
          id: 'select',
          header: ({ table }) => (
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          ),
          enableSorting: false,
          enableHiding: false
        });
      }

      // Columnas de datos
      allColumnConfigs.forEach(config => {
        // Extraer texto del header según idioma
        const headerText = Array.isArray(config.header)
          ? currentLanguage === 'en' ? config.header[1] : config.header[0]
          : config.header;
        
        // Extraer placeholder según idioma (si existe)
        const filterPlaceholder = config.filterPlaceholder
          ? Array.isArray(config.filterPlaceholder)
            ? currentLanguage === 'en' ? config.filterPlaceholder[1] : config.filterPlaceholder[0]
            : config.filterPlaceholder
          : undefined;
        
        cols.push({
          id: config.key,
          accessorKey: config.key,
          header: () => <span>{headerText}</span>,
          cell: ({ row }) => {
            const value = row.getValue(config.key);
            if (config.render) {
              return config.render(value, row.original);
            }
            return value || '-';
          },
          meta: {
            isAuditField: isAuditField(config.key),
            // 🆕 Metadata adicional para FilterPanel y ColumnVisibilitySelector
            headerText, // Texto traducido del header
            filterPlaceholder, // Placeholder personalizado para filtros
            filterType: config.filterType || 'text', // Tipo de filtro
            filterable: config.filterable !== false, // Por defecto es filtrable
            sortable: config.sortable !== false // Por defecto es ordenable
          },
          enableSorting: config.sortable !== false
        });
      });

      // Columna de acciones (solo si tiene al menos un permiso)
      if (canUpdate || canDelete) {
        cols.push({
          id: 'actions',
          header: () => <span>{t('common.headers.actions')}</span>,
          cell: ({ row }) => (
            <div className="flex gap-2">
              {/* 🔒 Botón editar - solo si tiene permiso */}
              {canUpdate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(row.original)}
                  title={t('common.actions.edit')}  
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {/* 🔒 Botón eliminar - solo si tiene permiso */}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(row.original)}
                  title={t('common.actions.delete')}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          ),
          meta: {
            isAction: true
          },
          enableSorting: false,
          enableHiding: false
        });
      }

      return cols;
    }, [allColumnConfigs, currentLanguage, enableSelection, onEdit, onDelete, canUpdate, canDelete, t]);

    // IDs de columnas
    const columnIds = useMemo(() => {
      return columns.map(col => col.id as string);
    }, [columns]);

    // Visibilidad inicial (ocultar auditoría por defecto)
    const initialColumnVisibility = useMemo(() => {
      return generateInitialColumnVisibility(columnIds, includeAuditFields);
    }, [columnIds, includeAuditFields]);

    return {
      columns,
      columnIds,
      initialColumnVisibility
    };
  };
}

export { createTableDataHook as default };
