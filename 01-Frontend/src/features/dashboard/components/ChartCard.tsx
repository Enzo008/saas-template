/**
 * Chart Card Component
 * Componente optimizado para mostrar charts con lazy loading y performance
 */

import { createElement, Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Eye, Code, Maximize2 } from 'lucide-react';
import { ChartDefinition } from '../config/chartConfig';
import { useIntersectionObserver } from '@/shared/hooks/browser/useIntersectionObserver';
import { cn } from "@/lib/utils";

interface ChartCardProps {
  chart: ChartDefinition;
  onViewCode?: (chart: ChartDefinition) => void;
  onFullscreen?: (chart: ChartDefinition) => void;
  className?: string;
}

// Skeleton para charts mientras cargan
const ChartSkeleton = () => (
  <div className="space-y-3 p-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="h-64 w-full rounded-lg" />
    <div className="flex space-x-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-18" />
    </div>
  </div>
);

export const ChartCard = ({
  chart,
  onViewCode,
  onFullscreen,
  className
}: ChartCardProps) => {
  const [showChart, setShowChart] = useState(false);
  const { elementRef, isIntersecting, hasTriggered } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  // Cargar chart cuando sea visible
  useEffect(() => {
    if (isIntersecting || hasTriggered) {
      // Pequeño delay para mejorar la experiencia
      const timer = setTimeout(() => setShowChart(true), 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isIntersecting, hasTriggered]);

  // Función para obtener el color del badge según la dificultad
  const getDifficultyBadgeVariant = (difficulty: ChartDefinition['difficulty']) => {
    switch (difficulty) {
      case 'basic':
        return 'default';
      case 'intermediate':
        return 'secondary';
      case 'advanced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Función para obtener el texto de dificultad
  const getDifficultyText = (difficulty: ChartDefinition['difficulty']) => {
    switch (difficulty) {
      case 'basic':
        return 'Básico';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Card 
      ref={elementRef as any}
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:scale-[1.02]',
        'border-border/50 hover:border-border',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold leading-tight">
              {chart.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {chart.description}
            </CardDescription>
          </div>
          
          {/* Badge de dificultad */}
          <Badge 
            variant={getDifficultyBadgeVariant(chart.difficulty) as any}
            className="ml-2 shrink-0"
          >
            {getDifficultyText(chart.difficulty)}
          </Badge>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-2">
          {chart.tags.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs px-2 py-0.5"
            >
              {tag}
            </Badge>
          ))}
          {chart.tags.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{chart.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Chart Container */}
        <div className="relative min-h-[300px] rounded-lg border bg-card/50">
          {!showChart ? (
            // Placeholder antes de que sea visible
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Eye className="w-8 h-8" />
                </div>
                <p className="text-sm">Chart se cargará cuando sea visible</p>
              </div>
            </div>
          ) : (
            // Chart real con Suspense
            <Suspense fallback={<ChartSkeleton />}>
              <div className="p-4">
                {createElement(chart.component, { key: chart.id })}
              </div>
            </Suspense>
          )}

          {/* Overlay con acciones (visible en hover) */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewCode?.(chart)}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Code className="w-4 h-4 mr-2" />
              Ver Código
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onFullscreen?.(chart)}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Pantalla Completa
            </Button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
          <span>Categoría: {chart.category}</span>
          {chart.featured && (
            <Badge variant="outline" className="text-xs">
              ⭐ Destacado
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};