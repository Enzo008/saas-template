/**
 * Activity Chart - Gráfico de actividad de usuarios
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { UserActivity } from '../types/dashboard.types';

interface ActivityChartProps {
  data: UserActivity[];
}

export const ActivityChart = ({ data }: ActivityChartProps) => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Actividad de Usuarios</CardTitle>
        <CardDescription>
          Usuarios activos por hora del día
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="hour" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="users" 
              fill="hsl(var(--chart-3))" 
              radius={[8, 8, 0, 0]}
              name="Usuarios"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
