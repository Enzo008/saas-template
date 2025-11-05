/**
 * Dashboard principal para la galería de charts
 * Muestra todos los charts disponibles organizados por categorías
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Search, Grid, List, Code, X } from 'lucide-react';
import { 
  chartCategories,
  ChartDefinition,
  getChartsByCategory
} from '../config/chartConfig';
import { ChartCard } from '../components/ChartCard';
import { DashboardStats } from '../components/DashboardStats';
import { useDashboard, SortBy } from '../hooks/useDashboard';
import { cn } from "@/lib/utils";

const Dashboard = () => {
  // Usar nuestro hook personalizado para manejar la lógica del dashboard
  const {
    activeTab,
    searchQuery,
    debouncedSearchQuery,
    viewMode,
    sortBy,
    stats,
    filteredCharts,
    handleTabChange,
    handleSearchChange,
    handleViewModeChange,
    handleSortChange
  } = useDashboard();

  // Estados para el modal de código
  const [selectedChart, setSelectedChart] = useState<ChartDefinition | null>(null);
  const [showFullscreenDialog, setShowFullscreenDialog] = useState(false);

  // Handlers
  const handleFullscreen = (chart: ChartDefinition) => {
    setSelectedChart(chart);
    setShowFullscreenDialog(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chart Gallery</h1>
            <p className="text-muted-foreground mt-2">
              Explora nuestra colección completa de charts interactivos y personalizables
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <span className="text-sm text-muted-foreground">Total Charts</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.featured}</div>
              <span className="text-sm text-muted-foreground">Destacados</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{chartCategories.length}</div>
              <span className="text-sm text-muted-foreground">Categorías</span>
            </div>
          </div>
        </div>

        {/* Stats Component */}
        <DashboardStats 
          stats={stats} 
          hasSearchQuery={!!debouncedSearchQuery}
        />
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar charts..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className="px-3"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortBy)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="name">Nombre</option>
            <option value="category">Categoría</option>
            <option value="featured">Destacados</option>
          </select>
        </div>
      </div>

      {/* Search Results */}
      {debouncedSearchQuery && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Resultados de búsqueda</h3>
              <p className="text-sm text-muted-foreground">
                {filteredCharts.length} charts encontrados para "{debouncedSearchQuery}"
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearchChange('')}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          </div>
        </div>
      )}

      {/* Charts Grid/List */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {chartCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
              <span>{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Category Tabs */}
        {chartCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </h2>
                <p className="text-muted-foreground mt-1">{category.description}</p>
              </div>
              <Badge variant="secondary">
                {getChartsByCategory(category.id as ChartDefinition["category"]).length} charts
              </Badge>
            </div>

            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              {getChartsByCategory(category.id as ChartDefinition["category"]).map((chart: ChartDefinition) => (
                <ChartCard
                  key={chart.id}
                  chart={chart}
                  onFullscreen={handleFullscreen}
                  className={viewMode === 'list' ? 'max-w-none' : ''}
                />
              ))}
            </div>

            {/* Empty State */}
            {getChartsByCategory(category.id as ChartDefinition["category"]).length === 0 && !debouncedSearchQuery && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-semibold">No hay charts en esta categoría</h3>
                <p className="text-muted-foreground mt-2">
                  Esta categoría está en desarrollo. ¡Pronto tendremos más charts!
                </p>
              </div>
            )}
          </TabsContent>
        ))}

        {/* All Charts Tab */}
        <TabsContent value="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Todos los Charts</h2>
              <p className="text-muted-foreground mt-1">
                Explora toda nuestra colección de componentes de visualización
              </p>
            </div>
            <Badge variant="secondary">
              {filteredCharts.length} charts
            </Badge>
          </div>

          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {filteredCharts.map((chart: ChartDefinition) => (
              <ChartCard
                key={chart.id}
                chart={chart}
                onFullscreen={handleFullscreen}
                className={viewMode === 'list' ? 'max-w-none' : ''}
              />
            ))}
          </div>

          {/* Empty State for Search */}
          {filteredCharts.length === 0 && debouncedSearchQuery && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold">No se encontraron resultados</h3>
              <p className="text-muted-foreground mt-2">
                No hay charts que coincidan con "{debouncedSearchQuery}". 
                Intenta con otros términos de búsqueda.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Fullscreen Code Dialog */}
      <Dialog open={showFullscreenDialog} onOpenChange={setShowFullscreenDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>Código: {selectedChart?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Implementación del componente {selectedChart?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <pre className="text-sm overflow-x-auto">
                <code>{`import { ${selectedChart?.name.replace(/\s+/g, '')} } from '@/shared/components/charts';

// Uso básico
<${selectedChart?.name.replace(/\s+/g, '')} />

// Con props personalizadas
<${selectedChart?.name.replace(/\s+/g, '')} 
  data={data}
  config={config}
  className="w-full h-64"
/>`}</code>
              </pre>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Descripción</h4>
              <p className="text-sm text-muted-foreground">
                {selectedChart?.description}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Características</h4>
              <div className="flex flex-wrap gap-2">
                {selectedChart?.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
