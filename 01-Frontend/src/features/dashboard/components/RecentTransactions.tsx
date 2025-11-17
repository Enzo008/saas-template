/**
 * Recent Transactions - Lista de transacciones recientes
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RecentTransaction } from '../types/dashboard.types';

interface RecentTransactionsProps {
  data: RecentTransaction[];
}

const statusConfig = {
  completed: { label: 'Completado', variant: 'default' as const, className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20' },
  pending: { label: 'Pendiente', variant: 'secondary' as const, className: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' },
  failed: { label: 'Fallido', variant: 'destructive' as const, className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20' }
};

export const RecentTransactions = ({ data }: RecentTransactionsProps) => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
        <CardDescription>
          Últimas transacciones realizadas en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((transaction) => {
            const config = statusConfig[transaction.status];
            return (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {transaction.customer}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.date}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    ${transaction.amount.toLocaleString()}
                  </span>
                  <Badge 
                    variant={config.variant}
                    className={cn("min-w-[90px] justify-center", config.className)}
                  >
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
