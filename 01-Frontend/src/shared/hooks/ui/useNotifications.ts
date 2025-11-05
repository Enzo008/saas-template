import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastOptions, toast } from 'react-toastify';

/**
 * Hook unificado para notificaciones usando react-toastify
 * Detecta automáticamente si es una clave de traducción o mensaje directo
 * 
 * @returns Métodos para mostrar diferentes tipos de notificaciones
 */
export const useNotifications = () => {
  const { t } = useTranslation();

  const success = useCallback((
    message?: string, 
    options?: ToastOptions
  ) => {
    // Si el título tiene espacios, es un mensaje directo
    return toast.success(message, {
      ...options,
      containerId: 'toast-container'
    });
  }, [t]);

  const error = useCallback((
    message?: string, 
    options?: ToastOptions
  ) => {
    return toast.error(message, { 
      ...options, 
      containerId: 'toast-container' 
    });
  }, []);

  const warning = useCallback((
    message?: string, 
    options?: ToastOptions
  ) => {
    return toast.warning(message, { 
      ...options, 
      containerId: 'toast-container' 
    });
  }, []);

  const info = useCallback((
    message?: string, 
    options?: ToastOptions
  ) => {
    return toast.info(message, { 
      ...options, 
      containerId: 'toast-container' 
    });
  }, []);

  const clearAll = useCallback(() => {
    toast.dismiss();
  }, []);

  return {
    success,
    error,
    warning,
    info,
    clearAll,
  };
};

/**
 * Hook legacy para compatibilidad hacia atrás
 * @deprecated Usar useNotifications en su lugar
 */
export const useToast = useNotifications;