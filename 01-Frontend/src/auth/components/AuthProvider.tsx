/**
 * AuthProvider - Proveedor optimizado de autenticación
 * Maneja inicialización, renovación automática y limpieza de sesión
 */

import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authController } from '../controllers/authController';
import SessionManager from '../components/SessionManager';
import { ErrorType, useErrorManager } from '@/shared/managers/ErrorManager';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated } = useAuthStore();
  const errorManager = useErrorManager();
  const [isInitializing, setIsInitializing] = useState(true);

  // Inicialización de autenticación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!isAuthenticated) {
          const initialized = await authController.initializeAuth();
          
          if (!initialized) {
            console.info('No hay sesión válida almacenada');
          }
        }
      } catch (error) {
        console.warn('Error al inicializar autenticación:', error);
        // No mostrar error al usuario en la inicialización
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [isAuthenticated]);

  // Renovación automática de token
  useEffect(() => {
    if (!isAuthenticated) return;

    const renewalInterval = setInterval(async () => {
      try {
        if (authController.shouldRenewToken()) {
          const renewed = await authController.renewToken();
          
          if (!renewed) {
            console.warn('No se pudo renovar el token, cerrando sesión');
            await authController.logout();
          }
        }
      } catch (error) {
        console.error('Error en renovación automática:', error);
        errorManager.handleError(error, ErrorType.AUTHENTICATION, { 
          action: 'auto_token_renewal',
          silent: true // No mostrar toast para renovaciones automáticas
        });
      }
    }, 10 * 60 * 1000); // Verificar cada 10 minutos

    return () => clearInterval(renewalInterval);
  }, [isAuthenticated, errorManager]);

  // Actualizar actividad en interacciones del usuario
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      authController.updateActivity();
    };

    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [isAuthenticated]);

  // Mostrar loading durante inicialización
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SessionManager />
      {children}
    </>
  );
}
