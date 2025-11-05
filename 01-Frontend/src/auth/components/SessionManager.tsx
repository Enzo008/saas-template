/**
 * SessionManager - Gestor optimizado de sesión
 * Maneja advertencias de expiración y renovación automática
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authController } from '../controllers/authController';
import { SESSION_TIMES } from '../utils/constants';
import { storage } from '../utils/storage.utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

const SessionManager = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  
  // Referencias para los intervalos
  const checkIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  /**
   * Obtiene el tiempo de expiración según el tipo de sesión
   */
  const getSessionExpiryTime = (): number => {
    const sessionType = storage.getSessionType();
    return sessionType === 'extended' 
      ? SESSION_TIMES.EXTENDED_SESSION 
      : SESSION_TIMES.NORMAL_SESSION;
  };

  /**
   * Obtiene el tiempo para mostrar advertencia
   */
  const getWarningTime = (): number => {
    const expiryTime = getSessionExpiryTime();
    return expiryTime - SESSION_TIMES.WARNING_TIME;
  };

  /**
   * Limpia intervalos
   */
  const clearIntervals = () => {
    if (checkIntervalRef.current) {
      window.clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  /**
   * Inicia la cuenta regresiva
   */
  const startCountdown = () => {
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
    }
    
    const lastActivity = useAuthStore.getState().lastActivity;
    const timeElapsed = Date.now() - lastActivity;
    const expiryTime = getSessionExpiryTime();
    const remainingTime = expiryTime - timeElapsed;
    const initialSeconds = Math.max(Math.floor(remainingTime / 1000), 0);
    
    setRemainingSeconds(initialSeconds);

    countdownIntervalRef.current = window.setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 0) {
          handleExpiredSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Verifica el estado de la sesión
   */
  const checkSession = async () => {
    if (!isAuthenticated) {
      clearIntervals();
      return;
    }

    const lastActivity = useAuthStore.getState().lastActivity;
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastActivity;
    const expiryTime = getSessionExpiryTime();
    const warningTime = getWarningTime();

    // Sesión expirada
    if (timeElapsed >= expiryTime) {
      await handleExpiredSession();
      return;
    }

    // Mostrar advertencia
    if (timeElapsed >= warningTime && !showWarning) {
      setShowWarning(true);
      startCountdown();
    }
  };

  /**
   * Maneja sesión expirada
   */
  const handleExpiredSession = async () => {
    setIsLoading(true);
    clearIntervals();
    
    try {
      await authController.logout();
      setShowWarning(false);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Continúa la sesión renovando el token
   */
  const handleContinue = async () => {
    setIsLoading(true);
    
    try {
      const renewed = await authController.renewToken();
      
      if (renewed) {
        setShowWarning(false);
        if (countdownIntervalRef.current) {
          window.clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setRemainingSeconds(0);
      } else {
        await handleExpiredSession();
      }
    } catch (error) {
      console.error('Error al renovar la sesión:', error);
      await handleExpiredSession();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cierra la sesión manualmente
   */
  const handleLogout = async () => {
    await handleExpiredSession();
  };

  // Efecto principal para monitoreo de sesión
  useEffect(() => {
    if (isAuthenticated && !checkIntervalRef.current) {
      checkSession();
      checkIntervalRef.current = window.setInterval(
        checkSession, 
        SESSION_TIMES.CHECK_INTERVAL
      );
    } else if (!isAuthenticated) {
      clearIntervals();
      setShowWarning(false);
    }

    return clearIntervals;
  }, [isAuthenticated]);

  /**
   * Formatea el tiempo restante
   */
  const formatRemainingTime = (): string => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Obtiene el tipo de sesión para mostrar en la UI
   */
  const getSessionTypeLabel = (): string => {
    const sessionType = storage.getSessionType();
    return sessionType === 'extended' ? 'extendida (30 días)' : 'normal (8 horas)';
  };

  if (!isAuthenticated) return null;

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent className="max-w-[420px]">
        <AlertDialogHeader className="space-y-3 text-center">
          <AlertDialogTitle className="text-lg">
            {isLoading ? 'Procesando...' : 'Advertencia de Sesión'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="size-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground">
                  Procesando solicitud...
                </p>
              </div>
            ) : (
              <>
                <div className="text-4xl">⏰</div>
                <div className="space-y-3">
                  <p className="text-base">
                    Tu sesión {getSessionTypeLabel()} expirará en{' '}
                    <span className="text-destructive font-semibold text-lg">
                      {formatRemainingTime()}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ¿Deseas continuar con tu sesión activa?
                  </p>
                </div>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {!isLoading && (
          <AlertDialogFooter className="sm:space-x-2">
            <AlertDialogCancel
              onClick={handleLogout}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0"
            >
              Cerrar Sesión
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleContinue}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continuar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionManager;
