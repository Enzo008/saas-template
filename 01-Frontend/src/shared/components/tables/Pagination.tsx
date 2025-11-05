import { Table } from "@tanstack/react-table";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useTranslation } from "react-i18next";

interface PaginationProps<T> {
  table: Table<T>;
  totalCount?: number; // Total de registros (opcional, para paginación del servidor)
}

export default function Pagination<T>({ table, totalCount }: PaginationProps<T>) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          {t('table.rows_per_page', 'Filas por página')}
        </p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center justify-center text-sm">
        <span className="text-muted-foreground">
          {t('table.page_info', 'Página {{current}} de {{total}}', {
            current: table.getState().pagination.pageIndex + 1,
            total: table.getPageCount() || 1
          })}
          {' | '}
          {t('table.total_records', 'Total: {{count}} registros', {
            count: totalCount !== undefined ? totalCount : table.getFilteredRowModel().rows.length
          })}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="hidden h-8 w-8 p-0 sm:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label={t('table.first_page', 'Primera página')}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label={t('table.previous_page', 'Página anterior')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label={t('table.next_page', 'Página siguiente')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="hidden h-8 w-8 p-0 sm:flex"
          onClick={() => table.setPageIndex(Math.max(0, table.getPageCount() - 1))}
          disabled={!table.getCanNextPage()}
          aria-label={t('table.last_page', 'Última página')}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

