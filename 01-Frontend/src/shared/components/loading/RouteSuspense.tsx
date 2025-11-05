/**
 * RouteSuspense - Solución específica para el problema de Suspense + React Router
 * Garantiza que Suspense se active correctamente durante navegación entre rutas lazy
 */

import { Suspense, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { RouteLoader, FormRouteLoader, TableRouteLoader, DashboardRouteLoader } from './RouteLoader';

interface RouteSuspenseProps {
  children: React.ReactNode;
  loaderType?: 'default' | 'form' | 'table' | 'dashboard';
}

export const RouteSuspense = ({
  children,
  loaderType = 'default'
}: RouteSuspenseProps) => {
  const location = useLocation();
  const [suspenseKey, setSuspenseKey] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const previousPathname = useRef(location.pathname);
  const navigationTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Solo actuar si realmente cambió la ruta
    if (previousPathname.current !== location.pathname) {
      // Limpiar timer anterior si existe
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }

      // Marcar que estamos navegando
      setIsNavigating(true);
      
      // Incrementar la key para forzar re-mount del Suspense
      setSuspenseKey(prev => prev + 1);
      
      // Actualizar la referencia de la ruta anterior
      previousPathname.current = location.pathname;

      // Después de un breve momento, permitir que Suspense tome control
      navigationTimer.current = setTimeout(() => {
        setIsNavigating(false);
      }, 50); // Muy breve, solo para "despertar" Suspense
    }

    return () => {
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }
    };
  }, [location.pathname]);

  const getLoader = () => {
    switch (loaderType) {
      case 'form':
        return <FormRouteLoader />;
      case 'table':
        return <TableRouteLoader />;
      case 'dashboard':
        return <DashboardRouteLoader />;
      default:
        return <RouteLoader variant="skeleton" message="Cargando página..." />;
    }
  };

  const loader = getLoader();

  // Solo mostrar nuestro loader durante el breve momento de navegación
  // Después, Suspense toma control
  if (isNavigating) {
    return loader;
  }

  return (
    <Suspense key={suspenseKey} fallback={loader}>
      {children}
    </Suspense>
  );
};

export default RouteSuspense;