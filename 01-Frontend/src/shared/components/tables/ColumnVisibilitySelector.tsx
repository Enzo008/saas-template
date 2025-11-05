import { Table } from "@tanstack/react-table";
import { convertCamelToTitleCase } from "./Table.utils";
import { useState, useRef, useEffect } from "react";
import { Columns } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { isAuditField, filterOutAuditFields, getAuditFields } from "@/shared/utils/auditFieldUtils";

interface ColumnSelector<T> {
  table: Table<T>;
  columnIds: string[];
}

export const ColumnVisibilitySelector = <T,>({
  table,
  columnIds,
}: ColumnSelector<T>) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener las columnas actualmente visibles
  const columnVisibilityCheckboxState = Object.entries(
    table.getState().columnVisibility || {}
  )
    .filter(([_, value]) => value)
    .map(([key]) => key);

  // Obtener el header de una columna
  const getColumnHeader = (columnId: string): string => {
    const column = table.getAllColumns().find(col => col.id === columnId);
    if (!column) return convertCamelToTitleCase(columnId);

    // Intentar obtener el headerText de la metadata primero
    const meta = column.columnDef.meta as any;
    if (meta?.headerText) {
      return meta.headerText;
    }

    // Fallback: si el header es string, usarlo
    const header = column.columnDef.header;
    if (typeof header === 'string') {
      return header;
    }

    // Último fallback: convertir camelCase a Title Case
    return convertCamelToTitleCase(columnId);
  };

  // Manejar cambio en el radio group
  const handleRadioChange = (value: string) => {
    const newVisibility = columnIds.reduce((acc: { [id: string]: boolean }, val) => {
      if (value === "all") {
        acc[val] = true;
      } else if (value === "none") {
        acc[val] = false;
      } else {
        // "business" - mostrar solo campos de negocio (ocultar auditoría)
        acc[val] = !isAuditField(val);
      }
      return acc;
    }, {});
    table.setColumnVisibility(newVisibility);
  };

  // Manejar cambio en los checkboxes
  const handleCheckboxChange = (columnId: string, checked: boolean) => {
    table.setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: checked,
    }));
  };


  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && triggerRef.current && dropdownRef.current) {
        const target = e.target as HTMLElement;

        if (
          !dropdownRef.current.contains(target) && 
          !triggerRef.current.contains(target)
        ) {
          setOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0"
        aria-label={t('table.column_visibility', 'Visibilidad de columnas')}
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="column-visibility-menu"
      >
        <Columns className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {open && (() => {
          const rect = triggerRef.current?.getBoundingClientRect();
          
          return (
            <motion.div 
              ref={dropdownRef}
              className="bg-popover text-popover-foreground w-[200px] rounded-md border p-0 shadow-md outline-none"
              style={{
                position: 'fixed',
                left: rect?.left || 0,
                top: rect ? rect.bottom + 5 : 0,
                zIndex: 9999,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              initial={{
                opacity: 0,
                scale: 0,
                x: rect ? (rect.width / 2 - 100) : 0,
                y: rect ? -(rect.height + 5) : 0,
                transformOrigin: 'top left'
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0,
                x: rect ? (rect.width / 2 - 100) : 0,
                y: rect ? -(rect.height + 5) : 0
              }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3
              }}
              id="column-visibility-menu"
              role="menu"
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setOpen(false);
                  setTimeout(() => triggerRef.current?.focus(), 0);
                }
              }}
            >
          <div className="p-3">
            <div className="text-sm font-medium leading-none mb-3">
              {t('table.toggle_columns', 'Mostrar/Ocultar columnas')}
            </div>
            <RadioGroup 
              className="flex flex-col gap-2 mb-3"
              value={
                columnVisibilityCheckboxState.length === columnIds.length 
                  ? "all" 
                  : columnVisibilityCheckboxState.length === filterOutAuditFields(columnIds).length &&
                    getAuditFields(columnIds).every(auditField => !columnVisibilityCheckboxState.includes(auditField))
                  ? "business"
                  : "custom"
              }
              onValueChange={handleRadioChange}
              role="none"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" aria-checked={false} />
                <Label htmlFor="all">{t('table.show_all', 'Mostrar todas')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business" id="business" aria-checked={false} />
                <Label htmlFor="business">{t('table.show_business', 'Solo negocio')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" aria-checked={false} />
                <Label htmlFor="none">{t('table.hide_all', 'Ocultar todas')}</Label>
              </div>
            </RadioGroup>

            <Separator className="my-2" />

            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {/* Campos de negocio primero */}
              {filterOutAuditFields(columnIds).map((columnId) => (
                <div key={columnId} className="flex items-center space-x-2" role="menuitemcheckbox" aria-checked={columnVisibilityCheckboxState.includes(columnId)}>
                  <Checkbox
                    id={`column-${columnId}`}
                    checked={columnVisibilityCheckboxState.includes(columnId)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(columnId, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`column-${columnId}`}
                    className="text-sm"
                  >
                    {getColumnHeader(columnId)}
                  </Label>
                </div>
              ))}

              {/* Separador si hay campos de auditoría */}
              {getAuditFields(columnIds).length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="text-xs text-muted-foreground px-1 mb-1">
                    {t('table.audit_fields', 'Campos de auditoría')}
                  </div>
                </>
              )}

              {/* Campos de auditoría al final */}
              {getAuditFields(columnIds).map((columnId) => (
                <div key={columnId} className="flex items-center space-x-2" role="menuitemcheckbox" aria-checked={columnVisibilityCheckboxState.includes(columnId)}>
                  <Checkbox
                    id={`column-${columnId}`}
                    checked={columnVisibilityCheckboxState.includes(columnId)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(columnId, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`column-${columnId}`}
                    className="text-sm text-muted-foreground"
                  >
                    {getColumnHeader(columnId)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default ColumnVisibilitySelector;