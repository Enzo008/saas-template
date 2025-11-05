/**
 * Dashboard Hook
 * Hook personalizado para manejar la lógica del dashboard de charts
 */

import { useState, useMemo, useCallback } from 'react';
import { 
  chartDefinitions, 
  getFeaturedCharts, 
  getChartsByCategory, 
  searchCharts,
  ChartDefinition 
} from '../config/chartConfig';
import { useDebounce } from '@/shared/hooks/performance/useDebounce';

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'category' | 'difficulty';
export type TabValue = 'featured' | 'area' | 'bar' | 'line' | 'pie' | 'radar' | 'radial' | 'all';

interface UseDashboardOptions {
  initialTab?: TabValue;
  initialViewMode?: ViewMode;
  initialSortBy?: SortBy;
}

export const useDashboard = (options: UseDashboardOptions = {}) => {
  const {
    initialTab = 'featured',
    initialViewMode = 'grid',
    initialSortBy = 'name'
  } = options;

  // State
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);

  // Debounce search query para mejor performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filtrar y ordenar charts
  const filteredCharts = useMemo(() => {
    let charts: ChartDefinition[] = [];

    // Obtener charts según la tab activa
    if (activeTab === 'featured') {
      charts = getFeaturedCharts();
    } else if (activeTab === 'all') {
      charts = chartDefinitions;
    } else {
      charts = getChartsByCategory(activeTab as ChartDefinition['category']);
    }

    // Aplicar búsqueda si hay query
    if (debouncedSearchQuery.trim()) {
      charts = searchCharts(debouncedSearchQuery);
    }

    // Ordenar charts
    charts.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'difficulty':
          const difficultyOrder = { basic: 0, intermediate: 1, advanced: 2 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });

    return charts;
  }, [activeTab, debouncedSearchQuery, sortBy]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: chartDefinitions.length,
    featured: getFeaturedCharts().length,
    byCategory: {
      area: getChartsByCategory('area').length,
      bar: getChartsByCategory('bar').length,
      line: getChartsByCategory('line').length,
      pie: getChartsByCategory('pie').length,
      radar: getChartsByCategory('radar').length,
      radial: getChartsByCategory('radial').length,
    },
    filtered: filteredCharts.length
  }), [filteredCharts.length]);

  // Handlers
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as TabValue);
    // Limpiar búsqueda al cambiar de tab
    if (searchQuery) {
      setSearchQuery('');
    }
  }, [searchQuery]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleSortChange = useCallback((sort: SortBy) => {
    setSortBy(sort);
  }, []);

  // Función para obtener charts por dificultad
  const getChartsByDifficulty = useCallback((difficulty: ChartDefinition['difficulty']) => {
    return filteredCharts.filter(chart => chart.difficulty === difficulty);
  }, [filteredCharts]);

  // Función para obtener charts recomendados basados en la categoría actual
  const getRecommendedCharts = useCallback(() => {
    if (activeTab === 'featured' || activeTab === 'all') {
      return getFeaturedCharts().slice(0, 3);
    }
    
    const categoryCharts = getChartsByCategory(activeTab as ChartDefinition['category']);
    return categoryCharts.filter(chart => chart.featured).slice(0, 3);
  }, [activeTab]);

  return {
    // State
    activeTab,
    searchQuery,
    debouncedSearchQuery,
    viewMode,
    sortBy,
    
    // Computed
    filteredCharts,
    stats,
    
    // Handlers
    handleTabChange,
    handleSearchChange,
    handleClearSearch,
    handleViewModeChange,
    handleSortChange,
    
    // Utilities
    getChartsByDifficulty,
    getRecommendedCharts,
    
    // Flags
    hasSearchQuery: debouncedSearchQuery.trim().length > 0,
    hasResults: filteredCharts.length > 0,
    isEmpty: filteredCharts.length === 0 && !debouncedSearchQuery.trim()
  };
};