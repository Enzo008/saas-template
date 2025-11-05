// React se importa automáticamente en los archivos .tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/shared/hooks/ui/useNotifications';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ToastOptions } from 'react-toastify';

/**
 * Componente de ejemplo para demostrar el uso del sistema de notificaciones
 */
const NotificationExample = () => {
  const { t } = useTranslation();
  const toast = useNotifications();
  const [position, setPosition] = useState<'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'>('top-right');

  // Manejadores para mostrar diferentes tipos de notificaciones
  const handleSuccessNotification = () => {
    // Usamos la posición seleccionada por el usuario
    const options: ToastOptions = { position };
    toast.success(t('notifications.success.message'), options);
  };

  const handleErrorNotification = () => {
    const options: ToastOptions = { position };
    toast.error(t('notifications.error.message'), options);
  };

  const handleWarningNotification = () => {
    const options: ToastOptions = { position };
    toast.warning(t('notifications.warning.message'), options);
  };

  const handleInfoNotification = () => {
    const options: ToastOptions = { position };
    toast.info(t('notifications.info.message'), options);
  };

  // Notificación con parámetros dinámicos
  const handleDynamicNotification = () => {
    toast.success(
      t('notifications.dynamic.message'),
      { autoClose: 8000, position }
    );
  };

  // Notificación directa (sin traducción)
  const handleDirectNotification = () => {
    toast.success('Notificación directa', { position });
  };
  
  // Limpiar todas las notificaciones
  const handleClearAll = () => {
    toast.clearAll();
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{t('examples.notifications.title')}</h1>
      
      {/* Selector de posición */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{t('examples.notifications.position')}</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setPosition('top-right')} 
            variant={position === 'top-right' ? 'default' : 'outline'}
          >
            Top Right
          </Button>
          <Button 
            onClick={() => setPosition('top-center')} 
            variant={position === 'top-center' ? 'default' : 'outline'}
          >
            Top Center
          </Button>
          <Button 
            onClick={() => setPosition('bottom-right')} 
            variant={position === 'bottom-right' ? 'default' : 'outline'}
          >
            Bottom Right
          </Button>
          <Button 
            onClick={() => setPosition('bottom-center')} 
            variant={position === 'bottom-center' ? 'default' : 'outline'}
          >
            Bottom Center
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('examples.notifications.types.title')}</CardTitle>
            <CardDescription>
              {t('examples.notifications.types.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleSuccessNotification} className="bg-green-600 hover:bg-green-700">
                {t('examples.notifications.success')}
              </Button>
              <Button onClick={handleErrorNotification} className="bg-red-600 hover:bg-red-700">
                {t('examples.notifications.error')}
              </Button>
              <Button onClick={handleWarningNotification} className="bg-yellow-600 hover:bg-yellow-700">
                {t('examples.notifications.warning')}
              </Button>
              <Button onClick={handleInfoNotification} className="bg-blue-600 hover:bg-blue-700">
                {t('examples.notifications.info')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('examples.notifications.advanced.title')}</CardTitle>
            <CardDescription>
              {t('examples.notifications.advanced.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleDynamicNotification} className="bg-purple-600 hover:bg-purple-700">
                {t('examples.notifications.dynamic')}
              </Button>
              <Button onClick={handleDirectNotification} className="bg-gray-600 hover:bg-gray-700">
                {t('examples.notifications.direct')}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              {t('examples.notifications.footer')}
            </p>
          </CardFooter>
        </Card>
        
        {/* Tarjeta de control */}
        <Card>
          <CardHeader>
            <CardTitle>{t('examples.notifications.control.title')}</CardTitle>
            <CardDescription>
              {t('examples.notifications.control.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleClearAll} 
              className="w-full bg-gray-800 hover:bg-gray-900"
            >
              {t('examples.notifications.clearAll')}
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              {t('examples.notifications.control.footer')}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NotificationExample;
