/**
 * useThemeValidation.ts
 * Hook para validar que los componentes usen colores consistentes del sistema de temas
 * 
 * Este hook ayuda a detectar inconsistencias en el uso de colores
 * y proporciona utilidades para mantener la consistencia visual
 */

import { useEffect, useState } from 'react'
import { useTheme } from '@/shared/providers'

interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  input: string
  ring: string
  sidebar: {
    background: string
    foreground: string
    primary: string
    primaryForeground: string
    accent: string
    accentForeground: string
    border: string
    ring: string
  }
}

export function useThemeValidation() {
  const { theme } = useTheme()
  const [themeColors, setThemeColors] = useState<ThemeColors | null>(null)
  
  // Resolver el tema manualmente
  const resolvedTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme

  useEffect(() => {
    // Obtener los valores actuales de las variables CSS
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)

    const colors: ThemeColors = {
      background: computedStyle.getPropertyValue('--background').trim(),
      foreground: computedStyle.getPropertyValue('--foreground').trim(),
      card: computedStyle.getPropertyValue('--card').trim(),
      cardForeground: computedStyle.getPropertyValue('--card-foreground').trim(),
      primary: computedStyle.getPropertyValue('--primary').trim(),
      primaryForeground: computedStyle.getPropertyValue('--primary-foreground').trim(),
      secondary: computedStyle.getPropertyValue('--secondary').trim(),
      secondaryForeground: computedStyle.getPropertyValue('--secondary-foreground').trim(),
      muted: computedStyle.getPropertyValue('--muted').trim(),
      mutedForeground: computedStyle.getPropertyValue('--muted-foreground').trim(),
      accent: computedStyle.getPropertyValue('--accent').trim(),
      accentForeground: computedStyle.getPropertyValue('--accent-foreground').trim(),
      border: computedStyle.getPropertyValue('--border').trim(),
      input: computedStyle.getPropertyValue('--input').trim(),
      ring: computedStyle.getPropertyValue('--ring').trim(),
      sidebar: {
        background: computedStyle.getPropertyValue('--sidebar-background').trim(),
        foreground: computedStyle.getPropertyValue('--sidebar-foreground').trim(),
        primary: computedStyle.getPropertyValue('--sidebar-primary').trim(),
        primaryForeground: computedStyle.getPropertyValue('--sidebar-primary-foreground').trim(),
        accent: computedStyle.getPropertyValue('--sidebar-accent').trim(),
        accentForeground: computedStyle.getPropertyValue('--sidebar-accent-foreground').trim(),
        border: computedStyle.getPropertyValue('--sidebar-border').trim(),
        ring: computedStyle.getPropertyValue('--sidebar-ring').trim(),
      }
    }

    setThemeColors(colors)
  }, [resolvedTheme])

  // Función para validar si el sidebar está usando colores consistentes
  const validateSidebarConsistency = () => {
    if (!themeColors) return { isConsistent: false, issues: ['Theme colors not loaded'] }

    const issues: string[] = []
    
    // Verificar que el sidebar use variables del sistema principal
    if (themeColors.sidebar.background !== themeColors.card) {
      issues.push('Sidebar background should use --card variable')
    }
    
    if (themeColors.sidebar.foreground !== themeColors.cardForeground) {
      issues.push('Sidebar foreground should use --card-foreground variable')
    }
    
    if (themeColors.sidebar.border !== themeColors.border) {
      issues.push('Sidebar border should use --border variable')
    }

    return {
      isConsistent: issues.length === 0,
      issues
    }
  }

  // Función para obtener la clase CSS correcta para un color
  const getThemeClass = (colorType: keyof Omit<ThemeColors, 'sidebar'>) => {
    const classMap = {
      background: 'bg-background',
      foreground: 'text-foreground',
      card: 'bg-card',
      cardForeground: 'text-card-foreground',
      primary: 'bg-primary',
      primaryForeground: 'text-primary-foreground',
      secondary: 'bg-secondary',
      secondaryForeground: 'text-secondary-foreground',
      muted: 'bg-muted',
      mutedForeground: 'text-muted-foreground',
      accent: 'bg-accent',
      accentForeground: 'text-accent-foreground',
      border: 'border-border',
      input: 'bg-input',
      ring: 'ring-ring'
    }
    
    return classMap[colorType] || ''
  }

  // Función para obtener clases CSS recomendadas para diferentes tipos de componentes
  const getRecommendedClasses = (componentType: 'card' | 'button' | 'input' | 'sidebar') => {
    switch (componentType) {
      case 'card':
        return {
          container: 'bg-card text-card-foreground border-border',
          header: 'border-b border-border',
          content: 'text-card-foreground'
        }
      case 'button':
        return {
          primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          ghost: 'hover:bg-accent hover:text-accent-foreground'
        }
      case 'input':
        return {
          base: 'bg-input border-border text-foreground placeholder:text-muted-foreground',
          focus: 'focus:ring-ring focus:border-ring'
        }
      case 'sidebar':
        return {
          container: 'bg-sidebar text-sidebar-foreground border-sidebar-border',
          item: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          active: 'bg-sidebar-accent text-sidebar-accent-foreground'
        }
      default:
        return {}
    }
  }

  return {
    resolvedTheme,
    themeColors,
    validateSidebarConsistency,
    getThemeClass,
    getRecommendedClasses
  }
}

// Hook simplificado para obtener solo las clases CSS recomendadas
export function useThemeClasses() {
  const { getRecommendedClasses } = useThemeValidation()
  return { getRecommendedClasses }
}