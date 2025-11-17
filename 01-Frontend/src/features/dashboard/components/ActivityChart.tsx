/**
 * Activity Chart - Gráfico de actividad de usuarios
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/shared/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

const chartData = [
  { hour: '00:00', users: 120 },
  { hour: '03:00', users: 80 },
  { hour: '06:00', users: 150 },
  { hour: '09:00', users: 450 },
  { hour: '12:00', users: 680 },
  { hour: '15:00', users: 520 },
  { hour: '18:00', users: 720 },
  { hour: '21:00', users: 380 }
];

const chartConfig = {
  users: {
    label: "Usuarios",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export const ActivityChart = () => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Actividad de Usuarios</CardTitle>
        <CardDescription>
          Usuarios activos por hora del día
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="hour" 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar 
              dataKey="users" 
              fill="var(--color-users)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
