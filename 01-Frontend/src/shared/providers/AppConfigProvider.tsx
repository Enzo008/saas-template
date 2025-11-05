/**
 * AppConfigProvider.tsx
 * Proveedor de configuración de la aplicación
 * 
 * Maneja:
 * - Paletas de colores personalizadas
 * - Configuración de fuentes
 * - Persistencia en localStorage
 * - Aplicación automática de estilos
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import logger from '@/shared/managers/Logger'

// Definición de paletas de colores disponibles
export interface ColorPalette {
  id: string
  name: string
  description: string
  light: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    muted: string
    mutedForeground: string
    border: string
    destructive: string
    destructiveForeground: string
  }
  dark: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    muted: string
    mutedForeground: string
    border: string
    destructive: string
    destructiveForeground: string
  }
  preview: string // Color principal para preview
}

// Definición de fuentes disponibles
export interface FontConfig {
  id: string
  name: string
  description: string
  fontFamily: string
  weights: number[]
  googleFont?: boolean
  fallback: string
}

// Configuración de la aplicación
export interface AppConfig {
  colorPalette: string
  fontConfig: string
  fontSize: 'small' | 'medium' | 'large'
  compactMode: boolean
}

interface AppConfigContextType {
  config: AppConfig
  availablePalettes: ColorPalette[]
  availableFonts: FontConfig[]
  updateConfig: (updates: Partial<AppConfig>) => void
  resetConfig: () => void
  getCurrentPalette: () => ColorPalette | undefined
  getCurrentFont: () => FontConfig | undefined
}

// Paletas predefinidas con versiones para modo claro y oscuro
const DEFAULT_PALETTES: ColorPalette[] = [
  {
    id: 'default',
    name: 'Por Defecto',
    description: 'Tema clásico en escala de grises',
    preview: 'hsl(240 5.9% 10%)',
    light: {
      primary: 'hsl(240 5.9% 10%)',
      secondary: 'hsl(240 4.8% 95.9%)',
      accent: 'hsl(240 4.8% 95.9%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(240 10% 3.9%)',
      card: 'hsl(0 0% 100%)',
      cardForeground: 'hsl(240 10% 3.9%)',
      muted: 'hsl(240 4.8% 95.9%)',
      mutedForeground: 'hsl(240 3.8% 46.1%)',
      border: 'hsl(240 5.9% 90%)',
      destructive: 'hsl(0 84.2% 60.2%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    },
    dark: {
      primary: 'hsl(0 0% 98%)',
      secondary: 'hsl(240 3.7% 15.9%)',
      accent: 'hsl(240 3.7% 15.9%)',
      background: 'hsl(240 10% 3.9%)',
      foreground: 'hsl(0 0% 98%)',
      card: 'hsl(240 10% 3.9%)',
      cardForeground: 'hsl(0 0% 98%)',
      muted: 'hsl(240 3.7% 15.9%)',
      mutedForeground: 'hsl(240 5% 64.9%)',
      border: 'hsl(240 3.7% 15.9%)',
      destructive: 'hsl(0 62.8% 30.6%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    }
  },
  // ===== 7 PALETAS MÁS POPULARES DE TWEAKCN.COM =====
  {
    id: 'neo-brutalism',
    name: 'Neo Brutalismo',
    description: 'Diseño audaz con contrastes extremos y colores vibrantes',
    preview: 'hsl(47 100% 50%)',
    light: {
      primary: 'hsl(0 0% 0%)',
      secondary: 'hsl(47 100% 50%)',
      accent: 'hsl(120 100% 50%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(0 0% 0%)',
      card: 'hsl(0 0% 100%)',
      cardForeground: 'hsl(0 0% 0%)',
      muted: 'hsl(0 0% 96%)',
      mutedForeground: 'hsl(0 0% 45%)',
      border: 'hsl(0 0% 0%)',
      destructive: 'hsl(0 100% 50%)',
      destructiveForeground: 'hsl(0 0% 100%)'
    },
    dark: {
      primary: 'hsl(47 100% 50%)',
      secondary: 'hsl(0 0% 0%)',
      accent: 'hsl(300 100% 50%)',
      background: 'hsl(0 0% 0%)',
      foreground: 'hsl(0 0% 100%)',
      card: 'hsl(0 0% 5%)',
      cardForeground: 'hsl(0 0% 100%)',
      muted: 'hsl(0 0% 10%)',
      mutedForeground: 'hsl(0 0% 70%)',
      border: 'hsl(47 100% 50%)',
      destructive: 'hsl(0 100% 60%)',
      destructiveForeground: 'hsl(0 0% 0%)'
    }
  },
  {
    id: 'glassmorphism',
    name: 'Cristal Moderno',
    description: 'Efecto glassmorphism con transparencias y blur',
    preview: 'hsl(220 60% 50%)',
    light: {
      primary: 'hsl(220 60% 50%)',
      secondary: 'hsl(220 14% 96%)',
      accent: 'hsl(260 60% 65%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(220 13% 18%)',
      card: 'hsla(0 0% 100% / 0.7)',
      cardForeground: 'hsl(220 13% 18%)',
      muted: 'hsl(220 14% 96%)',
      mutedForeground: 'hsl(220 9% 46%)',
      border: 'hsla(220 13% 91% / 0.3)',
      destructive: 'hsl(0 84% 60%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    },
    dark: {
      primary: 'hsl(220 60% 60%)',
      secondary: 'hsla(220 13% 18% / 0.6)',
      accent: 'hsl(260 60% 70%)',
      background: 'hsl(220 13% 9%)',
      foreground: 'hsl(220 14% 96%)',
      card: 'hsla(220 13% 18% / 0.4)',
      cardForeground: 'hsl(220 14% 96%)',
      muted: 'hsla(220 13% 18% / 0.6)',
      mutedForeground: 'hsl(220 9% 65%)',
      border: 'hsla(220 60% 50% / 0.2)',
      destructive: 'hsl(0 62.8% 30.6%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Futurista con neones magenta y cyan',
    preview: 'hsl(315 100% 50%)',
    light: {
      primary: 'hsl(315 100% 40%)',
      secondary: 'hsl(315 100% 97%)',
      accent: 'hsl(180 100% 40%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(240 10% 3.9%)',
      card: 'hsl(0 0% 100%)',
      cardForeground: 'hsl(240 10% 3.9%)',
      muted: 'hsl(315 100% 97%)',
      mutedForeground: 'hsl(240 3.8% 46.1%)',
      border: 'hsl(315 50% 85%)',
      destructive: 'hsl(0 100% 50%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    },
    dark: {
      primary: 'hsl(315 100% 60%)',
      secondary: 'hsl(240 10% 15%)',
      accent: 'hsl(180 100% 50%)',
      background: 'hsl(240 10% 3.9%)',
      foreground: 'hsl(315 100% 90%)',
      card: 'hsl(240 10% 6%)',
      cardForeground: 'hsl(315 100% 90%)',
      muted: 'hsl(240 10% 15%)',
      mutedForeground: 'hsl(240 5% 65%)',
      border: 'hsl(315 50% 25%)',
      destructive: 'hsl(0 100% 50%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    }
  },
  {
    id: 'sunset-gradient',
    name: 'Atardecer Vibrante',
    description: 'Gradientes cálidos inspirados en atardeceres',
    preview: 'hsl(320 85% 60%)',
    light: {
      primary: 'hsl(320 85% 50%)',
      secondary: 'hsl(45 100% 96%)',
      accent: 'hsl(280 85% 60%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(240 10% 3.9%)',
      card: 'hsl(0 0% 100%)',
      cardForeground: 'hsl(240 10% 3.9%)',
      muted: 'hsl(45 100% 96%)',
      mutedForeground: 'hsl(240 3.8% 46.1%)',
      border: 'hsl(320 30% 90%)',
      destructive: 'hsl(0 84% 60%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    },
    dark: {
      primary: 'hsl(320 85% 65%)',
      secondary: 'hsl(280 30% 15%)',
      accent: 'hsl(280 85% 70%)',
      background: 'hsl(280 30% 6%)',
      foreground: 'hsl(320 85% 95%)',
      card: 'hsl(280 30% 8%)',
      cardForeground: 'hsl(320 85% 95%)',
      muted: 'hsl(280 30% 15%)',
      mutedForeground: 'hsl(280 15% 65%)',
      border: 'hsl(280 30% 20%)',
      destructive: 'hsl(0 62.8% 30.6%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    }
  },
  {
    id: 'forest-green',
    name: 'Verde Bosque',
    description: 'Paleta natural inspirada en bosques profundos',
    preview: 'hsl(140 60% 30%)',
    light: {
      primary: 'hsl(140 60% 30%)',
      secondary: 'hsl(140 30% 96%)',
      accent: 'hsl(160 50% 40%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(140 60% 15%)',
      card: 'hsl(0 0% 100%)',
      cardForeground: 'hsl(140 60% 15%)',
      muted: 'hsl(140 30% 96%)',
      mutedForeground: 'hsl(140 20% 50%)',
      border: 'hsl(140 30% 85%)',
      destructive: 'hsl(0 84% 60%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    },
    dark: {
      primary: 'hsl(140 60% 50%)',
      secondary: 'hsl(140 30% 15%)',
      accent: 'hsl(160 50% 60%)',
      background: 'hsl(140 30% 6%)',
      foreground: 'hsl(140 30% 95%)',
      card: 'hsl(140 30% 8%)',
      cardForeground: 'hsl(140 30% 95%)',
      muted: 'hsl(140 30% 15%)',
      mutedForeground: 'hsl(140 15% 65%)',
      border: 'hsl(140 30% 20%)',
      destructive: 'hsl(0 62.8% 30.6%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    }
  },
  {
    id: 'ocean-blue',
    name: 'Azul Océano',
    description: 'Tonos profundos del océano con acentos turquesa',
    preview: 'hsl(200 100% 40%)',
    light: {
      primary: 'hsl(200 100% 40%)',
      secondary: 'hsl(200 100% 96%)',
      accent: 'hsl(180 100% 35%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(200 100% 15%)',
      card: 'hsl(0 0% 100%)',
      cardForeground: 'hsl(200 100% 15%)',
      muted: 'hsl(200 100% 96%)',
      mutedForeground: 'hsl(200 50% 45%)',
      border: 'hsl(200 50% 85%)',
      destructive: 'hsl(0 84% 60%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    },
    dark: {
      primary: 'hsl(200 100% 60%)',
      secondary: 'hsl(200 50% 15%)',
      accent: 'hsl(180 100% 50%)',
      background: 'hsl(200 50% 6%)',
      foreground: 'hsl(200 100% 95%)',
      card: 'hsl(200 50% 8%)',
      cardForeground: 'hsl(200 100% 95%)',
      muted: 'hsl(200 50% 15%)',
      mutedForeground: 'hsl(200 25% 65%)',
      border: 'hsl(200 50% 20%)',
      destructive: 'hsl(0 62.8% 30.6%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    }
  },
  {
    id: 'midnight-purple',
    name: 'Púrpura Medianoche',
    description: 'Elegante púrpura profundo con toques místicos',
    preview: 'hsl(260 60% 45%)',
    light: {
      primary: 'hsl(260 60% 45%)',
      secondary: 'hsl(260 30% 96%)',
      accent: 'hsl(280 70% 55%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(260 60% 15%)',
      card: 'hsl(0 0% 100%)',
      cardForeground: 'hsl(260 60% 15%)',
      muted: 'hsl(260 30% 96%)',
      mutedForeground: 'hsl(260 20% 50%)',
      border: 'hsl(260 30% 85%)',
      destructive: 'hsl(0 84% 60%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    },
    dark: {
      primary: 'hsl(260 60% 65%)',
      secondary: 'hsl(260 30% 15%)',
      accent: 'hsl(280 70% 70%)',
      background: 'hsl(260 30% 6%)',
      foreground: 'hsl(260 30% 95%)',
      card: 'hsl(260 30% 8%)',
      cardForeground: 'hsl(260 30% 95%)',
      muted: 'hsl(260 30% 15%)',
      mutedForeground: 'hsl(260 15% 65%)',
      border: 'hsl(260 30% 20%)',
      destructive: 'hsl(0 62.8% 30.6%)',
      destructiveForeground: 'hsl(0 0% 98%)'
    }
  }
]

// Fuentes predefinidas
const DEFAULT_FONTS: FontConfig[] = [
  {
    id: 'inter',
    name: 'Inter',
    description: 'Fuente moderna y legible (por defecto)',
    fontFamily: 'Inter',
    weights: [400, 500, 600, 700],
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    description: 'Fuente clásica de Google',
    fontFamily: 'Roboto',
    weights: [300, 400, 500, 700],
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    description: 'Fuente geométrica y amigable',
    fontFamily: 'Poppins',
    weights: [300, 400, 500, 600, 700],
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'source-sans',
    name: 'Source Sans Pro',
    description: 'Fuente profesional de Adobe',
    fontFamily: 'Source Sans Pro',
    weights: [300, 400, 600, 700],
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'system',
    name: 'Sistema',
    description: 'Fuente del sistema operativo',
    fontFamily: 'system-ui',
    weights: [400, 500, 600, 700],
    googleFont: false,
    fallback: '-apple-system, BlinkMacSystemFont, sans-serif'
  }
]

const DEFAULT_CONFIG: AppConfig = {
  colorPalette: 'default',
  fontConfig: 'inter',
  fontSize: 'medium',
  compactMode: false
}

const STORAGE_KEY = 'saas-app-config'

const AppConfigContext = createContext<AppConfigContextType | null>(null)

interface AppConfigProviderProps {
  children: ReactNode
}

export function AppConfigProvider({ children }: AppConfigProviderProps) {
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG
    } catch {
      return DEFAULT_CONFIG
    }
  })

  // Aplicar configuración al DOM (excepto paletas que se manejan por separado)
  useEffect(() => {
    logger.debug('AppConfigProvider - Aplicando configuración: fuentes, tamaño, modo compacto', {
      component: 'AppConfigProvider',
      action: 'apply_config'
    })
    
    const root = document.documentElement

    // Aplicar fuente
    const font = DEFAULT_FONTS.find(f => f.id === config.fontConfig)
    if (font) {
      root.style.setProperty('--font-family', `${font.fontFamily}, ${font.fallback}`)
      document.body.style.fontFamily = `${font.fontFamily}, ${font.fallback}`
    }

    // Aplicar tamaño de fuente
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    }
    root.style.setProperty('--base-font-size', fontSizes[config.fontSize])
    root.style.fontSize = fontSizes[config.fontSize]

    // Aplicar modo compacto
    root.classList.toggle('compact-mode', config.compactMode)

  }, [config.fontConfig, config.fontSize, config.compactMode])

  // Cargar Google Fonts dinámicamente
  useEffect(() => {
    const font = DEFAULT_FONTS.find(f => f.id === config.fontConfig)
    if (font?.googleFont) {
      const linkId = 'google-font-link'
      let link = document.getElementById(linkId) as HTMLLinkElement

      if (!link) {
        link = document.createElement('link')
        link.id = linkId
        link.rel = 'stylesheet'
        document.head.appendChild(link)
      }

      const weights = font.weights.join(',')
      link.href = `https://fonts.googleapis.com/css2?family=${font.fontFamily.replace(' ', '+')}:wght@${weights}&display=swap`
    }
  }, [config.fontConfig])

  const updateConfig = (updates: Partial<AppConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))
  }

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG)
    localStorage.removeItem(STORAGE_KEY)
  }

  const getCurrentPalette = () => {
    return DEFAULT_PALETTES.find(p => p.id === config.colorPalette)
  }

  const getCurrentFont = () => {
    return DEFAULT_FONTS.find(f => f.id === config.fontConfig)
  }

  const value: AppConfigContextType = {
    config,
    availablePalettes: DEFAULT_PALETTES,
    availableFonts: DEFAULT_FONTS,
    updateConfig,
    resetConfig,
    getCurrentPalette,
    getCurrentFont
  }

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  )
}

export const useAppConfig = () => {
  const context = useContext(AppConfigContext)
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider')
  }
  return context
}