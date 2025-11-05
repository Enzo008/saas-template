/**
 * Dashboard Feature - Exports
 * Exportaciones centralizadas del feature de dashboard
 */

// Pages
export { default as Dashboard } from './pages/Dashboard';

// Components
export { ChartCard } from './components/ChartCard';
export { DashboardStats } from './components/DashboardStats';

// Hooks
export { useDashboard } from './hooks/useDashboard';
export type { ViewMode, SortBy, TabValue } from './hooks/useDashboard';

// Config
export { 
  chartDefinitions, 
  chartCategories, 
  getFeaturedCharts, 
  getChartsByCategory, 
  searchCharts,
  getChartsByDifficulty
} from './config/chartConfig';
export type { ChartDefinition } from './config/chartConfig';