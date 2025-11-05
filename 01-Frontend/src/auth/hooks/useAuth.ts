/**
 * useAuth - Hook optimizado para manejo de autenticación
 * Integra con ErrorManager y proporciona mejor UX
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authController } from '../controllers/authController';
import { LoginRequest } from '@/auth/types';
import { ErrorType, useErrorManager } from '@/shared/managers/ErrorManager';
import { useNotifications } from '@/shared/hooks/ui/useNotifications';

interface UseAuthReturn {
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  handleLogin: (email: string, password: string, keepSession?: boolean) => Promise<void>;
  handleLogout: () => Promise<void>;
  clearError: () => void;
  
  // Utilidades
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const errorManager = useErrorManager();
  const toast = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async (email: string, password: string, keepSession?: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const credentials: LoginRequest = {
        useEma: email,
        usePas: password,
        keepSession: keepSession || false
      };
      
      await authController.login(credentials);
      
      navigate('/');
    } catch (err: any) {
      // Usar ErrorManager para manejo consistente
      const structuredError = errorManager.handleError(err, ErrorType.AUTHENTICATION, {
        action: 'login',
        email: email // No incluir password por seguridad
      });
      // Establecer error local para mostrar en el formulario
      setError(structuredError.userMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, errorManager]);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await authController.logout();
      
      // Mostrar mensaje usando el sistema centralizado
      toast.info('auth.logout.success');
      
      navigate('/login');
    } catch (err: any) {
      errorManager.handleError(err, ErrorType.AUTHENTICATION, { action: 'logout' });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, errorManager]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    handleLogin,
    handleLogout,
    clearError,
    isAuthenticated: authController.isAuthenticated()
  };
};
