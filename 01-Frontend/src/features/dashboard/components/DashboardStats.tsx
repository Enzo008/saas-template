/**
 * Dashboard Stats Component
 * Componente para mostrar estadísticas del dashboard de charts
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { BarChart3, PieChart, TrendingUp, Zap } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    total: number;
    featured: number;
    byCategory: {
      area: number;
      bar: number;
      line: number;
      pie: number;
      radar: number;
      radial: number;
    };
    filtered: number;
  };
  hasSearchQuery: boolean;
}

export const DashboardStats = ({ 
  stats, 
  hasSearchQuery 
}: DashboardStatsProps) => {
  const categoryStats = [
    { name: 'Área', count: stats.byCategory.area, icon: '📈', color: 'bg-blue-500' },
    { name: 'Barras', count: stats.byCategory.bar, icon: '📊', color: 'bg-green-500' },
    { name: 'Líneas', count: stats.byCategory.line, icon: '📉', color: 'bg-purple-500' },
    { name: 'Circulares', count: stats.byCategory.pie, icon: '🥧', color: 'bg-orange-500' },
    { name: 'Radar', count: stats.byCategory.radar, icon: '🎯', color: 'bg-red-500' },
    { name: 'Radiales', count: stats.byCategory.radial, icon: '🔄', color: 'bg-indigo-500' },
  ];

  const maxCount = Math.max(...categoryStats.map(cat => cat.count));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Charts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Charts</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-sm text-muted-foreground">
            Disponibles en la galería
          </p>
        </CardContent>
      </Card>

      {/* Featured Charts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Destacados</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.featured}</div>
          <p className="text-sm text-muted-foreground">
            Charts recomendados
          </p>
        </CardContent>
      </Card>

      {/* Search Results (if searching) */}
      {hasSearchQuery && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.filtered}</div>
            <p className="text-sm text-muted-foreground">
              Encontrados en búsqueda
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Distribution */}
      <Card className={hasSearchQuery ? 'md:col-span-2 lg:col-span-1' : 'md:col-span-2'}>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <PieChart className="h-4 w-4" />
            <span>Por Categoría</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryStats.map((category) => (
            <div key={category.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {category.count}
                </Badge>
              </div>
              <Progress 
                value={maxCount > 0 ? (category.count / maxCount) * 100 : 0} 
                className="h-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};