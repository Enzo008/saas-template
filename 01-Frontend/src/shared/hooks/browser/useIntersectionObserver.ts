import { useEffect, useRef, useState } from 'react';

/**
 * Hook simple para observar intersección de elementos
 * Reemplazo básico para funcionalidad de lazy loading
 */
interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const elementRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const { triggerOnce, ...observerOptions } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        
        const isInView = entry.isIntersecting;
        setIsIntersecting(isInView);
        
        if (isInView && !hasTriggered) {
          setHasTriggered(true);
          
          // Si triggerOnce es true, desconectar el observer después del primer trigger
          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...observerOptions,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasTriggered, triggerOnce, observerOptions]);

  return {
    elementRef,
    isIntersecting,
    hasTriggered,
    hasIntersected: hasTriggered, // Alias para compatibilidad
  };
}
