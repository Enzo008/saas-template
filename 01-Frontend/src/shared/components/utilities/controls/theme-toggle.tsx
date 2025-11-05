import { Monitor, Moon, Sun } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { useTheme } from "@/shared/providers"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
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
  }, [isOpen])

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">{t('common.theme.select', 'Toggle theme')}</span>
      </Button>

      <div
        ref={dropdownRef}
        className={cn(
          "absolute right-0 min-w-[120px] rounded-lg border bg-popover p-1 shadow-md z-50",
          "transition-all duration-200",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
          "top-full mt-2"
        )}
      >
        <div className="p-1">
          <button
            className={cn(
              "flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground",
              theme === "light" ? "bg-accent text-accent-foreground" : ""
            )}
            onClick={() => handleThemeChange("light")}
          >
            <Sun className="h-4 w-4" />
            <span>{t('common.theme.light')}</span>
          </button>
          <button
            className={cn(
              "flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground",
              theme === "dark" ? "bg-accent text-accent-foreground" : ""
            )}
            onClick={() => handleThemeChange("dark")}
          >
            <Moon className="h-4 w-4" />
            <span>{t('common.theme.dark')}</span>
          </button>
          <button
            className={cn(
              "flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground",
              theme === "system" ? "bg-accent text-accent-foreground" : ""
            )}
            onClick={() => handleThemeChange("system")}
          >
            <Monitor className="h-4 w-4" />
            <span>{t('common.theme.system')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
