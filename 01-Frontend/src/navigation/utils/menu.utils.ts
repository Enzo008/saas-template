import { Menu, MenuHierarchy } from "@/auth/types";

/**
 * Transforma una lista plana de menús en una estructura jerárquica
 * @param flatMenus - Lista plana de menús del backend
 * @returns Lista de menús organizados jerárquicamente
 */
export function buildMenuHierarchy(flatMenus: Menu[]): MenuHierarchy[] {
  // Crear un Map para acceso rápido por clave compuesta
  const menuMap = new Map<string, MenuHierarchy>();
  const rootMenus: MenuHierarchy[] = [];

  // Función para crear la clave única del menú
  const getMenuKey = (menYea: string | undefined, menCod: string | undefined): string => `${menYea || ''}-${menCod || ''}`;

  // Primera pasada: crear todos los nodos con estructura inicial
  flatMenus.forEach(menu => {
    const menuKey = getMenuKey(menu.menYea, menu.menCod);
    const hierarchicalMenu: MenuHierarchy = {
      ...menu,
      children: [],
      level: 0 // Se calculará después
    };
    
    menuMap.set(menuKey, hierarchicalMenu);
  });

  // Segunda pasada: construir la jerarquía
  flatMenus.forEach(menu => {
    const menuKey = getMenuKey(menu.menYea, menu.menCod);
    const currentMenu = menuMap.get(menuKey);
    
    if (!currentMenu) return;

    // Si tiene padre, agregarlo como hijo del padre
    if (menu.menYeaPar && menu.menCodPar) {
      const parentKey = getMenuKey(menu.menYeaPar, menu.menCodPar);
      const parentMenu = menuMap.get(parentKey);
      
      if (parentMenu) {
        // Calcular el nivel basado en el padre
        currentMenu.level = parentMenu.level + 1;
        parentMenu.children.push(currentMenu);
      } else {
        // Si no se encuentra el padre, tratarlo como raíz
        rootMenus.push(currentMenu);
      }
    } else {
      // Es un menú raíz
      rootMenus.push(currentMenu);
    }
  });

  // Ordenar menús y submenús recursivamente
  const sortMenus = (menus: MenuHierarchy[]): MenuHierarchy[] => {
    return menus
      .sort((a, b) => {
        // Ordenar por código para mantener consistencia
        return (a.menCod || '').localeCompare(b.menCod || '');
      })
      .map(menu => ({
        ...menu,
        children: sortMenus(menu.children)
      }));
  };

  return sortMenus(rootMenus);
}

/**
 * Obtiene todos los menús de forma plana desde una estructura jerárquica
 * @param hierarchicalMenus - Menús organizados jerárquicamente
 * @returns Lista plana de todos los menús
 */
export function flattenMenuHierarchy(hierarchicalMenus: MenuHierarchy[]): MenuHierarchy[] {
  const result: MenuHierarchy[] = [];

  const traverse = (menus: MenuHierarchy[]) => {
    menus.forEach(menu => {
      result.push(menu);
      if (menu.children.length > 0) {
        traverse(menu.children);
      }
    });
  };

  traverse(hierarchicalMenus);
  return result;
}

/**
 * Busca un menú por menRef en la estructura jerárquica
 * @param hierarchicalMenus - Menús organizados jerárquicamente
 * @param menRef - Referencia del menú a buscar
 * @returns El menú encontrado o undefined
 */
export function findMenuByRef(hierarchicalMenus: MenuHierarchy[], menRef: string): MenuHierarchy | undefined {
  const flatMenus = flattenMenuHierarchy(hierarchicalMenus);
  return flatMenus.find(menu => menu.menRef === menRef);
}

/**
 * Busca un menú por ruta (path) en la estructura jerárquica
 * @param hierarchicalMenus - Menús organizados jerárquicamente
 * @param path - Ruta a buscar (ej: '/user', '/user/create')
 * @returns El menú encontrado o undefined
 */
export function findMenuByPath(hierarchicalMenus: MenuHierarchy[], path: string): MenuHierarchy | undefined {
  const flatMenus = flattenMenuHierarchy(hierarchicalMenus);
  
  // Buscar por menRef exacto primero
  let menu = flatMenus.find(menu => menu.menRef === path);
  
  // Si no se encuentra, buscar por menRef sin la barra inicial
  if (!menu && path.startsWith('/')) {
    const pathWithoutSlash = path.substring(1);
    menu = flatMenus.find(menu => menu.menRef === pathWithoutSlash);
  }
  
  // Si aún no se encuentra, buscar por coincidencia parcial
  if (!menu) {
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      menu = flatMenus.find(menu => menu.menRef === segments[0]);
    }
  }
  
  return menu;
}

/**
 * Obtiene la ruta de breadcrumbs para un menú específico
 * @param hierarchicalMenus - Menús organizados jerárquicamente
 * @param menRef - Referencia del menú
 * @returns Array con la ruta de menús desde la raíz hasta el menú especificado
 */
export function getMenuBreadcrumbPath(hierarchicalMenus: MenuHierarchy[], menRef: string): MenuHierarchy[] {
  const path: MenuHierarchy[] = [];
  
  const findPath = (menus: MenuHierarchy[], targetRef: string, currentPath: MenuHierarchy[]): boolean => {
    for (const menu of menus) {
      const newPath = [...currentPath, menu];
      
      if (menu.menRef === targetRef) {
        path.push(...newPath);
        return true;
      }
      
      if (menu.children.length > 0 && findPath(menu.children, targetRef, newPath)) {
        return true;
      }
    }
    return false;
  };

  findPath(hierarchicalMenus, menRef, []);
  return path;
}
