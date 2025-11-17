/**
 * Dashboard types - Tipos para el dashboard empresarial
 */

export interface KPICard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  description: string;
}

export interface SalesData {
  month: string;
  sales: number;
  revenue: number;
  profit: number;
}

export interface CategoryData {
  name: string;
  value: number;
  fill: string;
}

export interface UserActivity {
  hour: string;
  users: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  trend: 'up' | 'down';
}

export interface RecentTransaction {
  id: string;
  customer: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}
