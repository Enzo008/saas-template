/**
 * Configuración simplificada de rutas de navegación
 * Reemplaza los múltiples archivos de configuración con uno solo
 */

import { lazy } from 'react';
import type { NavigationRoute } from '../hooks/useNavigation';

// ============================
// RUTAS DEL USUARIO (según permisos)
// ============================

export const userRoutes: Record<string, NavigationRoute> = {
  /** Dashboard principal */
  'dashboard': {
    path: '/dashboard',
    component: lazy(() => import('@/features/dashboard/pages/Dashboard')),
    title: 'Dashboard',
    icon: 'dashboard',
    description: 'Panel principal de la aplicación',
    type: 'user',
    menuRef: 'dashboard'
  },

  /** Gestión de usuarios */
  'user': {
    path: '/user',
    component: lazy(() => import('@/features/user/pages/User')),
    title: 'Usuarios',
    icon: 'user',
    description: 'Administración de usuarios del sistema',
    type: 'user',
    menuRef: 'user'
  },

  /** Gestión de cargos */
  'position': {
    path: '/position',
    component: lazy(() => import('@/features/position/pages/Position')),
    title: 'Cargos',
    icon: 'briefcase',
    description: 'Gestión de cargos y posiciones',
    type: 'user',
    menuRef: 'position'
  },

  /** Gestión de repositorio */
  'program': {
    path: '/program',
    component: lazy(() => import('@/features/repository/pages/Repository')),
    title: 'Repositorio',
    icon: 'briefcase',
    description: 'Gestión de repositorio',
    type: 'user',
    menuRef: 'program'
  }
};

// ============================
// RUTAS STANDALONE (siempre disponibles)
// ============================

export const standaloneRoutes: Record<string, NavigationRoute> = {
};

// ============================
// RUTAS DE EJEMPLOS (siempre disponibles)
// ============================

export const exampleRoutes: Record<string, NavigationRoute> = {
  // ===== RUTAS DE DESARROLLO REMOVIDAS =====
  // Las rutas dev-examples fueron movidas fuera del sistema de navegación principal
  // para evitar exposición accidental en producción
};

// ============================
// RUTAS ADICIONALES POR FEATURE (se activan si tienes acceso a la feature principal)
// ============================

export const featureRoutes: Record<string, Record<string, NavigationRoute>> = {
  /** Rutas adicionales para Users */
  user: {
    'user-create': {
      path: '/user/create',
      component: lazy(() => import('@/features/user/pages/UserMultiStepPage')),
      title: 'Crear',
      icon: 'user-plus',
      description: 'Crear usuario con flujo multi-paso',
      type: 'user'
    },
    'user-edit': {
      path: '/user/edit/:id',
      component: lazy(() => import('@/features/user/pages/UserMultiStepPage')),
      title: 'Editar',
      icon: 'user-edit',
      description: 'Editar usuario con flujo multi-paso',
      type: 'user'
    }
  },
};

// ============================
// CONFIGURACIÓN COMPLETA
// ============================

export const navigationConfig = {
  userRoutes,
  standaloneRoutes,
  exampleRoutes,
  featureRoutes
};
