import { create } from 'zustand';
import { buildMenuHierarchy } from '../utils/menu.utils';
import { Menu, MenuHierarchy } from '../types';

// Usar la interfaz Menu del types
export interface MenuItem extends Menu {}

interface MenuState {
  availableMenus: MenuItem[];
  hierarchicalMenus: MenuHierarchy[];
  setMenus: (menus: MenuItem[]) => void;
  clearMenus: () => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  availableMenus: [],
  hierarchicalMenus: [],
  setMenus: (menus: MenuItem[]) => {
    const hierarchical = buildMenuHierarchy(menus);
    set({ 
      availableMenus: menus,
      hierarchicalMenus: hierarchical
    });
  },
  clearMenus: () => set({ 
    availableMenus: [],
    hierarchicalMenus: []
  }),
}));
