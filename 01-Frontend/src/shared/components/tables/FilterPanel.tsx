import { useState, useEffect, useRef } from 'react';
import { X, Filter, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

// Definir una interfaz simplificada para las columnas
interface FilterableColumn {
  id: string;
  header: string;
  filterPlaceholder?: string; // Placeholder personalizado
  filterType?: 'text' | 'number' | 'date' | 'select'; // Tipo de filtro
  filterable?: boolean; // Si es filtrable
}

interface FilterPanelProps {
  columns: FilterableColumn[];
  onApplyFilters: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
  currentFilters?: Record<string, any>;
}

export default function FilterPanel({
  columns,
  onApplyFilters,
  initialFilters = {},
  currentFilters = {}
}: FilterPanelProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Inicializar con currentFilters como fuente única de verdad
  const [filterValues, setFilterValues] = useState<Record<string, any>>({...initialFilters, ...currentFilters});
  
  // Solo sincronizar cuando se abre el panel (no constantemente)
  useEffect(() => {
    if (isOpen) {
      setFilterValues({...currentFilters});
    }
  }, [isOpen]); // Solo cuando cambia isOpen, no currentFilters

  // Limpiar filtros de columnas que ya no están disponibles
  useEffect(() => {
    const availableColumnIds = columns.map(col => col.id);
    const currentFilterKeys = Object.keys(filterValues);
    
    // Verificar si hay filtros para columnas que ya no están disponibles
    const hasObsoleteFilters = currentFilterKeys.some(key => !availableColumnIds.includes(key));
    
    if (hasObsoleteFilters) {
      const cleanedFilters = Object.entries(filterValues)
        .filter(([key]) => availableColumnIds.includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      setFilterValues(cleanedFilters);
    }
  }, [columns, filterValues]);

  const handleInputChange = (columnId: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const handleApplyFilters = () => {
    // Filtrar valores vacíos y limpiar strings con solo espacios
    const nonEmptyFilters = Object.entries(filterValues)
      .filter(([_, value]) => value !== '' && value?.toString().trim() !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    // SIEMPRE aplicar filtros - incluso si está vacío (para limpiar filtros anteriores)
    console.log('🔍 Applying filters:', nonEmptyFilters);
    onApplyFilters(nonEmptyFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    // Limpiar los valores de los filtros
    setFilterValues({});
    
    // Aplicar filtros vacíos para limpiar la tabla
    onApplyFilters({});
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="outline"
        size="sm"
        className="h-9 gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={16} />
        {t('common.actions.filter')}
      </Button>

      <AnimatePresence>
        {isOpen && (() => {
          const rect = triggerRef.current?.getBoundingClientRect();
          
          return (
            <motion.div 
              className="absolute left-0 top-full mt-2 z-50 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-4"
              initial={{
                opacity: 0,
                scale: 0,
                x: rect ? (rect.width / 2) : 0,
                y: rect ? -(rect.height + 8) : 0,
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
                x: rect ? (rect.width / 2) : 0,
                y: rect ? -(rect.height + 8) : 0
              }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3
              }}
            >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">{t('common.titles.filters')}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Contenido scrolleable */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {columns.map(column => {
              // Determinar el placeholder a usar
              const placeholder = column.filterPlaceholder 
                ? column.filterPlaceholder
                : `${t('common.actions.filter_by')} ${column.header}`;
              
              // Determinar el tipo de input
              const inputType = column.filterType === 'number' ? 'number' : 'text';
              
              return (
                <div key={column.id} className="space-y-1">
                  <Label htmlFor={`filter-${column.id}`} className="text-xs">
                    {column.header}
                  </Label>
                  <Input
                    id={`filter-${column.id}`}
                    type={inputType}
                    placeholder={placeholder}
                    value={filterValues[column.id] || ''}
                    onChange={(e) => handleInputChange(column.id, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              );
            })}
          </div>

          {/* Footer fijo fuera del scroll del contenido */}
          <div className="flex justify-between mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              {t('common.actions.clear')}
            </Button>
            <Button
              size="sm"
              onClick={handleApplyFilters}
              className="gap-1"
            >
              <Search size={14} />
              {t('common.actions.search')}
            </Button>
          </div>
        </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
