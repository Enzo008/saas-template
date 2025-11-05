import React, { useEffect, useMemo, useState, useRef, createRef } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/shared/config/env";

import TableHeader from "./TableHeader";
import { fuzzyFilter, reorder } from "./Table.utils";
import Pagination from "./Pagination";
import { ColumnVisibilitySelector } from "./ColumnVisibilitySelector";
import FilterPanel from "./FilterPanel";
import { isAuditField } from "@/shared/utils/auditFieldUtils";

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  initialColumnVisibility: Record<string, boolean>;
  columnIds: string[];
  renderDetailRow?: (row: T) => React.ReactNode;
  onNew?: () => void;
  enableRowSelection?: boolean; // Propiedad para habilitar/deshabilitar la selección de filas
  hideAuditFieldsByDefault?: boolean; // Control de visibilidad de campos de auditoría por defecto

  // Propiedades para paginación del servidor (opcionales)
  totalCount?: number; // Total de registros (solo para paginación del servidor)
  pageCount?: number; // Total de páginas (solo para paginación del servidor)
  pageIndex?: number; // Índice de página actual (0-based, solo para paginación del servidor)
  pageSize?: number; // Tamaño de página (solo para paginación del servidor)
  onPaginationChange?: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void; // Callback para cambios de paginación
  onFilterChange?: (filters: Record<string, any>) => void | Promise<any>; // Callback para cambios en los filtros (solo para paginación del servidor)
  onRefresh?: () => void | Promise<any>; // Callback para refrescar los datos
  
  // Estado de carga
  isInitialLoading?: boolean; // Para mostrar skeleton durante la carga inicial
}

export default function Table<T>({
  data,
  columns,
  initialColumnVisibility,
  columnIds,
  renderDetailRow,
  onNew,
  enableRowSelection = true, // Por defecto, la selección de filas está habilitada

  // Propiedades para paginación del servidor
  totalCount,
  pageCount,
  pageIndex = 0,
  pageSize = 10,
  onPaginationChange,
  onFilterChange,
  onRefresh,
  
  // Estado de carga
  isInitialLoading = false,
}: TableProps<T>) {
  // Estado local para la paginación del servidor
  const [
    { pageIndex: tablePageIndex, pageSize: tablePageSize },
    setPagination,
  ] = useState<PaginationState>({
    pageIndex: pageIndex,
    pageSize: pageSize,
  });

  // Sincronizamos el estado de paginación interno con las props cuando se usa paginación del servidor
  useEffect(() => {
    setPagination({
      pageIndex: pageIndex,
      pageSize: pageSize,
    });
  }, [pageIndex, pageSize]);

  // Referencia para evitar ciclos infinitos
  const prevTablePageIndex = React.useRef(tablePageIndex);
  const prevTablePageSize = React.useRef(tablePageSize);

  // Notificamos al componente padre cuando cambia la paginación (solo en modo servidor)
  useEffect(() => {
    // Solo notificamos si los valores realmente han cambiado
    if (
      onPaginationChange &&
      (prevTablePageIndex.current !== tablePageIndex ||
        prevTablePageSize.current !== tablePageSize)
    ) {
      // Actualizamos las referencias antes de notificar
      prevTablePageIndex.current = tablePageIndex;
      prevTablePageSize.current = tablePageSize;

      // Notificamos al componente padre
      onPaginationChange({
        pageIndex: tablePageIndex,
        pageSize: tablePageSize,
      });
    }
  }, [tablePageIndex, tablePageSize, onPaginationChange, totalCount, pageCount]);

  // Estado para controlar la visibilidad de columnas
  // El initialColumnVisibility ya viene configurado desde el factory con campos de auditoría ocultos
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(initialColumnVisibility || {});

  // Estado para mantener el orden de las columnas
  const [columnOrder, setColumnOrder] = useState<string[]>(columnIds);

  // Sincronizar columnOrder con columnIds cuando cambien
  useEffect(() => {
    setColumnOrder(columnIds);
  }, [columnIds]);

  // Estado para mantener la selección de filas
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Estado para mantener los filtros aplicados (para paginación del servidor)
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});

  // Estado para controlar la animación de carga del botón de refrescar
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estado para mostrar skeleton en el tbody (usado para refresh, filtros, paginación)
  const [showSkeleton, setShowSkeleton] = useState(false);

  // Sistema de pinning mejorado - Referencias para las columnas
  const columnRefs = useRef(new Map<string, React.RefObject<HTMLTableCellElement | null>>());

  // Estado para almacenar los anchos de las columnas pinneadas
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // Efecto para mostrar en consola las filas seleccionadas cuando cambia la selección (solo en desarrollo)
  useEffect(() => {
    if (env.isDevelopment && Object.keys(rowSelection).length > 0) {
      console.log("Filas seleccionadas:", rowSelection);
    }
  }, [rowSelection]);

  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    enableRowSelection,
    getRowCanExpand: () => Boolean(renderDetailRow),
    // Configuración para paginación del servidor (siempre servidor)
    manualPagination: true,
    pageCount:
      pageCount ?? Math.max(1, Math.ceil((totalCount ?? 0) / tablePageSize)),
    // Habilitar pinning de columnas
    enableColumnPinning: true,
    state: {
      pagination: {
        pageIndex: tablePageIndex,
        pageSize: tablePageSize,
      },
      columnVisibility,
      columnOrder,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      columnOrder,
      pagination: {
        pageSize: 10,
      },
      columnPinning: {
        right: ['actions'],
      },
    },
  });

  // Sistema de pinning mejorado - Calcular anchos y offsets de columnas pinneadas
  useEffect(() => {
    const calculateColumnWidths = () => {
      const newColumnWidths: Record<string, number> = {};
      let leftTotal = 0;
      let rightTotal = 0;

      // Obtener las columnas pinneadas
      const leftPinnedColumns = table.getLeftHeaderGroups()[0]?.headers || [];
      const rightPinnedColumns = table.getRightHeaderGroups()[0]?.headers || [];

      // Calcular offsets para columnas pinneadas a la izquierda
      leftPinnedColumns.forEach((header) => {
        const columnId = header.id;
        if (columnRefs.current.has(columnId) && columnRefs.current.get(columnId)?.current) {
          const width = columnRefs.current.get(columnId)!.current!.getBoundingClientRect().width;
          newColumnWidths[columnId] = leftTotal;
          leftTotal += width;
        }
      });

      // Calcular offsets para columnas pinneadas a la derecha (en orden inverso)
      [...rightPinnedColumns].reverse().forEach((header) => {
        const columnId = header.id;
        if (columnRefs.current.has(columnId) && columnRefs.current.get(columnId)?.current) {
          const width = columnRefs.current.get(columnId)!.current!.getBoundingClientRect().width;
          newColumnWidths[columnId] = rightTotal;
          rightTotal += width;
        }
      });

      setColumnWidths(newColumnWidths);
    };

    // Calcular anchos después de que se hayan renderizado las columnas
    const timer = setTimeout(calculateColumnWidths, 100);
    return () => clearTimeout(timer);
  }, [data, table.getState().columnPinning?.left, table.getState().columnPinning?.right, table.getState().columnVisibility]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      if (env.isDevelopment) console.log("No over target, returning");
      return;
    }

    if (active.id !== over.id) {
      if (env.isDevelopment)
        console.log("Column order before:", table.getState().columnOrder);

      const oldIndex = table
        .getState()
        .columnOrder.indexOf(active.id.toString());
      const newIndex = table.getState().columnOrder.indexOf(over.id.toString());

      if (env.isDevelopment)
        console.log("Moving from index", oldIndex, "to index", newIndex);

      // Verificar que los índices sean válidos
      if (oldIndex === -1 || newIndex === -1) {
        if (env.isDevelopment) console.error("Invalid column indices:", { oldIndex, newIndex });
        return;
      }

      // Verificar que no estemos intentando mover una columna a la misma posición
      if (oldIndex === newIndex) {
        return;
      }

      const items = reorder(table.getState().columnOrder, oldIndex, newIndex);

      if (env.isDevelopment) console.log("New column order:", items);

      // Actualizar nuestro estado local primero
      setColumnOrder(items);

      // Luego actualizar la tabla
      table.setColumnOrder(items);

      // Verificar que el cambio se haya aplicado
      if (env.isDevelopment) {
        setTimeout(() => {
          console.log(
            "Column order after timeout:",
            table.getState().columnOrder
          );
          console.log("Local columnOrder after timeout:", items);
        }, 0);

        console.log(
          "Column order after setColumnOrder:",
          table.getState().columnOrder
        );
      }
    } else {
      if (env.isDevelopment) console.log("Same column, no reordering needed");
    }
  };

  const { t } = useTranslation();

  return (
    <div className="w-full flex flex-col space-y-4 flex-grow-1 overflow-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Grupo izquierdo: Filtros y controles de visualización */}
        <div className="flex items-center gap-2">
          {onFilterChange && (
            <FilterPanel
              columns={useMemo(() => (
                columns
                  .map((col) => {
                    const meta = col.meta as any;
                    return {
                      id: col.id?.toString() || "",
                      header: meta?.headerText || col.id?.toString() || "",
                      filterPlaceholder: meta?.filterPlaceholder,
                      filterType: meta?.filterType || 'text',
                      filterable: meta?.filterable !== false
                    };
                  })
                  .filter((col) =>
                    col.id !== "select" &&
                    col.id !== "actions" &&
                    col.id !== "" &&
                    !isAuditField(col.id) &&
                    col.filterable !== false
                  )
              ), [columns])}
              onApplyFilters={(filters) => {
                // Guardar los filtros aplicados en el estado local
                // Asegurarnos de que sea un objeto nuevo para evitar referencias a filtros anteriores
                setAppliedFilters({ ...filters });

                // Mostrar skeleton en el tbody
                setShowSkeleton(true);

                // Llamar al callback con los filtros
                if (onFilterChange) {
                  // Pasamos una copia del objeto para evitar referencias
                  const promise = onFilterChange({ ...filters });

                  // Si el callback devuelve una promesa, esperamos a que se resuelva
                  // para desactivar el estado de carga
                  if (promise && typeof promise.then === "function") {
                    promise
                      .then(() => {
                        // Desactivar el skeleton cuando la promesa se resuelve
                        setShowSkeleton(false);
                      })
                      .catch(() => {
                        // También desactivamos en caso de error
                        setShowSkeleton(false);
                      });
                  } else {
                    // Si no es una promesa, desactivamos después de un tiempo mínimo
                    // para dar feedback visual
                    setTimeout(() => {
                      setShowSkeleton(false);
                    }, 500);
                  }
                } else {
                  // Si no hay callback, desactivamos después de un tiempo mínimo
                  setTimeout(() => {
                    setShowSkeleton(false);
                  }, 500);
                }
              }}
              currentFilters={appliedFilters}
            />
          )}
          <ColumnVisibilitySelector table={table} columnIds={columnIds} />
          
          {/* Botón de refrescar */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => {
                // Iniciar la animación de carga
                setIsRefreshing(true);
                // Mostrar skeleton en el tbody
                setShowSkeleton(true);

                // Llamar a la función de refrescar
                if (onRefresh) {
                  const promise = onRefresh();

                  // Si la función devuelve una promesa, esperamos a que se resuelva
                  if (promise && typeof promise.then === "function") {
                    promise
                      .then(() => {
                        // Desactivar el estado de carga cuando la promesa se resuelve
                        setIsRefreshing(false);
                        setShowSkeleton(false);
                      })
                      .catch(() => {
                        // También desactivamos en caso de error
                        setIsRefreshing(false);
                        setShowSkeleton(false);
                      });
                  } else {
                    // Si no es una promesa, mantenemos la animación por un tiempo mínimo
                    setTimeout(() => {
                      setIsRefreshing(false);
                      // Desactivar el skeleton después de un tiempo
                      setTimeout(() => {
                        setShowSkeleton(false);
                      }, 200); // Un pequeño retraso adicional para evitar parpadeos
                    }, 800); // 800ms es suficiente para que el usuario note la animación
                  }
                } else {
                  // Si no hay función de refrescar, mantenemos la animación por un tiempo mínimo
                  setTimeout(() => {
                    setIsRefreshing(false);
                    // Desactivar el skeleton después de un tiempo
                    setTimeout(() => {
                      setShowSkeleton(false);
                    }, 200); // Un pequeño retraso adicional para evitar parpadeos
                  }, 800); // 800ms es suficiente para que el usuario note la animación
                }
              }}
              disabled={isRefreshing}
              title={t("common.actions.refresh")}
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </Button>
          )}

          {/* Botón para desmarcar todas las columnas pinneadas (excluyendo 'actions') */}
          {(() => {
            const leftPinned = table.getState().columnPinning?.left?.filter(id => id !== 'actions') ?? [];
            const rightPinned = table.getState().columnPinning?.right?.filter(id => id !== 'actions') ?? [];
            const hasBusinessColumnsPinned = leftPinned.length > 0 || rightPinned.length > 0;
            
            return hasBusinessColumnsPinned && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1"
                onClick={() => {
                  // Resetear pinning pero mantener 'actions' a la derecha
                  table.setColumnPinning({
                    left: [],
                    right: ['actions']
                  });
                }}
                title={t("table.unpin_all", "Desanclar todas las columnas")}
              >
                <span className="text-xs">Desanclar todas</span>
              </Button>
            );
          })()}
        </div>
        <div className="flex items-center space-x-2">
          {enableRowSelection &&
            table.getSelectedRowModel().rows.length > 0 && (
              <Button
                onClick={() => {
                  if (env.isDevelopment) {
                    console.log(
                      "Registros seleccionados:",
                      table.getSelectedRowModel().rows.map((row) => row.original)
                    );
                  }
                }}
                variant="outline"
                className="h-9"
              >
                {t("common.actions.selected", {
                  count: table.getSelectedRowModel().rows.length,
                })}
              </Button>
            )}
          {onNew && (
            <Button onClick={onNew} className="h-9">
              {t("common.actions.new")}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-auto flex-grow-1">
        <div className="relative w-full">
          {/* Mostrar skeleton de tabla completa durante carga inicial y operaciones */}
          {showSkeleton || isInitialLoading ? (
            <div className="w-full">
              <table className="w-full caption-bottom text-sm" role="table">
                {/* Skeleton Header */}
                <thead className="[&_tr]:border-b sticky top-0 bg-background z-10 shadow-sm" role="rowgroup">
                  <tr className="border-b" role="row">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <th key={`skeleton-header-${index}`} className="h-12 px-4 text-left align-middle font-medium" scope="col">
                        <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                {/* Skeleton Body */}
                <tbody className="[&_tr:last-child]:border-0" role="rowgroup">
                  {Array.from({ length: 8 }).map((_, rowIndex) => (
                    <tr key={`skeleton-row-${rowIndex}`} className="border-b" role="row">
                      {Array.from({ length: 6 }).map((_, cellIndex) => (
                        <td key={`skeleton-cell-${rowIndex}-${cellIndex}`} className="p-3 align-middle" role="cell">
                          <div className="h-4 bg-muted animate-pulse rounded" style={{
                            width: cellIndex === 0 ? '60px' : 
                                   cellIndex === 1 ? '120px' : 
                                   cellIndex === 2 ? '100px' : 
                                   cellIndex === 3 ? '80px' : 
                                   cellIndex === 4 ? '90px' : '70px'
                          }}></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full caption-bottom text-sm" role="table">
                <thead className="[&_tr]:border-b sticky top-0 bg-background z-10 shadow-sm" role="rowgroup">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      role="row"
                    >
                      <SortableContext
                        items={headerGroup.headers.map((header) => header.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        {headerGroup.headers.map((header) => {
                          // Crear o reutilizar la referencia para esta columna
                          if (!columnRefs.current.has(header.id)) {
                            columnRefs.current.set(header.id, createRef<HTMLTableCellElement | null>());
                          }
                          const ref = columnRefs.current.get(header.id)!;

                          return (
                            <TableHeader 
                              key={header.id} 
                              header={header} 
                              ref={ref}
                              columnWidths={columnWidths}
                            />
                          );
                        })}
                      </SortableContext>
                    </tr>
                  ))}
                </thead>

                <tbody className="[&_tr:last-child]:border-0" role="rowgroup">
                  {table.getRowModel().rows.length ? (
                    // Datos reales
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        role="row"
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isPinned = cell.column.getIsPinned();
                          const offset = columnWidths[cell.column.id] || 0;
                          
                          const getStickyStyles = () => {
                            if (!isPinned) return {};
                            
                            return {
                              position: 'sticky' as const,
                              zIndex: 1,
                              ...(isPinned === 'left' ? { left: `${offset}px` } : {}),
                              ...(isPinned === 'right' ? { right: `${offset}px` } : {}),
                            };
                          };

                          return (
                            <td
                              key={cell.id}
                              className={cn(
                                "p-1 text-nowrap align-middle [&:has([role=checkbox])]:pr-0",
                                isPinned && "bg-background"
                              )}
                              style={{
                                whiteSpace: 'nowrap',
                                ...getStickyStyles(),
                              }}
                              role="cell"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    // Mensaje de no hay resultados
                    <tr role="row">
                      <td
                        colSpan={columns.length}
                        className="h-24 text-center align-middle text-muted-foreground p-4"
                        role="cell"
                      >
                        {t("common.messages.no_results")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DndContext>
          )}
        </div>
      </div>

      <Pagination
        table={table}
        totalCount={totalCount ?? 0}
      />
    </div>
  );
}
