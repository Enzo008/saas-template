/**
 * Hook para capturar el elemento que dispara la apertura de un modal
 * Útil para animaciones que parten desde el botón/elemento trigger
 */
import { useRef, useCallback } from 'react';

export const useModalTrigger = () => {
  const triggerElementRef = useRef<HTMLElement | null>(null);

  /**
   * Callback para capturar el elemento que dispara el modal
   * Usar en el onClick del botón/elemento que abre el modal
   */
  const captureTrigger = useCallback((event: React.MouseEvent<HTMLElement>) => {
    triggerElementRef.current = event.currentTarget;
  }, []);

  /**
   * Limpiar la referencia al trigger
   */
  const clearTrigger = useCallback(() => {
    triggerElementRef.current = null;
  }, []);

  return {
    triggerElement: triggerElementRef.current,
    captureTrigger,
    clearTrigger
  };
};

export default useModalTrigger;
