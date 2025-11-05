/**
 * ProtectedRoute - Componente unificado para rutas protegidas y públicas
 * Reemplaza PrivateRoute y PublicRoute con mejor arquitectura
 * Soporta bypass de autenticación cuando AUTH_ENABLED = false
 */

import { ReactNode, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authController } from '../controllers/authController';
import { Loader2 } from 'lucide-react';
import { AUTH_ENABLED } from '@/config/app.config';

interface ProtectedRouteProps {
  children?: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  useOutlet?: boolean; // Para compatibilidad con router existente
}

export function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = '/login',
  requireAuth = true,
  useOutlet = false
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, loading, user } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 🔓 BYPASS: Si AUTH_ENABLED = false, permitir acceso directo
  if (!AUTH_ENABLED) {
    // Permitir acceso a todas las rutas sin validación
    return useOutlet ? <Outlet /> : <>{children}</>;
  }

  // Validación inicial del token (solo si AUTH_ENABLED = true)
  useEffect(() => {
    const validate = async () => {
      try {
        if (requireAuth && AUTH_ENABLED) {
          await authController.validateToken();
        }
      } catch (error) {
        console.error('Error validating token:', error);
      } finally {
        setIsValidating(false);
        setIsInitialLoad(false);
      }
    };

    if (isInitialLoad) {
      validate();
    }
  }, [isInitialLoad, requireAuth]);

  // Loading state - solo mostrar en carga inicial o si no está autenticado
  if ((loading || isValidating) && (!isAuthenticated || isInitialLoad)) {
    const loadingComponent = fallback || (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {requireAuth ? 'Verificando autenticación...' : 'Cargando...'}
          </p>
        </div>
      </div>
    );
    
    return <>{loadingComponent}</>;
  }

  // Lógica para rutas que REQUIEREN autenticación
  if (requireAuth) {
    // Si no está autenticado después de la validación, redirigir al login
    if (!isAuthenticated && !isValidating) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Si está autenticado pero necesita cambiar contraseña
    if (user?.useSes === 'S' && location.pathname !== '/change-password') {
      return <Navigate to="/change-password" replace />;
    }

    // Si todo está bien, mostrar el contenido
    return useOutlet ? <Outlet /> : <>{children}</>;
  }

  // Lógica para rutas que NO requieren autenticación (públicas)
  if (!requireAuth) {
    // Si está autenticado, redirigir a donde venía o al dashboard
    if (isAuthenticated && !isValidating) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      return <Navigate to={from} replace />;
    }

    // Si no está autenticado, mostrar el contenido público
    return useOutlet ? <Outlet /> : <>{children}</>;
  }

  return useOutlet ? <Outlet /> : <>{children}</>;
}

/**
 * Componente específico para rutas privadas (reemplaza PrivateRoute)
 */
export function PrivateRoute() {
  return <ProtectedRoute requireAuth={true} useOutlet={true} />;
}

/**
 * Componente específico para rutas públicas (reemplaza PublicRoute)
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false} useOutlet={false}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Hook para verificar autenticación en componentes
 */
export function useAuthGuard() {
  const { isAuthenticated, user } = useAuthStore();
  
  return {
    isAuthenticated: authController.isAuthenticated(),
    user,
    needsPasswordChange: user?.useSes === 'S',
    canAccess: (requiredAuth: boolean = true) => {
      if (requiredAuth) {
        return isAuthenticated && user?.useSes !== 'S';
      }
      return !isAuthenticated;
    }
  };
}