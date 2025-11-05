import { flexRender, Header } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, MoreVertical, GripVertical } from "lucide-react";
import { useRef, useState, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface TableHeaderProps<T> {
  header: Header<T, unknown>;
  columnWidths: Record<string, number>;
}

const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps<any>>(
  ({ header, columnWidths }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPinned = header.column.getIsPinned();
  const isSorted = header.column.getIsSorted();
  const canSort = header.column.getCanSort();
  const { t } = useTranslation();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.id,
    disabled: !!isPinned,
  });

  // Cerrar el menú cuando se hace clic fuera
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  // Agregar/remover event listener
  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSort = () => {
    if (!canSort) return;
    
    const currentSort = header.column.getIsSorted();
    if (!currentSort) {
      header.column.toggleSorting(false); // asc
    } else if (currentSort === "asc") {
      header.column.toggleSorting(true); // desc
    } else {
      header.column.clearSorting(); // remove sorting
    }
  };

  // Calcular estilos para columnas pinneadas
  const getStickyStyles = () => {
    if (!isPinned) return {};
    
    const offset = columnWidths[header.id] || 0;
    
    return {
      position: 'sticky' as const,
      zIndex: 1,
      ...(isPinned === 'left' ? { left: `${offset}px` } : {}),
      ...(isPinned === 'right' ? { right: `${offset}px` } : {}),
    };
  };

  return (
    <th
      ref={(el) => {
        // Aplicar ambas referencias: la del sortable y la que pasamos para medir anchos
        setNodeRef(el);
        if (ref && typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      colSpan={header.colSpan}
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
        isPinned && "bg-background",
        isDragging && "opacity-50"
      )}
      style={{
        width: header.getSize(),
        position: isPinned ? "sticky" : "relative",
        transform: CSS.Transform.toString(transform),
        transition,
        whiteSpace: 'nowrap',
        ...getStickyStyles(),
      }}
      role="columnheader"
      scope="col"
      aria-sort={
        isSorted === false || isSorted === undefined
          ? "none"
          : isSorted === "asc"
          ? "ascending"
          : "descending"
      }
    >
      <div className="flex items-center justify-between gap-2 group">
        {/* Drag Handle */}
        {!isPinned && (
          <div
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
            role="button"
            aria-label={t('table.reorder_column', 'Reordenar columna')}
            aria-grabbed={isDragging}
            tabIndex={0}
          >
            <GripVertical size={16} className="text-muted-foreground" />
          </div>
        )}

        {/* Content and Sort */}
        <div 
          className={cn(
            "flex-1 flex items-center justify-center gap-1",
            canSort && "cursor-pointer select-none"
          )}
          onClick={handleSort}
          onKeyDown={(e) => {
            if (!canSort) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSort();
            }
          }}
          role={canSort ? 'button' : undefined}
          tabIndex={canSort ? 0 : -1}
        >
          <span className="text-foreground">
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </span>
          {canSort && (
            <span className="text-muted-foreground">
              {!isSorted && "↕"}
              {isSorted === "asc" && <ArrowUp size={16} />}
              {isSorted === "desc" && <ArrowDown size={16} />}
            </span>
          )}
        </div>

        {/* Options Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-sm hover:bg-accent/50 transition-all"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical size={16} className="text-muted-foreground" />
          </button>

          {isMenuOpen && (
            <div 
              className="absolute right-0 top-full mt-1 z-50 min-w-[150px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
              onClick={(e) => e.stopPropagation()}
              role="menu"
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }
              }}
            >
              <div className="p-1">
                {isPinned !== "right" && (
                  <button
                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      header.column.pin("right");
                      setIsMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    {t('table.pin_right', 'Pin a la derecha')}
                  </button>
                )}
                {isPinned !== "left" && (
                  <button
                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      header.column.pin("left");
                      setIsMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    {t('table.pin_left', 'Pin a la izquierda')}
                  </button>
                )}
                {isPinned && (
                  <button
                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      header.column.pin(false);
                      setIsMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    {t('table.unpin', 'Desanclar')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </th>
  );
});

TableHeader.displayName = 'TableHeader';

export default TableHeader;
