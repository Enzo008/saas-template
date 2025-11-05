/**
 * App.tsx
 * Componente principal de la aplicación que maneja el enrutamiento y la estructura base.
 * 
 * Este componente implementa:
 * - Lazy loading de componentes para mejor performance
 * - Manejo de rutas públicas y privadas
 * - Sistema de navegación dinámico basado en menús disponibles
 * - Suspense optimizado para loading states sin duplicaciones
 * - Error boundaries específicos por página (sin duplicar manejo global)
 * - Optimizaciones de rendimiento con React.memo y lazy loading
 */

// React y React Router
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sistema centralizado de rutas
import { useNavigation } from '@/shared/hooks';

// Componentes de UI  
import { withPageErrorBoundary, LoadingScreen, SimpleRouteSuspense } from '@/shared/components';
import { PrivateRoute, PublicRoute } from '@/auth/components/ProtectedRoute';

// Providers y contextos
import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import { LanguageProvider } from '@/shared/providers/LanguageProvider';
import { AppConfigProvider } from '@/shared/providers/AppConfigProvider';
import { AuthProvider } from '@/auth/components/AuthProvider';
import { AuthBypass } from '@/auth/components/AuthBypass';
import { NotificationProvider, ErrorManagerProvider } from '@/shared/providers';

// Componentes de configuración
import { SettingsModal } from '@/shared/components/utilities/settings';
import { PaletteApplier } from '@/shared/components/utilities/settings/PaletteApplier';

// Lazy loading de componentes de autenticación
const Login = lazy(() => import('@/auth/pages/Login'));
const ForgotPassword = lazy(() => import('@/auth/pages/ForgotPassword'));

// Lazy loading de componentes principales
const MainLayout = lazy(() => import('@/layout/index'));
const Index = lazy(() => import('@/features/index/pages/Index'));

/**
 * HOC que envuelve componentes de autenticación con Suspense únicamente
 * @param Component - Componente React a envolver
 */
const withAuthSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

/**
 * HOC que envuelve páginas con SimpleRouteSuspense y PageErrorBoundary
 * Combina error boundary específico de página con loading state optimizado
 * @param Component - Componente React a envolver
 */
const withPageSuspense = (Component: React.ComponentType) => {
  const WrappedWithErrorBoundary = withPageErrorBoundary(Component);
  return (
    <SimpleRouteSuspense>
      <WrappedWithErrorBoundary />
    </SimpleRouteSuspense>
  );
};

/**
 * Componente interno que maneja las rutas dentro del contexto del BrowserRouter
 */
function AppRoutes() {
  // Hook del sistema unificado de navegación (ahora dentro del contexto del Router)
  const { routes } = useNavigation();

  /**
   * Genera todas las rutas de forma unificada
   */
  const renderRoutes = () =>
    routes.map(route => (
      <Route
        key={route.path}
        path={route.path}
        element={withPageSuspense(route.component)}
      />
    ));

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route 
        path="/login"
        element={
          <PublicRoute>
            {withAuthSuspense(Login)}
          </PublicRoute>
        }
      />
      <Route 
        path="/forgot-password"
        element={
          <PublicRoute>
            {withAuthSuspense(ForgotPassword)}
          </PublicRoute>
        }
      />

      {/* Rutas protegidas */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={withAuthSuspense(MainLayout)}>
          {/* Dashboard - Página principal */}
          <Route
            index
            element={withPageSuspense(Index)}
          />

          {/* Todas las rutas unificadas */}
          {renderRoutes()}

          {/* Ruta por defecto - Redirecciona a Dashboard */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

// Componente principal de la aplicación
function App() {

  return (
    <LanguageProvider defaultLanguage="es" storageKey="language">
      <AppConfigProvider>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <PaletteApplier />
          <NotificationProvider position="top-right" autoClose={5000}>
            <ErrorManagerProvider>
              <BrowserRouter>
                <AuthProvider>
                  <AuthBypass>
                    {/* Componente que maneja las rutas dentro del contexto del Router */}
                    <AppRoutes />

                    {/* Modal de configuración global */}
                    <SettingsModal />
                  </AuthBypass>
                </AuthProvider>
              </BrowserRouter>
            </ErrorManagerProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AppConfigProvider>
    </LanguageProvider>
  );
}

export default App;
