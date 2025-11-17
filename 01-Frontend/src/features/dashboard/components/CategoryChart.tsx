/**
 * Category Chart - Gráfico de distribución por categorías
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/shared/components/ui/chart';
import { Pie, PieChart, Label } from 'recharts';

const chartData = [
  { category: "electronica", name: "Electrónica", value: 35, fill: "var(--color-electronica)" },
  { category: "ropa", name: "Ropa", value: 25, fill: "var(--color-ropa)" },
  { category: "hogar", name: "Hogar", value: 20, fill: "var(--color-hogar)" },
  { category: "deportes", name: "Deportes", value: 12, fill: "var(--color-deportes)" },
  { category: "otros", name: "Otros", value: 8, fill: "var(--color-otros)" },
];

const chartConfig = {
  value: {
    label: "Ventas",
  },
  electronica: {
    label: "Electrónica",
    color: "var(--chart-1)",
  },
  ropa: {
    label: "Ropa",
    color: "var(--chart-2)",
  },
  hogar: {
    label: "Hogar",
    color: "var(--chart-3)",
  },
  deportes: {
    label: "Deportes",
    color: "var(--chart-4)",
  },
  otros: {
    label: "Otros",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export const CategoryChart = () => {
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Ventas por Categoría</CardTitle>
        <CardDescription>
          Distribución de ventas por categoría de producto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
