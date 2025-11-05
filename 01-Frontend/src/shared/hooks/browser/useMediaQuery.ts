import { useState, useEffect } from 'react';

/**
 * Hook para detectar media queries
 * Útil para responsive design, detección de dispositivos, etc.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Usar el método apropiado según el soporte del navegador
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback para navegadores más antiguos
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook para múltiples breakpoints comunes
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1440px)');
  
  // Orientación
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  // Características del dispositivo
  const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');
  const canHover = useMediaQuery('(hover: hover)');
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)');
  const hasFinePointer = useMediaQuery('(pointer: fine)');
  
  // Preferencias del usuario
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');

  return {
    // Tamaños de pantalla
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    
    // Orientación
    isPortrait,
    isLandscape,
    
    // Capacidades del dispositivo
    isTouch,
    canHover,
    hasCoarsePointer,
    hasFinePointer,
    
    // Preferencias del usuario
    prefersReducedMotion,
    prefersDarkMode,
    prefersHighContrast,
    
    // Helpers
    isMobileOrTablet: isMobile || isTablet,
    isDesktopOrLarger: isDesktop || isLargeDesktop
  } as const;
}

/**
 * Hook para detectar cambios en el tamaño de la ventana
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    
    // Llamar inmediatamente para obtener el tamaño inicial
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook para detectar el tipo de dispositivo basado en user agent y características
 */
export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    isWindows: false,
    isMac: false,
    isLinux: false,
    browser: 'unknown'
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detección de SO
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isWindows = /windows/.test(userAgent);
    const isMac = /macintosh|mac os x/.test(userAgent);
    const isLinux = /linux/.test(userAgent) && !isAndroid;
    
    // Detección de dispositivo
    const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    const isTablet = /tablet|ipad|playbook|silk/.test(userAgent);
    const isDesktop = !isMobile && !isTablet;
    
    // Detección de navegador
    let browser = 'unknown';
    if (userAgent.includes('chrome')) browser = 'chrome';
    else if (userAgent.includes('firefox')) browser = 'firefox';
    else if (userAgent.includes('safari')) browser = 'safari';
    else if (userAgent.includes('edge')) browser = 'edge';
    else if (userAgent.includes('opera')) browser = 'opera';

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      isWindows,
      isMac,
      isLinux,
      browser
    });
  }, []);

  return deviceInfo;
}