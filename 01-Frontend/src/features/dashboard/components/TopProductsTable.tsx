/**
 * Top Products Table - Tabla de productos más vendidos
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TopProduct } from '../types/dashboard.types';

interface TopProductsTableProps {
  data: TopProduct[];
}

export const TopProductsTable = ({ data }: TopProductsTableProps) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>
          Top 5 productos con mejor rendimiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.sales} ventas
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  ${product.revenue.toLocaleString()}
                </span>
                <Badge 
                  variant={product.trend === 'up' ? 'default' : 'secondary'}
                  className={cn(
                    "flex items-center space-x-1",
                    product.trend === 'up' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  )}
                >
                  {product.trend === 'up' ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
