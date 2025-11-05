/**
 * useAppSettings.ts
 * Hook para manejar el estado del modal de configuración
 * Usando un enfoque simple con eventos del DOM
 */

import { useState, useEffect } from 'react'

const SETTINGS_MODAL_EVENT = 'settings-modal-toggle'

export function useAppSettings() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleToggle = (event: CustomEvent) => {
      setIsOpen(event.detail.isOpen)
    }

    window.addEventListener(SETTINGS_MODAL_EVENT, handleToggle as EventListener)
    
    return () => {
      window.removeEventListener(SETTINGS_MODAL_EVENT, handleToggle as EventListener)
    }
  }, [])

  const openSettings = () => {
    const event = new CustomEvent(SETTINGS_MODAL_EVENT, {
      detail: { isOpen: true }
    })
    window.dispatchEvent(event)
  }

  const closeSettings = () => {
    const event = new CustomEvent(SETTINGS_MODAL_EVENT, {
      detail: { isOpen: false }
    })
    window.dispatchEvent(event)
  }

  return {
    isOpen,
    openSettings,
    closeSettings
  }
}