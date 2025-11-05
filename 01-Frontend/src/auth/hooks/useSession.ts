/**
 * useSession - Hook optimizado para manejo completo de sesión
 * Integra autenticación, renovación automática y monitoreo de actividad
 */

import { useEffect, useCallback, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authController } from '../controllers/authController';
import { SESSION_TIMES } from '../utils/constants';
import { storage } from '../utils/storage.utils';
import { ErrorType, useErrorManager } from '@/shared/managers/ErrorManager';

interface UseSessionReturn {
  // Estado
  isAuthenticated: boolean;
  user: any;
  isSessionExpiring: boolean;
  timeUntilExpiry: number;
  sessionType: 'normal' | 'extended' | null;
  
  // Acciones
  renewSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateActivity: () => void;
  
  // Utilidades
  getSessionInfo: () => {
    lastActivity: number;
    timeElapsed: number;
    timeRemaining: number;
    expiryTime: number;
  };
}

export const useSession = (): UseSessionReturn => {
  const { isAuthenticated, user, lastActivity } = useAuthStore();
  const errorManager = useErrorManager();
  const [isSessionExpiring, setIsSessionExpiring] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);

  /**
   * Obtiene información completa de la sesión
   */
  const getSessionInfo = useCallback(() => {
    const sessionType = storage.getSessionType();
    const expiryTime = sessionType === 'extended' 
      ? SESSION_TIMES.EXTENDED_SESSION 
      : SESSION_TIMES.NORMAL_SESSION;
    
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastActivity;
    const timeRemaining = Math.max(expiryTime - timeElapsed, 0);
    
    return {
      lastActivity,
      timeElapsed,
      timeRemaining,
      expiryTime
    };
  }, [lastActivity]);

  /**
   * Renueva la sesión
   */
  const renewSession = useCallback(async (): Promise<boolean> => {
    try {
      const renewed = await authController.renewToken();
      
      if (renewed) {
        setIsSessionExpiring(false);
        return true;
      }
      
      return false;
    } catch (error) {
      errorManager.handleError(error, ErrorType.AUTHENTICATION, { 
        action: 'session_renewal',
        silent: true 
      });
      return false;
    }
  }, [errorManager]);

  /**
   * Cierra la sesión
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authController.logout();
    } catch (error) {
      errorManager.handleError(error, ErrorType.AUTHENTICATION, { action: 'logout' });
    }
  }, [errorManager]);

  /**
   * Actualiza la actividad del usuario
   */
  const updateActivity = useCallback(() => {
    authController.updateActivity();
  }, []);

  // Monitoreo continuo de la sesión
  useEffect(() => {
    if (!isAuthenticated) {
      setIsSessionExpiring(false);
      setTimeUntilExpiry(0);
      return;
    }

    const checkSessionStatus = () => {
      const sessionInfo = getSessionInfo();
      const { timeRemaining } = sessionInfo;
      
      setTimeUntilExpiry(Math.floor(timeRemaining / 1000));
      
      // Marcar como próxima a expirar si quedan menos de 5 minutos
      const isExpiring = timeRemaining <= SESSION_TIMES.WARNING_TIME;
      setIsSessionExpiring(isExpiring);
      
      // Si la sesión ya expiró, cerrar automáticamente
      if (timeRemaining <= 0) {
        logout();
      }
    };

    // Verificar inmediatamente
    checkSessionStatus();
    
    // Verificar cada minuto
    const interval = setInterval(checkSessionStatus, SESSION_TIMES.CHECK_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, getSessionInfo, logout]);

  // Renovación automática cuando está próxima a expirar
  useEffect(() => {
    if (!isAuthenticated || !isSessionExpiring) return;

    const autoRenewal = async () => {
      const sessionInfo = getSessionInfo();
      
      // Solo renovar automáticamente si quedan entre 2-5 minutos
      if (sessionInfo.timeRemaining <= SESSION_TIMES.WARNING_TIME && 
          sessionInfo.timeRemaining > 2 * 60 * 1000) {
        
        const renewed = await renewSession();
        
        if (!renewed) {
          console.warn('Renovación automática falló, el usuario deberá renovar manualmente');
        }
      }
    };

    // Intentar renovación automática cada 30 segundos cuando está próxima a expirar
    const renewalInterval = setInterval(autoRenewal, 30 * 1000);
    
    return () => clearInterval(renewalInterval);
  }, [isAuthenticated, isSessionExpiring, getSessionInfo, renewSession]);

  return {
    // Estado
    isAuthenticated,
    user,
    isSessionExpiring,
    timeUntilExpiry,
    sessionType: storage.getSessionType() as 'normal' | 'extended' | null,
    
    // Acciones
    renewSession,
    logout,
    updateActivity,
    
    // Utilidades
    getSessionInfo
  };
};