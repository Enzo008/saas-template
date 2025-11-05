import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { generateInitialColumnVisibility } from "../../utils/auditFieldUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export interface TableAction<T> {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
  condition?: (item: T) => boolean;
}

export interface UseTableDataOptions<T> {
  enableSelection?: boolean;
  actions?: TableAction<T>[];
  t: (key: string) => string;
}

export function useTableData<T>(options: UseTableDataOptions<T>) {
  const { enableSelection = true, actions = [], t } = options;
  const columnHelper = createColumnHelper<T>();

  // Función para crear la columna de selección
  const createSelectionColumn = () => {
    return columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            ref={(input) => {
              if (input) {
                input.indeterminate = table.getIsSomeRowsSelected();
              }
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
          />
        </div>
      ),
      size: 20
    });
  };

  // Función para crear la columna de acciones
  const createActionsColumn = () => {
    return columnHelper.display({
      id: "actions",
      header: t('common.headers.actions'),
      cell: ({ row }) => (
        <TooltipProvider>
          <div className="flex items-center justify-center gap-1">
            {Array.isArray(actions) ? actions.map((action, index) => {
              // Si hay una condición y no se cumple, no mostramos la acción
              if (action.condition && !action.condition(row.original)) {
                return null;
              }

              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => action.onClick(row.original)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {action.icon || (
                        // Fallback si no hay icono - mostrar primera letra del label
                        <span className="text-xs font-medium">
                          {action.label.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }) : null}
          </div>
        </TooltipProvider>
      ),
      // Configuración para fijar la columna a la derecha
      enablePinning: true,
      enableColumnFilter: false,
      size: 80, // Ancho fijo para la columna de acciones
    });
  };

  // Función para crear columnas base (selección y acciones)
  const createBaseColumns = () => {
    const baseColumns: ColumnDef<T, any>[] = [];

    // La columna de selección siempre va primero
    if (enableSelection) {
      baseColumns.push(createSelectionColumn());
    }

    return baseColumns;
  };

  // Función para crear la columna de acciones (siempre va al final)
  const createActionColumn = () => {
    if (!Array.isArray(actions) || actions.length === 0) return null;

    // Creamos la columna de acciones con la propiedad de estar fija a la derecha
    return createActionsColumn();
  };

  // Función para generar columnIds y initialColumnVisibility
  const generateColumnMetadata = (columns: ColumnDef<T, any>[]) => {
    const columnIds = columns.map((column) => column.id as string);

    // ✅ Usar la función de utilidad para ocultar campos de auditoría por defecto
    const initialColumnVisibility = generateInitialColumnVisibility(columnIds, true);

    return { columnIds, initialColumnVisibility };
  };

  return {
    columnHelper,
    createBaseColumns,
    createActionColumn,
    generateColumnMetadata
  };
}
