/**
 * KPI Card - Tarjeta de indicador clave de rendimiento
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ArrowDown, ArrowUp, DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KPICard as KPICardType } from '../types/dashboard.types';

const iconMap = {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp
};

interface KPICardProps {
  data: KPICardType;
}

export const KPICard = ({ data }: KPICardProps) => {
  const Icon = iconMap[data.icon as keyof typeof iconMap] || DollarSign;
  const isPositive = data.trend === 'up';
  const TrendIcon = isPositive ? ArrowUp : ArrowDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {data.title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.value}</div>
        <div className="flex items-center text-xs mt-1">
          <TrendIcon className={cn(
            "h-3 w-3 mr-1",
            isPositive ? "text-green-500" : "text-red-500"
          )} />
          <span className={cn(
            "font-medium",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {Math.abs(data.change)}%
          </span>
          <span className="text-muted-foreground ml-1">
            {data.description}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
