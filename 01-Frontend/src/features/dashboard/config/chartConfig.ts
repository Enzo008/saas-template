/**
 * Chart Configuration
 * Configuración organizada de todos los charts disponibles
 */

import { lazy } from "react";

// Lazy loading de todos los charts (usando named exports)
const ChartAreaDefault = lazy(() =>
  import("@/shared/components/charts/chart-area-default").then((module) => ({
    default: module.ChartAreaDefault,
  }))
);
const ChartAreaLinear = lazy(() =>
  import("@/shared/components/charts/chart-area-linear").then((module) => ({
    default: module.ChartAreaLinear,
  }))
);
const ChartAreaStep = lazy(() =>
  import("@/shared/components/charts/chart-area-step").then((module) => ({
    default: module.ChartAreaStep,
  }))
);
const ChartAreaLegend = lazy(() =>
  import("@/shared/components/charts/chart-area-legend").then((module) => ({
    default: module.ChartAreaLegend,
  }))
);
const ChartAreaStacked = lazy(() =>
  import("@/shared/components/charts/chart-area-stacked").then((module) => ({
    default: module.ChartAreaStacked,
  }))
);
const ChartAreaStackedExpand = lazy(() =>
  import("@/shared/components/charts/chart-area-stacked-expand").then(
    (module) => ({ default: module.ChartAreaStackedExpand })
  )
);
const ChartAreaIcons = lazy(() =>
  import("@/shared/components/charts/chart-area-icons").then((module) => ({
    default: module.ChartAreaIcons,
  }))
);
const ChartAreaGradient = lazy(() =>
  import("@/shared/components/charts/chart-area-gradient").then((module) => ({
    default: module.ChartAreaGradient,
  }))
);
const ChartAreaAxes = lazy(() =>
  import("@/shared/components/charts/chart-area-axes").then((module) => ({
    default: module.ChartAreaAxes,
  }))
);
const ChartAreaInteractive = lazy(() =>
  import("@/shared/components/charts/chart-area-interactive").then(
    (module) => ({ default: module.ChartAreaInteractive })
  )
);

const ChartBarDefault = lazy(() =>
  import("@/shared/components/charts/chart-bar-default").then((module) => ({
    default: module.ChartBarDefault,
  }))
);
const ChartBarHorizontal = lazy(() =>
  import("@/shared/components/charts/chart-bar-horizontal").then((module) => ({
    default: module.ChartBarHorizontal,
  }))
);
const ChartBarMultiple = lazy(() =>
  import("@/shared/components/charts/chart-bar-multiple").then((module) => ({
    default: module.ChartBarMultiple,
  }))
);
const ChartBarStacked = lazy(() =>
  import("@/shared/components/charts/chart-bar-stacked").then((module) => ({
    default: module.ChartBarStacked,
  }))
);
const ChartBarLabel = lazy(() =>
  import("@/shared/components/charts/chart-bar-label").then((module) => ({
    default: module.ChartBarLabel,
  }))
);
const ChartBarLabelCustom = lazy(() =>
  import("@/shared/components/charts/chart-bar-label-custom").then(
    (module) => ({ default: module.ChartBarLabelCustom })
  )
);
const ChartBarMixed = lazy(() =>
  import("@/shared/components/charts/chart-bar-mixed").then((module) => ({
    default: module.ChartBarMixed,
  }))
);
const ChartBarActive = lazy(() =>
  import("@/shared/components/charts/chart-bar-active").then((module) => ({
    default: module.ChartBarActive,
  }))
);
const ChartBarNegative = lazy(() =>
  import("@/shared/components/charts/chart-bar-negative").then((module) => ({
    default: module.ChartBarNegative,
  }))
);
const ChartBarInteractive = lazy(() =>
  import("@/shared/components/charts/chart-bar-interactive").then((module) => ({
    default: module.ChartBarInteractive,
  }))
);

const ChartLineDefault = lazy(() =>
  import("@/shared/components/charts/chart-line-default").then((module) => ({
    default: module.ChartLineDefault,
  }))
);
const ChartLineLinear = lazy(() =>
  import("@/shared/components/charts/chart-line-linear").then((module) => ({
    default: module.ChartLineLinear,
  }))
);
const ChartLineStep = lazy(() =>
  import("@/shared/components/charts/chart-line-step").then((module) => ({
    default: module.ChartLineStep,
  }))
);
const ChartLineMultiple = lazy(() =>
  import("@/shared/components/charts/chart-line-multiple").then((module) => ({
    default: module.ChartLineMultiple,
  }))
);
const ChartLineDots = lazy(() =>
  import("@/shared/components/charts/chart-line-dots").then((module) => ({
    default: module.ChartLineDots,
  }))
);
const ChartLineDotsCustom = lazy(() =>
  import("@/shared/components/charts/chart-line-dots-custom").then(
    (module) => ({ default: module.ChartLineDotsCustom })
  )
);
const ChartLineDotsColors = lazy(() =>
  import("@/shared/components/charts/chart-line-dots-colors").then(
    (module) => ({ default: module.ChartLineDotsColors })
  )
);
const ChartLineLabel = lazy(() =>
  import("@/shared/components/charts/chart-line-label").then((module) => ({
    default: module.ChartLineLabel,
  }))
);
const ChartLineLabelCustom = lazy(() =>
  import("@/shared/components/charts/chart-line-label-custom").then(
    (module) => ({ default: module.ChartLineLabelCustom })
  )
);
const ChartLineInteractive = lazy(() =>
  import("@/shared/components/charts/chart-line-interactive").then(
    (module) => ({ default: module.ChartLineInteractive })
  )
);

const ChartPieSimple = lazy(() =>
  import("@/shared/components/charts/chart-pie-simple").then((module) => ({
    default: module.ChartPieSimple,
  }))
);
// const ChartPieSeparatorNone = lazy(() =>
//   import("@/shared/components/charts/chart-pie-separator-none").then(
//     (module) => ({ default: module.ChartPieSeparatorNone })
//   )
// );
const ChartPieLabel = lazy(() =>
  import("@/shared/components/charts/chart-pie-label").then((module) => ({
    default: module.ChartPieLabel,
  }))
);
// const ChartPieLabelCustom = lazy(() =>
//   import("@/shared/components/charts/chart-pie-label-custom").then(
//     (module) => ({ default: module.ChartPieLabelCustom })
//   )
// );
// const ChartPieLabelList = lazy(() =>
//   import("@/shared/components/charts/chart-pie-label-list").then((module) => ({
//     default: module.ChartPieLabelList,
//   }))
// );
const ChartPieLegend = lazy(() =>
  import("@/shared/components/charts/chart-pie-legend").then((module) => ({
    default: module.ChartPieLegend,
  }))
);
const ChartPieDonut = lazy(() =>
  import("@/shared/components/charts/chart-pie-donut").then((module) => ({
    default: module.ChartPieDonut,
  }))
);
// const ChartPieDonutActive = lazy(() =>
//   import("@/shared/components/charts/chart-pie-donut-active").then(
//     (module) => ({ default: module.ChartPieDonutActive })
//   )
// );
const ChartPieDonutText = lazy(() =>
  import("@/shared/components/charts/chart-pie-donut-text").then((module) => ({
    default: module.ChartPieDonutText,
  }))
);
// const ChartPieStacked = lazy(() =>
//   import("@/shared/components/charts/chart-pie-stacked").then((module) => ({
//     default: module.ChartPieStacked,
//   }))
// );
const ChartPieInteractive = lazy(() =>
  import("@/shared/components/charts/chart-pie-interactive").then((module) => ({
    default: module.ChartPieInteractive,
  }))
);

const ChartRadarDefault = lazy(() =>
  import("@/shared/components/charts/chart-radar-default").then((module) => ({
    default: module.ChartRadarDefault,
  }))
);
// const ChartRadarDots = lazy(() =>
//   import("@/shared/components/charts/chart-radar-dots").then((module) => ({
//     default: module.ChartRadarDots,
//   }))
// );
// const ChartRadarLinesOnly = lazy(() =>
//   import("@/shared/components/charts/chart-radar-lines-only").then(
//     (module) => ({ default: module.ChartRadarLinesOnly })
//   )
// );
// const ChartRadarLabelCustom = lazy(() =>
//   import("@/shared/components/charts/chart-radar-label-custom").then(
//     (module) => ({ default: module.ChartRadarLabelCustom })
//   )
// );
// const ChartRadarGridCustom = lazy(() =>
//   import("@/shared/components/charts/chart-radar-grid-custom").then(
//     (module) => ({ default: module.ChartRadarGridCustom })
//   )
// );
// const ChartRadarGridNone = lazy(() =>
//   import("@/shared/components/charts/chart-radar-grid-none").then((module) => ({
//     default: module.ChartRadarGridNone,
//   }))
// );
// const ChartRadarGridCircle = lazy(() =>
//   import("@/shared/components/charts/chart-radar-grid-circle").then(
//     (module) => ({ default: module.ChartRadarGridCircle })
//   )
// );
// const ChartRadarGridCircleNoLines = lazy(() =>
//   import("@/shared/components/charts/chart-radar-grid-circle-no-lines").then(
//     (module) => ({ default: module.ChartRadarGridCircleNoLines })
//   )
// );
// const ChartRadarGridCircleFill = lazy(() =>
//   import("@/shared/components/charts/chart-radar-grid-circle-fill").then(
//     (module) => ({ default: module.ChartRadarGridCircleFill })
//   )
// );
// const ChartRadarGridFill = lazy(() =>
//   import("@/shared/components/charts/chart-radar-grid-fill").then((module) => ({
//     default: module.ChartRadarGridFill,
//   }))
// );
const ChartRadarMultiple = lazy(() =>
  import("@/shared/components/charts/chart-radar-multiple").then((module) => ({
    default: module.ChartRadarMultiple,
  }))
);
// const ChartRadarLegend = lazy(() =>
//   import("@/shared/components/charts/chart-radar-legend").then((module) => ({
//     default: module.ChartRadarLegend,
//   }))
// );
// const ChartRadarIcons = lazy(() =>
//   import("@/shared/components/charts/chart-radar-icons").then((module) => ({
//     default: module.ChartRadarIcons,
//   }))
// );
// const ChartRadarRadius = lazy(() =>
//   import("@/shared/components/charts/chart-radar-radius").then((module) => ({
//     default: module.ChartRadarRadius,
//   }))
// );

const ChartRadialSimple = lazy(() =>
  import("@/shared/components/charts/chart-radial-simple").then((module) => ({
    default: module.ChartRadialSimple,
  }))
);
// const ChartRadialLabel = lazy(() =>
//   import("@/shared/components/charts/chart-radial-label").then((module) => ({
//     default: module.ChartRadialLabel,
//   }))
// );
// const ChartRadialGrid = lazy(() =>
//   import("@/shared/components/charts/chart-radial-grid").then((module) => ({
//     default: module.ChartRadialGrid,
//   }))
// );
// const ChartRadialText = lazy(() =>
//   import("@/shared/components/charts/chart-radial-text").then((module) => ({
//     default: module.ChartRadialText,
//   }))
// );
// const ChartRadialShape = lazy(() =>
//   import("@/shared/components/charts/chart-radial-shape").then((module) => ({
//     default: module.ChartRadialShape,
//   }))
// );
const ChartRadialStacked = lazy(() =>
  import("@/shared/components/charts/chart-radial-stacked").then((module) => ({
    default: module.ChartRadialStacked,
  }))
);

// const ChartTooltipDefault = lazy(() =>
//   import("@/shared/components/charts/chart-tooltip-default").then((module) => ({
//     default: module.ChartTooltipDefault,
//   }))
// );
// const ChartTooltipIndicatorLine = lazy(() =>
//   import("@/shared/components/charts/chart-tooltip-indicator-line").then(
//     (module) => ({ default: module.ChartTooltipIndicatorLine })
//   )
// );
// const ChartTooltipIndicatorNone = lazy(() =>
//   import("@/shared/components/charts/chart-tooltip-indicator-none").then(
//     (module) => ({ default: module.ChartTooltipIndicatorNone })
//   )
// );
// const ChartTooltipLabelCustom = lazy(() =>
//   import("@/shared/components/charts/chart-tooltip-label-custom").then(
//     (module) => ({ default: module.ChartTooltipLabelCustom })
//   )
// );
// const ChartTooltipLabelFormatter = lazy(() =>
//   import("@/shared/components/charts/chart-tooltip-label-formatter").then(
//     (module) => ({ default: module.ChartTooltipLabelFormatter })
//   )
// );
// const ChartTooltipLabelNone = lazy(() =>
//   import("@/shared/components/charts/chart-tooltip-label-none").then(
//     (module) => ({ default: module.ChartTooltipLabelNone })
//   )
// );
// const ChartTooltipFormatter = lazy(() =>
//   import("@/shared/components/charts/chart-tooltip-formatter").then(
//     (module) => ({ default: module.ChartTooltipFormatter })
//   )
// );
// const ChartTooltipIcons = lazy(() =>
//   import("@/shared/components/charts/chart-tooltip-icons").then((module) => ({
//     default: module.ChartTooltipIcons,
//   }))
// );
// const ChartTooltipAdvanced = lazy(() =>
//   import("@/shared/components/charts/chart-tooltip-advanced").then(
//     (module) => ({ default: module.ChartTooltipAdvanced })
//   )
// );

// Interfaz para definir un chart
export interface ChartDefinition {
  id: string;
  name: string;
  description: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  category: "area" | "bar" | "line" | "pie" | "radar" | "radial" | "tooltip";
  tags: string[];
  difficulty: "basic" | "intermediate" | "advanced";
  featured?: boolean;
}

// Configuración completa de charts organizados por categoría
export const chartDefinitions: ChartDefinition[] = [
  // Area Charts
  {
    id: "area-default",
    name: "Area Chart - Default",
    description:
      "Gráfico de área básico para mostrar tendencias a lo largo del tiempo",
    component: ChartAreaDefault,
    category: "area",
    tags: ["básico", "tendencias", "tiempo"],
    difficulty: "basic",
    featured: true,
  },
  {
    id: "area-linear",
    name: "Area Chart - Linear",
    description: "Gráfico de área con interpolación lineal",
    component: ChartAreaLinear,
    category: "area",
    tags: ["lineal", "suave", "interpolación"],
    difficulty: "basic",
  },
  {
    id: "area-step",
    name: "Area Chart - Step",
    description: "Gráfico de área con pasos discretos",
    component: ChartAreaStep,
    category: "area",
    tags: ["pasos", "discreto", "escalones"],
    difficulty: "basic",
  },
  {
    id: "area-stacked",
    name: "Area Chart - Stacked",
    description: "Gráfico de área apilado para comparar múltiples series",
    component: ChartAreaStacked,
    category: "area",
    tags: ["apilado", "múltiple", "comparación"],
    difficulty: "intermediate",
  },
  {
    id: "area-stacked-expand",
    name: "Area Chart - Stacked Expand",
    description: "Gráfico de área apilado expandido al 100%",
    component: ChartAreaStackedExpand,
    category: "area",
    tags: ["apilado", "porcentaje", "100%"],
    difficulty: "intermediate",
  },
  {
    id: "area-gradient",
    name: "Area Chart - Gradient",
    description: "Gráfico de área con gradientes de color",
    component: ChartAreaGradient,
    category: "area",
    tags: ["gradiente", "color", "visual"],
    difficulty: "intermediate",
  },
  {
    id: "area-legend",
    name: "Area Chart - Legend",
    description: "Gráfico de área con leyenda personalizada",
    component: ChartAreaLegend,
    category: "area",
    tags: ["leyenda", "personalizado"],
    difficulty: "intermediate",
  },
  {
    id: "area-icons",
    name: "Area Chart - Icons",
    description: "Gráfico de área con iconos en los puntos de datos",
    component: ChartAreaIcons,
    category: "area",
    tags: ["iconos", "puntos", "visual"],
    difficulty: "advanced",
  },
  {
    id: "area-axes",
    name: "Area Chart - Custom Axes",
    description: "Gráfico de área con ejes personalizados",
    component: ChartAreaAxes,
    category: "area",
    tags: ["ejes", "personalizado", "formato"],
    difficulty: "advanced",
  },
  {
    id: "area-interactive",
    name: "Area Chart - Interactive",
    description: "Gráfico de área interactivo con zoom y pan",
    component: ChartAreaInteractive,
    category: "area",
    tags: ["interactivo", "zoom", "pan"],
    difficulty: "advanced",
  },

  // Bar Charts
  {
    id: "bar-default",
    name: "Bar Chart - Default",
    description: "Gráfico de barras básico para comparar categorías",
    component: ChartBarDefault,
    category: "bar",
    tags: ["básico", "comparación", "categorías"],
    difficulty: "basic",
    featured: true,
  },
  {
    id: "bar-horizontal",
    name: "Bar Chart - Horizontal",
    description: "Gráfico de barras horizontales",
    component: ChartBarHorizontal,
    category: "bar",
    tags: ["horizontal", "barras"],
    difficulty: "basic",
  },
  {
    id: "bar-multiple",
    name: "Bar Chart - Multiple",
    description: "Gráfico de barras múltiples agrupadas",
    component: ChartBarMultiple,
    category: "bar",
    tags: ["múltiple", "agrupado", "comparación"],
    difficulty: "intermediate",
  },
  {
    id: "bar-stacked",
    name: "Bar Chart - Stacked",
    description: "Gráfico de barras apiladas",
    component: ChartBarStacked,
    category: "bar",
    tags: ["apilado", "acumulativo"],
    difficulty: "intermediate",
  },
  {
    id: "bar-label",
    name: "Bar Chart - Labels",
    description: "Gráfico de barras con etiquetas de datos",
    component: ChartBarLabel,
    category: "bar",
    tags: ["etiquetas", "datos", "valores"],
    difficulty: "intermediate",
  },
  {
    id: "bar-label-custom",
    name: "Bar Chart - Custom Labels",
    description: "Gráfico de barras con etiquetas personalizadas",
    component: ChartBarLabelCustom,
    category: "bar",
    tags: ["etiquetas", "personalizado", "formato"],
    difficulty: "advanced",
  },
  {
    id: "bar-mixed",
    name: "Bar Chart - Mixed",
    description: "Gráfico mixto de barras y líneas",
    component: ChartBarMixed,
    category: "bar",
    tags: ["mixto", "líneas", "combinado"],
    difficulty: "advanced",
  },
  {
    id: "bar-active",
    name: "Bar Chart - Active",
    description: "Gráfico de barras con estado activo",
    component: ChartBarActive,
    category: "bar",
    tags: ["activo", "hover", "interactivo"],
    difficulty: "intermediate",
  },
  {
    id: "bar-negative",
    name: "Bar Chart - Negative",
    description: "Gráfico de barras con valores negativos",
    component: ChartBarNegative,
    category: "bar",
    tags: ["negativo", "positivo", "bidireccional"],
    difficulty: "intermediate",
  },
  {
    id: "bar-interactive",
    name: "Bar Chart - Interactive",
    description: "Gráfico de barras completamente interactivo",
    component: ChartBarInteractive,
    category: "bar",
    tags: ["interactivo", "click", "selección"],
    difficulty: "advanced",
  },

  // Line Charts
  {
    id: "line-default",
    name: "Line Chart - Default",
    description: "Gráfico de líneas básico para mostrar tendencias",
    component: ChartLineDefault,
    category: "line",
    tags: ["básico", "tendencias", "tiempo"],
    difficulty: "basic",
    featured: true,
  },
  {
    id: "line-linear",
    name: "Line Chart - Linear",
    description: "Gráfico de líneas con interpolación lineal",
    component: ChartLineLinear,
    category: "line",
    tags: ["lineal", "suave"],
    difficulty: "basic",
  },
  {
    id: "line-step",
    name: "Line Chart - Step",
    description: "Gráfico de líneas con pasos",
    component: ChartLineStep,
    category: "line",
    tags: ["pasos", "escalones"],
    difficulty: "basic",
  },
  {
    id: "line-multiple",
    name: "Line Chart - Multiple",
    description: "Gráfico de líneas múltiples",
    component: ChartLineMultiple,
    category: "line",
    tags: ["múltiple", "comparación"],
    difficulty: "intermediate",
  },
  {
    id: "line-dots",
    name: "Line Chart - Dots",
    description: "Gráfico de líneas con puntos marcados",
    component: ChartLineDots,
    category: "line",
    tags: ["puntos", "marcadores"],
    difficulty: "intermediate",
  },
  {
    id: "line-dots-custom",
    name: "Line Chart - Custom Dots",
    description: "Gráfico de líneas con puntos personalizados",
    component: ChartLineDotsCustom,
    category: "line",
    tags: ["puntos", "personalizado"],
    difficulty: "advanced",
  },
  {
    id: "line-dots-colors",
    name: "Line Chart - Colored Dots",
    description: "Gráfico de líneas con puntos de colores",
    component: ChartLineDotsColors,
    category: "line",
    tags: ["puntos", "colores"],
    difficulty: "intermediate",
  },
  {
    id: "line-label",
    name: "Line Chart - Labels",
    description: "Gráfico de líneas con etiquetas",
    component: ChartLineLabel,
    category: "line",
    tags: ["etiquetas", "valores"],
    difficulty: "intermediate",
  },
  {
    id: "line-label-custom",
    name: "Line Chart - Custom Labels",
    description: "Gráfico de líneas con etiquetas personalizadas",
    component: ChartLineLabelCustom,
    category: "line",
    tags: ["etiquetas", "personalizado"],
    difficulty: "advanced",
  },
  {
    id: "line-interactive",
    name: "Line Chart - Interactive",
    description: "Gráfico de líneas interactivo",
    component: ChartLineInteractive,
    category: "line",
    tags: ["interactivo", "zoom"],
    difficulty: "advanced",
  },

  // Pie Charts
  {
    id: "pie-simple",
    name: "Pie Chart - Simple",
    description: "Gráfico circular básico para mostrar proporciones",
    component: ChartPieSimple,
    category: "pie",
    tags: ["básico", "proporciones", "circular"],
    difficulty: "basic",
    featured: true,
  },
  {
    id: "pie-donut",
    name: "Pie Chart - Donut",
    description: "Gráfico de dona con centro vacío",
    component: ChartPieDonut,
    category: "pie",
    tags: ["dona", "centro", "vacío"],
    difficulty: "basic",
  },
  {
    id: "pie-donut-text",
    name: "Pie Chart - Donut with Text",
    description: "Gráfico de dona con texto en el centro",
    component: ChartPieDonutText,
    category: "pie",
    tags: ["dona", "texto", "centro"],
    difficulty: "intermediate",
  },
  {
    id: "pie-label",
    name: "Pie Chart - Labels",
    description: "Gráfico circular con etiquetas",
    component: ChartPieLabel,
    category: "pie",
    tags: ["etiquetas", "valores"],
    difficulty: "intermediate",
  },
  {
    id: "pie-legend",
    name: "Pie Chart - Legend",
    description: "Gráfico circular con leyenda",
    component: ChartPieLegend,
    category: "pie",
    tags: ["leyenda", "categorías"],
    difficulty: "intermediate",
  },
  {
    id: "pie-interactive",
    name: "Pie Chart - Interactive",
    description: "Gráfico circular interactivo",
    component: ChartPieInteractive,
    category: "pie",
    tags: ["interactivo", "hover"],
    difficulty: "advanced",
  },

  // Radar Charts
  {
    id: "radar-default",
    name: "Radar Chart - Default",
    description: "Gráfico radar básico para comparar múltiples métricas",
    component: ChartRadarDefault,
    category: "radar",
    tags: ["básico", "métricas", "comparación"],
    difficulty: "intermediate",
    featured: true,
  },
  {
    id: "radar-multiple",
    name: "Radar Chart - Multiple",
    description: "Gráfico radar con múltiples series",
    component: ChartRadarMultiple,
    category: "radar",
    tags: ["múltiple", "series", "comparación"],
    difficulty: "advanced",
  },

  // Radial Charts
  {
    id: "radial-simple",
    name: "Radial Chart - Simple",
    description: "Gráfico radial básico para mostrar progreso",
    component: ChartRadialSimple,
    category: "radial",
    tags: ["básico", "progreso", "circular"],
    difficulty: "basic",
    featured: true,
  },
  {
    id: "radial-stacked",
    name: "Radial Chart - Stacked",
    description: "Gráfico radial apilado",
    component: ChartRadialStacked,
    category: "radial",
    tags: ["apilado", "múltiple"],
    difficulty: "intermediate",
  },
];

// Función para obtener charts por categoría
export const getChartsByCategory = (category: ChartDefinition["category"]) => {
  return chartDefinitions.filter((chart) => chart.category === category);
};

// Función para obtener charts destacados
export const getFeaturedCharts = () => {
  return chartDefinitions.filter((chart) => chart.featured);
};

// Función para buscar charts
export const searchCharts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return chartDefinitions.filter(
    (chart) =>
      chart.name.toLowerCase().includes(lowercaseQuery) ||
      chart.description.toLowerCase().includes(lowercaseQuery) ||
      chart.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Función para obtener charts por dificultad
export const getChartsByDifficulty = (
  difficulty: ChartDefinition["difficulty"]
) => {
  return chartDefinitions.filter((chart) => chart.difficulty === difficulty);
};

// Categorías disponibles
export const chartCategories = [
  {
    id: "featured",
    name: "Destacados",
    icon: "⭐",
    description: "Los charts más populares y útiles",
  },
  {
    id: "area",
    name: "Área",
    icon: "📈",
    description: "Gráficos de área para mostrar tendencias",
  },
  {
    id: "bar",
    name: "Barras",
    icon: "📊",
    description: "Gráficos de barras para comparaciones",
  },
  {
    id: "line",
    name: "Líneas",
    icon: "📉",
    description: "Gráficos de líneas para tendencias temporales",
  },
  {
    id: "pie",
    name: "Circulares",
    icon: "🥧",
    description: "Gráficos circulares para proporciones",
  },
  {
    id: "radar",
    name: "Radar",
    icon: "🎯",
    description: "Gráficos radar para métricas múltiples",
  },
  {
    id: "radial",
    name: "Radiales",
    icon: "🔄",
    description: "Gráficos radiales para progreso",
  },
] as const;
