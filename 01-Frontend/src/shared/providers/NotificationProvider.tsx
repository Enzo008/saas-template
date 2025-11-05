import { createContext, useContext, ReactNode, useEffect } from 'react';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';

// Tipo para el contexto de notificaciones
interface NotificationContextType {
  success: (title: string, message?: string, options?: ToastOptions) => string;
  error: (title: string, message?: string, options?: ToastOptions) => string;
  warning: (title: string, message?: string, options?: ToastOptions) => string;
  info: (title: string, message?: string, options?: ToastOptions) => string;
  clearAll: () => void;
}

// Crear el contexto
const NotificationContext = createContext<NotificationContextType | null>(null);

// Props para el proveedor
interface NotificationProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  autoClose?: number;
  maxNotifications?: number;
}

/**
 * Proveedor de notificaciones que integra useNotifications con react-toastify
 */
export const NotificationProvider = ({
  children,
  position = 'top-right',
  autoClose = 5000,
  maxNotifications = 5
}: NotificationProviderProps) => {
  // Usamos el hook de traducción para mensajes internacionalizados
  // Crear funciones de notificación directamente con react-toastify
  const createToastNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    options?: ToastOptions
  ) => {
    const content = message ? (
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
    ) : title;

    return toast[type](content, {
      position,
      autoClose,
      ...options
    });
  };
  
  // Limpiar todas las notificaciones cuando se desmonta el componente
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);
  
  // NOTA: La configuración de ErrorManager se maneja en ErrorManagerProvider
  // para evitar duplicación de responsabilidades

  // Métodos expuestos
  const contextValue: NotificationContextType = {
    success: (title, message, options) => createToastNotification('success', title, message, options) as string,
    error: (title, message, options) => createToastNotification('error', title, message, options) as string,
    warning: (title, message, options) => createToastNotification('warning', title, message, options) as string,
    info: (title, message, options) => createToastNotification('info', title, message, options) as string,
    clearAll: () => {
      toast.dismiss();
    }
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        position={position}
        autoClose={autoClose}
        limit={maxNotifications}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        containerId="toast-container"
      />
    </NotificationContext.Provider>
  );
};

/**
 * Hook para usar el sistema de notificaciones
 */
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotificationContext debe ser usado dentro de un NotificationProvider');
  }
  
  return context;
};
