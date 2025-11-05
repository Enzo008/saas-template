/**
 * Hook unificado y simplificado para navegación
 * Elimina NavigationManager y toda la duplicación de estado
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenuStore } from '../store';
import { navigationConfig } from '../config/navigationConfig';
import { findMenuByPath, getMenuBreadcrumbPath } from '../utils/menu.utils';
import type { MenuHierarchy } from '../types';

/**
 * Tipos para las rutas generadas
 */
export interface NavigationRoute {
  path: string;
  component: React.ComponentType;
  title: string;
  icon?: string;
  description?: string;
  type: 'user' | 'standalone' | 'example';
  menuRef?: string;
}

/**
 * Tipos para los menús del sidebar
 */
export interface SidebarMenu {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  children?: SidebarMenu[];
  isActive?: boolean;
  hasActiveChild?: boolean;
}

/**
 * Tipos para breadcrumbs
 */
export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: string;
  isClickable?: boolean;
}

/**
 * Hook principal de navegación - SIMPLIFICADO
 */
export const useNavigation = () => {
  const location = useLocation();
  const hierarchicalMenus = useMenuStore(state => state.hierarchicalMenus);

  // ==========================================
  // 1. GENERAR RUTAS ACCESIBLES
  // ==========================================
  const routes = useMemo(() => {
    const accessibleRoutes: NavigationRoute[] = [];
    
    // Extraer todos los menRefs del usuario (recursivo)
    const extractMenuRefs = (menus: MenuHierarchy[]): string[] => {
      const refs: string[] = [];
      menus.forEach(menu => {
        if (menu.menRef && menu.menRef !== '#' && menu.menRef.trim() !== '') {
          refs.push(menu.menRef);
        }
        if (menu.children?.length > 0) {
          refs.push(...extractMenuRefs(menu.children));
        }
      });
      return refs;
    };
    
    const userMenuRefs = extractMenuRefs(hierarchicalMenus);
    
    // 1. Rutas del usuario (según permisos)
    userMenuRefs.forEach(menuRef => {
      const route = navigationConfig.userRoutes[menuRef];
      if (route) {
        accessibleRoutes.push(route);
      }
    });

    // 2. Rutas adicionales por feature (si tiene acceso a la feature principal)
    userMenuRefs.forEach(menuRef => {
      const featureRoutes = navigationConfig.featureRoutes[menuRef];
      if (featureRoutes) {
        accessibleRoutes.push(...Object.values(featureRoutes));
      }
    });

    // 3. Rutas standalone (siempre disponibles)
    accessibleRoutes.push(...Object.values(navigationConfig.standaloneRoutes));
    
    // Feature routes de standalone también
    Object.keys(navigationConfig.standaloneRoutes).forEach(menuRef => {
      const featureRoutes = navigationConfig.featureRoutes[menuRef];
      if (featureRoutes) {
        accessibleRoutes.push(...Object.values(featureRoutes));
      }
    });

    // 4. Rutas de ejemplos (siempre disponibles)
    accessibleRoutes.push(...Object.values(navigationConfig.exampleRoutes));

    return accessibleRoutes;
  }, [hierarchicalMenus]);

  // ==========================================
  // 2. GENERAR MENÚS DEL SIDEBAR
  // ==========================================
  const sidebarMenus = useMemo(() => {
    const convertToSidebarMenu = (menu: MenuHierarchy): SidebarMenu | null => {
      // Procesar hijos recursivamente
      const children: SidebarMenu[] = [];
      if (menu.children?.length > 0) {
        menu.children.forEach(child => {
          const converted = convertToSidebarMenu(child);
          if (converted) children.push(converted);
        });
      }

      // Verificar si tiene ruta asociada
      const route = navigationConfig.userRoutes[menu.menRef || ''];

      // Solo incluir si tiene ruta O tiene hijos con rutas
      if (!route && children.length === 0) {
        return null;
      }

      const isActive = route?.path ? location.pathname === route.path : false;
      const hasActiveChild = children.some(child => child.isActive || child.hasActiveChild);

      const sidebarMenu: SidebarMenu = {
        id: `${menu.menYea || 'menu'}-${menu.menCod || 'item'}`,
        title: menu.menNam || 'Sin nombre',
        isActive,
        hasActiveChild
      };

      if (children.length > 0) {
        sidebarMenu.children = children;
      }

      if (route) {
        sidebarMenu.path = route.path;
        if (route.icon) {
          sidebarMenu.icon = route.icon;
        }
      }

      return sidebarMenu;
    };

    const menus: SidebarMenu[] = [];
    hierarchicalMenus.forEach(menu => {
      const converted = convertToSidebarMenu(menu);
      if (converted) menus.push(converted);
    });

    // Agregar rutas standalone al sidebar
    Object.values(navigationConfig.standaloneRoutes).forEach(route => {
      const isActive = location.pathname === route.path;
      const menu: SidebarMenu = {
        id: route.menuRef || route.path,
        title: route.title,
        path: route.path,
        isActive
      };
      if (route.icon) {
        menu.icon = route.icon;
      }
      menus.push(menu);
    });

    return menus;
  }, [hierarchicalMenus, location.pathname]);

  // ==========================================
  // 3. UTILIDADES
  // ==========================================
  const isPathActive = useMemo(() => {
    return (path: string): boolean => location.pathname === path;
  }, [location.pathname]);

  const getRouteMetadata = useMemo(() => {
    return (path: string) => {
      // Buscar en todas las rutas
      const allRoutes = [
        ...Object.values(navigationConfig.userRoutes),
        ...Object.values(navigationConfig.standaloneRoutes),
        ...Object.values(navigationConfig.exampleRoutes),
        ...Object.values(navigationConfig.featureRoutes).flatMap(fr => Object.values(fr))
      ];

      const route = allRoutes.find(r => r.path === path);
      if (route) {
        return {
          title: route.title,
          icon: route.icon,
          type: route.type
        };
      }
      return null;
    };
  }, []);

  // ==========================================
  // 4. GENERAR BREADCRUMBS
  // ==========================================
  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);

    // Caso 1: Home
    if (path === '/') {
      return [{ label: 'Home', path: '/', icon: 'home', isClickable: false }];
    }

    // Preparar todas las rutas disponibles
    const allRoutes = [
      ...Object.values(navigationConfig.userRoutes),
      ...Object.values(navigationConfig.standaloneRoutes),
      ...Object.values(navigationConfig.exampleRoutes),
      ...Object.values(navigationConfig.featureRoutes).flatMap(fr => Object.values(fr))
    ];

    // Helper: Construir breadcrumbs desde menús jerárquicos
    const buildMenuBreadcrumbs = (menuPath: string): BreadcrumbItem[] => {
      const matchingMenu = findMenuByPath(hierarchicalMenus, menuPath);
      if (!matchingMenu) return [];

      const breadcrumbPath = getMenuBreadcrumbPath(hierarchicalMenus, matchingMenu.menRef || '');
      return breadcrumbPath.map((menu, index, array) => {
        const isLast = index === array.length - 1;
        const menuPath = menu.menRef?.startsWith('/') ? menu.menRef : `/${menu.menRef || ''}`;
        
        // Verificar si este menú tiene una ruta asociada en navigationConfig
        const hasRoute = navigationConfig.userRoutes[menu.menRef || ''];
        
        const crumb: BreadcrumbItem = {
          label: menu.menNam || 'Sin nombre',
          path: menuPath,
          // Solo es clickeable si NO es el último Y tiene una ruta asociada
          isClickable: !isLast && !!hasRoute
        };
        if (menu.menIco) crumb.icon = menu.menIco;
        return crumb;
      });
    };

    // Caso 2: Ruta principal de menú (ej: /user, /form)
    const mainRoute = allRoutes.find(r => r.path === path);
    if (mainRoute && segments.length === 1) {
      // Es una ruta principal, buscar en menús jerárquicos
      const menuBreadcrumbs = buildMenuBreadcrumbs(path);
      if (menuBreadcrumbs.length > 0) {
        return menuBreadcrumbs;
      }
      
      // Si no está en menús (ej: standalone), crear breadcrumb simple
      const crumb: BreadcrumbItem = {
        label: mainRoute.title,
        path: mainRoute.path,
        isClickable: false
      };
      if (mainRoute.icon) crumb.icon = mainRoute.icon;
      return [crumb];
    }

    // Caso 3: Feature route (ej: /user/create, /form/edit/123)
    if (segments.length >= 2) {
      const crumbs: BreadcrumbItem[] = [];
      const parentPath = `/${segments[0]}`;
      
      // 1. Agregar breadcrumbs del menú padre (si existe en hierarchicalMenus)
      const parentMenuBreadcrumbs = buildMenuBreadcrumbs(parentPath);
      if (parentMenuBreadcrumbs.length > 0) {
        // Agregar los breadcrumbs del menú padre
        crumbs.push(...parentMenuBreadcrumbs);
        
        // IMPORTANTE: El último breadcrumb del menú padre ahora NO es el último total
        // porque vamos a agregar la feature route después.
        // Recalcular isClickable del último breadcrumb del menú padre
        if (crumbs.length > 0) {
          const lastIndex = crumbs.length - 1;
          const lastParentCrumb = crumbs[lastIndex];
          if (lastParentCrumb) {
            // Verificar si tiene ruta asociada
            const lastParentPath = lastParentCrumb.path;
            const hasRoute = allRoutes.find(r => r.path === lastParentPath);
            if (hasRoute) {
              lastParentCrumb.isClickable = true;
            }
          }
        }
      } else {
        // Si no está en menús, buscar en rutas standalone
        const parentRoute = allRoutes.find(r => r.path === parentPath);
        if (parentRoute) {
          const parentCrumb: BreadcrumbItem = {
            label: parentRoute.title,
            path: parentRoute.path,
            isClickable: true
          };
          if (parentRoute.icon) parentCrumb.icon = parentRoute.icon;
          crumbs.push(parentCrumb);
        }
      }
      
      // 2. Agregar breadcrumb de la feature route actual
      // Buscar ruta exacta o con parámetros
      let currentRoute = allRoutes.find(r => r.path === path);
      
      // Si no se encuentra, buscar ruta con parámetros (ej: /user/edit/:id)
      if (!currentRoute && segments.length >= 2) {
        const routePattern = `/${segments[0]}/${segments[1]}/:id`;
        currentRoute = allRoutes.find(r => r.path === routePattern);
      }
      
      if (currentRoute) {
        const currentCrumb: BreadcrumbItem = {
          label: currentRoute.title,
          path: path,
          isClickable: false
        };
        if (currentRoute.icon) currentCrumb.icon = currentRoute.icon;
        crumbs.push(currentCrumb);
      } else {
        // Fallback: crear breadcrumb desde el segmento
        const action = segments[1] || '';
        let label = action.charAt(0).toUpperCase() + action.slice(1);
        if (action === 'create') label = 'Crear';
        if (action === 'edit') label = 'Editar';
        
        crumbs.push({
          label,
          path,
          isClickable: false
        });
      }
      
      return crumbs;
    }

    // Caso 4: Fallback - crear breadcrumbs básicos desde segmentos
    return segments.map((segment, index) => {
      const isLast = index === segments.length - 1;
      const segmentPath = '/' + segments.slice(0, index + 1).join('/');
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      if (segment === 'create') label = 'Crear';
      if (segment === 'edit') label = 'Editar';
      
      return {
        label,
        path: segmentPath,
        isClickable: !isLast
      };
    });
  }, [location.pathname, hierarchicalMenus]);

  return {
    routes,
    sidebarMenus,
    breadcrumbs,
    isPathActive,
    getRouteMetadata,
    currentPath: location.pathname,
    hierarchicalMenus
  };
};

/**
 * Hook específico para React Router
 */
export const useRoutes = () => {
  const { routes } = useNavigation();
  
  return useMemo(() => {
    return routes.map(route => ({
      path: route.path,
      element: route.component,
      exact: route.path === '/'
    }));
  }, [routes]);
};

/**
 * Hook específico para el sidebar
 */
export const useSidebarNavigation = () => {
  const { sidebarMenus, isPathActive } = useNavigation();
  
  return {
    menus: sidebarMenus,
    isPathActive
  };
};
