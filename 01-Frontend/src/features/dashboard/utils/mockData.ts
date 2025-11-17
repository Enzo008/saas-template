/**
 * Mock data generator - Genera datos aleatorios realistas para el dashboard
 */

import type { KPICard, SalesData, CategoryData, UserActivity, TopProduct, RecentTransaction } from '../types/dashboard.types';

export const generateKPIs = (): KPICard[] => [
  {
    id: 'revenue',
    title: 'Ingresos Totales',
    value: '$124,563',
    change: 12.5,
    trend: 'up',
    icon: 'DollarSign',
    description: 'vs mes anterior'
  },
  {
    id: 'users',
    title: 'Usuarios Activos',
    value: '8,549',
    change: 8.2,
    trend: 'up',
    icon: 'Users',
    description: 'vs mes anterior'
  },
  {
    id: 'orders',
    title: 'Pedidos',
    value: '1,234',
    change: -3.1,
    trend: 'down',
    icon: 'ShoppingCart',
    description: 'vs mes anterior'
  },
  {
    id: 'conversion',
    title: 'Tasa de Conversión',
    value: '3.24%',
    change: 0.8,
    trend: 'up',
    icon: 'TrendingUp',
    description: 'vs mes anterior'
  }
];

export const generateSalesData = (): SalesData[] => [
  { month: 'Ene', sales: 4200, revenue: 84000, profit: 25200 },
  { month: 'Feb', sales: 3800, revenue: 76000, profit: 22800 },
  { month: 'Mar', sales: 5100, revenue: 102000, profit: 30600 },
  { month: 'Abr', sales: 4600, revenue: 92000, profit: 27600 },
  { month: 'May', sales: 5400, revenue: 108000, profit: 32400 },
  { month: 'Jun', sales: 6200, revenue: 124000, profit: 37200 },
  { month: 'Jul', sales: 5800, revenue: 116000, profit: 34800 },
  { month: 'Ago', sales: 6500, revenue: 130000, profit: 39000 },
  { month: 'Sep', sales: 6100, revenue: 122000, profit: 36600 },
  { month: 'Oct', sales: 7200, revenue: 144000, profit: 43200 },
  { month: 'Nov', sales: 6800, revenue: 136000, profit: 40800 },
  { month: 'Dic', sales: 7500, revenue: 150000, profit: 45000 }
];

export const generateCategoryData = (): CategoryData[] => [
  { name: 'Electrónica', value: 35, fill: '' },
  { name: 'Ropa', value: 25, fill: '' },
  { name: 'Hogar', value: 20, fill: '' },
  { name: 'Deportes', value: 12, fill: '' },
  { name: 'Otros', value: 8, fill: '' }
];

export const generateUserActivity = (): UserActivity[] => [
  { hour: '00:00', users: 120 },
  { hour: '03:00', users: 80 },
  { hour: '06:00', users: 150 },
  { hour: '09:00', users: 450 },
  { hour: '12:00', users: 680 },
  { hour: '15:00', users: 520 },
  { hour: '18:00', users: 720 },
  { hour: '21:00', users: 380 }
];

export const generateTopProducts = (): TopProduct[] => [
  { id: '1', name: 'Laptop Pro 15"', sales: 234, revenue: 234000, trend: 'up' },
  { id: '2', name: 'Smartphone X', sales: 456, revenue: 182400, trend: 'up' },
  { id: '3', name: 'Auriculares Wireless', sales: 789, revenue: 78900, trend: 'down' },
  { id: '4', name: 'Tablet Air', sales: 123, revenue: 61500, trend: 'up' },
  { id: '5', name: 'Smartwatch Pro', sales: 345, revenue: 103500, trend: 'up' }
];

export const generateRecentTransactions = (): RecentTransaction[] => [
  { id: '1', customer: 'Juan Pérez', amount: 1250, status: 'completed', date: '2024-11-16 10:30' },
  { id: '2', customer: 'María García', amount: 890, status: 'completed', date: '2024-11-16 09:15' },
  { id: '3', customer: 'Carlos López', amount: 2100, status: 'pending', date: '2024-11-16 08:45' },
  { id: '4', customer: 'Ana Martínez', amount: 450, status: 'completed', date: '2024-11-15 16:20' },
  { id: '5', customer: 'Pedro Sánchez', amount: 780, status: 'failed', date: '2024-11-15 14:10' }
];
