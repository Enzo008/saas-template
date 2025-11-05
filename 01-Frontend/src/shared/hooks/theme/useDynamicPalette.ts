/**
 * Hook para aplicar paletas de colores dinámicamente
 * Maneja la aplicación de variables CSS sin interferir con el theme provider
 */

import { useEffect } from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import type { ColorPalette } from '../../providers/AppConfigProvider';

export function useDynamicPalette(palette: ColorPalette | undefined) {
  const { theme } = useTheme();

  useEffect(() => {
    if (!palette) return;

    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Seleccionar los colores según el tema actual
    const colors = isDark ? palette.dark : palette.light;

    // Aplicar las variables CSS dinámicamente
    Object.entries(colors).forEach(([key, value]) => {
      // Convertir camelCase a kebab-case para CSS variables
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });

    // Agregar clase de paleta para identificación
    root.classList.remove(...Array.from(root.classList).filter(cls => cls.startsWith('palette-')));
    root.classList.add(`palette-${palette.id}`);

  }, [palette, theme]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      const root = document.documentElement;
      root.classList.remove(...Array.from(root.classList).filter(cls => cls.startsWith('palette-')));
    };
  }, []);
}

/**
 * Hook para aplicar una paleta específica por ID
 */
export function usePaletteById(paletteId: string, availablePalettes: ColorPalette[]) {
  const palette = availablePalettes.find(p => p.id === paletteId);
  useDynamicPalette(palette);
  return palette;
}