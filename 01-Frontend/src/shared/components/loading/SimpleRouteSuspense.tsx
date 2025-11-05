/**
 * SimpleRouteSuspense - Sistema simplificado de Suspense para rutas
 * Solo 2 tipos de loaders: aplicación general y rutas
 */

import { Suspense } from 'react';
import { RouteLoader } from './RouteLoader';

interface SimpleRouteSuspenseProps {
  children: React.ReactNode;
}

export const SimpleRouteSuspense = ({ children }: SimpleRouteSuspenseProps) => {
  return (
    <Suspense fallback={<RouteLoader variant="skeleton" message="Cargando página..." />}>
      {children}
    </Suspense>
  );
};

export default SimpleRouteSuspense;