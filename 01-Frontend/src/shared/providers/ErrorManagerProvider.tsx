import { useEffect } from 'react';
import { useNotifications } from '../hooks/ui/useNotifications';
import errorManager, { NotificationService } from '../managers/ErrorManager';

interface ErrorManagerProviderProps {
  children: React.ReactNode;
}

/**
 * Proveedor que configura el ErrorManager para usar el sistema centralizado de notificaciones
 * Este componente debe ser colocado dentro del NotificationProvider en el árbol de componentes
 */
export const ErrorManagerProvider = ({ children }: ErrorManagerProviderProps) => {
  const toast = useNotifications();
  
  useEffect(() => {
    // Crear un servicio de notificaciones para el ErrorManager usando useToast
    const notificationService: NotificationService = {
      success: (message: string, options?: any) => {
        return toast.success(message, options);
      },
      error: (message: string, options?: any) => {
        const toastId = toast.error(message, options);
        return toastId;
      },
      info: (message: string, options?: any) => {
        return toast.info(message, options);
      },
      warn: (message: string, options?: any) => {
        return toast.warning(message, options);
      }
    };
    
    // Configurar el ErrorManager para usar nuestro servicio de notificaciones
    errorManager.setNotificationService(notificationService);
    
    // Limpiar al desmontar
    return () => {
      // Crear un servicio vacío en lugar de null para evitar type casting peligroso
      const emptyService: NotificationService = {
        success: () => '',
        error: () => '',
        info: () => '',
        warn: () => ''
      };
      errorManager.setNotificationService(emptyService);
    };
  }, [toast]);
  
  return <>{children}</>;
};

export default ErrorManagerProvider;
