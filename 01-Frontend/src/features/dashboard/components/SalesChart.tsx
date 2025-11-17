/**
 * Sales Chart - Gráfico de ventas mensuales
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/shared/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

const chartData = [
  { month: 'Ene', revenue: 84000, profit: 25200 },
  { month: 'Feb', revenue: 76000, profit: 22800 },
  { month: 'Mar', revenue: 102000, profit: 30600 },
  { month: 'Abr', revenue: 92000, profit: 27600 },
  { month: 'May', revenue: 108000, profit: 32400 },
  { month: 'Jun', revenue: 124000, profit: 37200 },
  { month: 'Jul', revenue: 116000, profit: 34800 },
  { month: 'Ago', revenue: 130000, profit: 39000 },
  { month: 'Sep', revenue: 122000, profit: 36600 },
  { month: 'Oct', revenue: 144000, profit: 43200 },
  { month: 'Nov', revenue: 136000, profit: 40800 },
  { month: 'Dic', revenue: 150000, profit: 45000 }
];

const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "var(--chart-1)",
  },
  profit: {
    label: "Ganancias",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const SalesChart = () => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Ventas y Ingresos</CardTitle>
        <CardDescription>
          Evolución mensual de ventas e ingresos del año
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="month" 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area 
              dataKey="revenue" 
              type="natural"
              fill="var(--color-revenue)"
              fillOpacity={0.4}
              stroke="var(--color-revenue)"
              stackId="a"
            />
            <Area 
              dataKey="profit" 
              type="natural"
              fill="var(--color-profit)"
              fillOpacity={0.4}
              stroke="var(--color-profit)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
