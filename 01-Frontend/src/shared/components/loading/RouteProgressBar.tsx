/**
 * RouteProgressBar - Barra de progreso para navegación entre rutas
 * Se muestra en la parte superior de la página durante las transiciones
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteProgressBarProps {
  height?: number;
  color?: string;
  duration?: number;
}

export const RouteProgressBar = ({
  height = 2,
  color = 'hsl(var(--primary))',
  duration = 300
}: RouteProgressBarProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setProgress(0);

    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 30;
      });
    }, 50);

    // Completar progreso después del duration
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [location.pathname, duration]);

  if (!isLoading) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-out"
      style={{
        height: `${height}px`,
        background: `linear-gradient(to right, ${color} ${progress}%, transparent ${progress}%)`,
      }}
    />
  );
};

export default RouteProgressBar;