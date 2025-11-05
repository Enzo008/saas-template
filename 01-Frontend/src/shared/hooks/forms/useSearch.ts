import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '../performance/useDebounce';

interface SearchOptions<T> {
  searchFields: (keyof T)[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
  minSearchLength?: number;
  debounceMs?: number;
  customFilter?: (item: T, query: string) => boolean;
}

interface SearchResult<T> {
  items: T[];
  totalCount: number;
  hasResults: boolean;
  isSearching: boolean;
  query: string;
}

/**
 * Hook para búsqueda y filtrado de datos
 * Útil para tablas, listas, autocompletado, etc.
 */
export function useSearch<T>(
  data: T[],
  options: SearchOptions<T>
) {
  const {
    searchFields,
    caseSensitive = false,
    exactMatch = false,
    minSearchLength = 1,
    debounceMs = 300,
    customFilter
  } = options;

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedQuery = useDebounce(query, debounceMs);

  const filteredData = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minSearchLength) {
      return data;
    }

    const searchTerm = caseSensitive ? debouncedQuery : debouncedQuery.toLowerCase();

    return data.filter(item => {
      // Usar filtro personalizado si está disponible
      if (customFilter) {
        return customFilter(item, debouncedQuery);
      }

      // Buscar en los campos especificados
      return searchFields.some(field => {
        const fieldValue = item[field];
        if (fieldValue == null) return false;

        const stringValue = String(fieldValue);
        const searchValue = caseSensitive ? stringValue : stringValue.toLowerCase();

        return exactMatch 
          ? searchValue === searchTerm
          : searchValue.includes(searchTerm);
      });
    });
  }, [data, debouncedQuery, searchFields, caseSensitive, exactMatch, minSearchLength, customFilter]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setIsSearching(true);
    
    // Simular que la búsqueda terminó después del debounce
    setTimeout(() => {
      setIsSearching(false);
    }, debounceMs + 50);
  }, [debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsSearching(false);
  }, []);

  const result: SearchResult<T> = {
    items: filteredData,
    totalCount: filteredData.length,
    hasResults: filteredData.length > 0,
    isSearching: isSearching && query.length >= minSearchLength,
    query: debouncedQuery
  };

  return {
    ...result,
    updateQuery,
    clearSearch,
    setQuery: updateQuery
  } as const;
}

/**
 * Hook para búsqueda avanzada con múltiples filtros
 */
export function useAdvancedSearch<T>(
  data: T[],
  searchConfig: {
    textSearch?: SearchOptions<T>;
    filters?: {
      [key: string]: {
        field: keyof T;
        type: 'select' | 'range' | 'boolean' | 'date';
        options?: any[];
      };
    };
  }
) {
  const [textQuery, setTextQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortConfig, setSortConfig] = useState<{
    field: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Búsqueda de texto
  const textSearchResult = useSearch(data, {
    ...searchConfig.textSearch!,
    searchFields: searchConfig.textSearch?.searchFields || []
  });

  const filteredAndSortedData = useMemo(() => {
    let result = textQuery ? textSearchResult.items : data;

    // Aplicar filtros adicionales
    Object.entries(filters).forEach(([filterKey, filterValue]) => {
      if (filterValue == null || filterValue === '') return;

      const filterConfig = searchConfig.filters?.[filterKey];
      if (!filterConfig) return;

      result = result.filter(item => {
        const itemValue = item[filterConfig.field];

        switch (filterConfig.type) {
          case 'select':
            return itemValue === filterValue;
          case 'boolean':
            return Boolean(itemValue) === Boolean(filterValue);
          case 'range':
            const [min, max] = filterValue;
            const numValue = Number(itemValue);
            return numValue >= min && numValue <= max;
          case 'date':
            const itemDate = new Date(itemValue as any);
            const [startDate, endDate] = filterValue;
            return itemDate >= startDate && itemDate <= endDate;
          default:
            return true;
        }
      });
    });

    // Aplicar ordenamiento
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        if (aValue < bValue) comparison = -1;

        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, textSearchResult.items, textQuery, filters, sortConfig, searchConfig.filters]);

  const updateTextQuery = useCallback((query: string) => {
    setTextQuery(query);
    textSearchResult.updateQuery(query);
  }, [textSearchResult]);

  const updateFilter = useCallback((filterKey: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);

  const clearFilter = useCallback((filterKey: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setTextQuery('');
    textSearchResult.clearSearch();
  }, [textSearchResult]);

  const updateSort = useCallback((field: keyof T, direction?: 'asc' | 'desc') => {
    setSortConfig(prev => {
      if (prev?.field === field) {
        // Toggle direction si es el mismo campo
        const newDirection = direction || (prev.direction === 'asc' ? 'desc' : 'asc');
        return { field, direction: newDirection };
      }
      return { field, direction: direction || 'asc' };
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  return {
    items: filteredAndSortedData,
    totalCount: filteredAndSortedData.length,
    textQuery,
    filters,
    sortConfig,
    updateTextQuery,
    updateFilter,
    clearFilter,
    clearAllFilters,
    updateSort,
    clearSort,
    hasActiveFilters: Object.keys(filters).length > 0 || textQuery.length > 0
  } as const;
}