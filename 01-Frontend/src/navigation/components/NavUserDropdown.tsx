import { LogOut, Sparkles, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useRef } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { authController } from "@/auth/controllers/authController"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAppSettings } from "@/shared/components/utilities/settings"

interface NavUserDropdownProps {
  user: {
    useNam?: string
    useEma?: string
    useAva?: string | null
  } | null
  isOpen: boolean
  isMobile: boolean
  onClose: () => void
}

export default function NavUserDropdown({ user, isOpen, isMobile, onClose }: NavUserDropdownProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { openSettings } = useAppSettings()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await authController.logout()
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute min-w-[240px] rounded-lg border bg-popover p-1 shadow-md",
        "transition-all duration-200",
        isOpen
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none",
        isMobile
          ? "bottom-full left-0 right-0 mb-2"
          : "bottom-0 left-full ml-2"
      )}
    >
      <div className="border-b p-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0 rounded-lg">
            <AvatarImage src={user?.useAva || undefined} alt={user?.useNam} />
            <AvatarFallback className="rounded-lg">
              {user?.useNam?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="font-medium">{user?.useNam || 'Usuario'}</span>
            <span className="text-xs text-muted-foreground">
              {user?.useEma?.toLowerCase() || 'sin correo'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-1">
        <button
          className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          <Sparkles className="h-4 w-4" />
          <span>Upgrade to Pro</span>
        </button>
      </div>

      <div className="my-1 h-px bg-border" />

      <div className="p-1">
        {/* Configuración de la Aplicación */}
        <button
          className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            openSettings()
            onClose()
          }}
        >
          <Settings className="h-4 w-4" />
          <span>Configuración</span>
        </button>
      </div>

      <div className="p-1">
        <button
          className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
      
    </div>
  )
}
