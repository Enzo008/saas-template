/**
 * AuthBypass.tsx
 * Componente que permite bypassear el sistema de autenticación
 * 
 * Cuando AUTH_ENABLED = false en app.config.ts:
 * - Proporciona un usuario mock
 * - Proporciona menús mock
 * - Permite acceso directo a la aplicación sin login
 */

import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AUTH_ENABLED, NO_AUTH_CONFIG, LOGIN_ROUTE } from '@/config/app.config';

interface AuthBypassProps {
  children: ReactNode;
}

/**
 * Componente que maneja el bypass de autenticación
 * Si AUTH_ENABLED = false, auto-autentica con datos mock
 */
export function AuthBypass({ children }: AuthBypassProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    // Si la autenticación está deshabilitada
    if (!AUTH_ENABLED) {
      console.log('🔓 AUTH BYPASS: Autenticación deshabilitada - usando datos mock');
      
      // Establecer usuario y autenticación mock
      setAuth({
        user: NO_AUTH_CONFIG.mockUser,
        isAuthenticated: true
      });
      
      // Si estamos en la ruta de login, redirigir al dashboard
      if (location.pathname === LOGIN_ROUTE || location.pathname === '/forgot-password') {
        console.log('🔓 AUTH BYPASS: Redirigiendo desde login a dashboard');
        navigate('/', { replace: true });
      }
    }
  }, [setAuth, navigate, location.pathname]);

  return <>{children}</>;
}
