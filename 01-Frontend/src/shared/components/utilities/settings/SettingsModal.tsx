/**
 * SettingsModal.tsx
 * Componente independiente para manejar el modal de configuración global
 * 
 * Este componente debe ser usado a nivel de aplicación
 */

import { AppSettings } from './AppSettings'
import { useAppSettings } from '@/shared/hooks/utilities/useAppSettings'

export function SettingsModal() {
  const { isOpen, closeSettings } = useAppSettings()
  
  return <AppSettings isOpen={isOpen} onClose={closeSettings} />
}