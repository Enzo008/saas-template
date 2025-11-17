/**
 * Dashboard - Panel principal con KPIs y gráficos interactivos
 */

import { KPICard } from '../components/KPICard';
import { SalesChart } from '../components/SalesChart';
import { CategoryChart } from '../components/CategoryChart';
import { ActivityChart } from '../components/ActivityChart';
import { TopProductsTable } from '../components/TopProductsTable';
import { RecentTransactions } from '../components/RecentTransactions';
import { 
  generateKPIs, 
  generateSalesData, 
  generateCategoryData, 
  generateUserActivity,
  generateTopProducts,
  generateRecentTransactions
} from '../utils/mockData';

const Dashboard = () => {
  const kpis = generateKPIs();
  const salesData = generateSalesData();
  const categoryData = generateCategoryData();
  const activityData = generateUserActivity();
  const topProducts = generateTopProducts();
  const recentTransactions = generateRecentTransactions();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Última actualización: {new Date().toLocaleString('es-ES', { 
              day: '2-digit', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SalesChart data={salesData} />
        <CategoryChart data={categoryData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ActivityChart data={activityData} />
        <TopProductsTable data={topProducts} />
      </div>

      <div className="grid gap-4">
        <RecentTransactions data={recentTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;
