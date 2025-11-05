/**
 * Configuración centralizada de animaciones con Framer Motion
 * Define transiciones, variantes y utilidades para animaciones consistentes
 */

import { Transition, Variants } from 'framer-motion';

// ==========================================
// UTILIDAD: Detectar preferencia de movimiento reducido
// ==========================================
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ==========================================
// TRANSICIONES ESTANDARIZADAS
// ==========================================
export const transitions = {
  /** Transición para modales - spring suave */
  modal: {
    type: 'spring',
    damping: 25,
    stiffness: 300,
    duration: 0.1
  } as Transition,

  /** Transición para páginas/rutas - tween rápido */
  page: {
    type: 'tween',
    duration: 0.15,
    ease: 'easeInOut'
  } as Transition,

  /** Transición rápida para elementos pequeños */
  fast: {
    type: 'tween',
    duration: 0.15,
    ease: 'easeOut'
  } as Transition,

  /** Transición para sidebar - spring con rebote */
  sidebar: {
    type: 'spring',
    damping: 20,
    stiffness: 200
  } as Transition,

  /** Transición para listas - tween suave */
  list: {
    type: 'tween',
    duration: 0.2,
    ease: 'easeOut'
  } as Transition,

  /** Transición para formularios multi-paso */
  step: {
    type: 'tween',
    duration: 0.25,
    ease: 'easeInOut'
  } as Transition
};

// ==========================================
// VARIANTES DE ANIMACIÓN COMUNES
// ==========================================
export const variants = {
  /** Fade in/out simple */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  } as Variants,

  /** Slide desde abajo hacia arriba */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  } as Variants,

  /** Slide desde arriba hacia abajo */
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  } as Variants,

  /** Slide desde izquierda */
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  } as Variants,

  /** Slide desde derecha */
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  } as Variants,

  /** Scale in/out (zoom) */
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  } as Variants,

  /** Scale desde punto específico (para modales) */
  scaleFromPoint: (x: number, y: number) => ({
    initial: {
      opacity: 0,
      scale: 0,
      x: x - window.innerWidth / 2,
      y: y - window.innerHeight / 2
    },
    animate: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0
    },
    exit: {
      opacity: 0,
      scale: 0,
      x: x - window.innerWidth / 2,
      y: y - window.innerHeight / 2
    }
  }),

  /** Stagger para listas (con delay incremental) */
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  } as Variants,

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  } as Variants
};

// ==========================================
// VARIANTES ESPECÍFICAS POR COMPONENTE
// ==========================================

/** Variantes */
export const routeVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
} as Variants;

/** Variantes para MultiStepForm - slide horizontal */
export const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0
  })
} as Variants;

/** Variantes para Sidebar */
export const sidebarVariants = {
  collapsed: { width: 64 },
  expanded: { width: 280 }
} as Variants;

/** Variantes para Modal backdrop */
export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
} as Variants;

// ==========================================
// UTILIDADES DE ANIMACIÓN
// ==========================================

/**
 * Obtiene la configuración de animación según preferencias del usuario
 * Si el usuario prefiere movimiento reducido, devuelve animaciones deshabilitadas
 */
export const getAnimationConfig = <T extends Record<string, any>>(
  normalConfig: T,
  reducedConfig?: Partial<T>
): T => {
  if (prefersReducedMotion()) {
    return { ...normalConfig, ...reducedConfig } as T;
  }
  return normalConfig;
};

/**
 * Hook para obtener variantes con soporte de movimiento reducido
 */
export const getVariants = (variantName: keyof typeof variants) => {
  if (prefersReducedMotion()) {
    // Sin animaciones, solo fade simple
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    };
  }
  return variants[variantName];
};

/**
 * Hook para obtener transiciones con soporte de movimiento reducido
 */
export const getTransition = (transitionName: keyof typeof transitions) => {
  if (prefersReducedMotion()) {
    // Transición instantánea
    return { duration: 0.01 };
  }
  return transitions[transitionName];
};
